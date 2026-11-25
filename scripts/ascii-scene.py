"""Ray-traced 3D scenes -> ASCII art for the site (needs numpy).

Each scene is built from boxes, spheres and cylinders, lit by the sun with shadows and a
fill light, then sampled into characters. One render gives both versions, in the same box:
day (light mode, ink = darkness) and dusk (dark mode, ink = light).

    python scripts/ascii-scene.py battery            # writes src/assets/ascii/{day,dusk}/battery.txt
    python scripts/ascii-scene.py industry --out DIR --show

Scenes:
  industry  Bondalti section: a generic plant (column, tanks, sphere, pipe rack, stack) behind an
            operator console whose screen shows a checklist test. Nothing from the real plant (NDA).
  battery   Digital twin project: four large cylindrical battery cells on a base plate.
"""
import argparse
import os
import numpy as np

SS = 4                       # samples per character cell side
CELL_W, CELL_H = 0.6, 1.09   # JetBrains Mono advance and the site's line-height (em)
RAMP = " .'-:~;=+*cvx"
EPS = 1e-4
INF = 1e9
I3 = np.eye(3)


def norm(v):
    return v / np.linalg.norm(v, axis=-1, keepdims=True)


def rot_x(a):
    c, s = np.cos(a), np.sin(a)
    return np.array([[1, 0, 0], [0, c, -s], [0, s, c]])


def rot_y(a):
    c, s = np.cos(a), np.sin(a)
    return np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]])


def rot_z(a):
    c, s = np.cos(a), np.sin(a)
    return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])


HORIZ = rot_z(np.pi / 2)     # cylinder axis (local y) -> world -x


class Prim:
    """A canonical primitive in a local frame: world = R @ local + c. mat: 0 plain, 1 patterned, 2 ground.
    accent: '' or a colour accent for the Dewpoint study ('g' leaf, 'y' sun), written to the accent map."""

    def __init__(self, kind, c, size, R=I3, mat=0, accent=''):
        self.kind, self.c, self.size, self.R, self.mat = kind, np.array(c, float), size, R, mat
        self.accent = accent

    def hit(self, o, d):
        """Returns t (INF where missed) and the world normal."""
        lo = (o - self.c) @ self.R          # R^T (o - c), row vectors
        ld = d @ self.R
        n = np.zeros_like(lo)
        t = np.full(lo.shape[0], INF)
        if self.kind == 'box':
            h = np.array(self.size, float)
            with np.errstate(divide='ignore', invalid='ignore'):
                inv = 1.0 / ld
                t1, t2 = (-h - lo) * inv, (h - lo) * inv
            tn, tf = np.minimum(t1, t2), np.maximum(t1, t2)
            tnear, tfar = tn.max(1), tf.min(1)
            ok = (tnear <= tfar) & (tfar > EPS)
            tt = np.where(tnear > EPS, tnear, tfar)
            t = np.where(ok, tt, INF)
            p = lo + ld * t[:, None]
            ax = np.argmax(np.abs(p) / h, axis=1)
            n[np.arange(len(n)), ax] = np.sign(p[np.arange(len(n)), ax])
        elif self.kind == 'sphere':
            r = self.size
            b = (lo * ld).sum(1)
            cc = (lo * lo).sum(1) - r * r
            disc = b * b - cc
            sq = np.sqrt(np.maximum(disc, 0))
            t0, t1 = -b - sq, -b + sq
            tt = np.where(t0 > EPS, t0, t1)
            t = np.where((disc >= 0) & (tt > EPS), tt, INF)
            n = lo + ld * t[:, None]
        elif self.kind == 'cyl':   # axis = local y, radius r, from y=0 to y=hgt, capped
            r, hgt = self.size
            a = ld[:, 0] ** 2 + ld[:, 2] ** 2
            b = lo[:, 0] * ld[:, 0] + lo[:, 2] * ld[:, 2]
            cc = lo[:, 0] ** 2 + lo[:, 2] ** 2 - r * r
            disc = b * b - a * cc
            sq = np.sqrt(np.maximum(disc, 0))
            with np.errstate(divide='ignore', invalid='ignore'):
                ts = [(-b - sq) / a, (-b + sq) / a]
                tcap = [(0 - lo[:, 1]) / ld[:, 1], (hgt - lo[:, 1]) / ld[:, 1]]
            best = np.full(len(t), INF)
            nb = np.zeros_like(lo)
            for tc in ts:
                y = lo[:, 1] + ld[:, 1] * tc
                ok = (disc >= 0) & (a > 1e-12) & (tc > EPS) & (y >= 0) & (y <= hgt) & (tc < best)
                p = lo + ld * tc[:, None]
                best = np.where(ok, tc, best)
                nb = np.where(ok[:, None], p * np.array([1, 0, 1]), nb)
            for tc, ny in zip(tcap, (-1, 1)):
                p = lo + ld * tc[:, None]
                ok = (tc > EPS) & (p[:, 0] ** 2 + p[:, 2] ** 2 <= r * r) & (tc < best)
                best = np.where(ok, tc, best)
                nb = np.where(ok[:, None], np.array([0, ny, 0]), nb)
            t, n = best, nb
        n = n @ self.R.T
        return t, norm(n + 1e-12)


class Scene:
    def __init__(self, size, eye, look, fov, sun, fade, pattern=None):
        self.W, self.H = size                 # characters, cropped to the drawing afterwards
        self.eye, self.look, self.fov = np.array(eye, float), np.array(look, float), fov
        self.sun = norm(np.array(sun, float))
        self.fade = fade                      # ground ellipse (cx, cz, rx, rz): it fades out past it
        self.pattern = pattern                # (scene, points) -> (value 0..1, mask) for mat 1
        self.prims = []

    def add(self, *a, **k):
        self.prims.append(Prim(*a, **k))

    def ids(self, mat):
        return [i for i, q in enumerate(self.prims) if q.mat == mat]

    def trace(self, o, d):
        t = np.full(len(o), INF)
        n = np.zeros_like(o)
        mid = np.full(len(o), -1)
        for i, p in enumerate(self.prims):
            tt, nn = p.hit(o, d)
            closer = tt < t
            t = np.where(closer, tt, t)
            n = np.where(closer[:, None], nn, n)
            mid = np.where(closer, i, mid)
        return t, n, mid


# ---------- scenes (y up, metres-ish) ----------

def industry():
    s = Scene((150, 40), eye=(3.6, 5.6, 15.0), look=(1.6, 2.9, -2.0), fov=0.36,
              sun=(-0.7, 0.75, 0.3), fade=(1.6, -2.0, 10.5, 5.5))
    s.add('box', (1.2, -0.1, -2.4), (30.0, 0.1, 20.0), mat=2)          # ground
    # distillation column with platforms and a dome
    s.add('cyl', (-5.0, 0, -3.6), (0.8, 7.4))
    s.add('sphere', (-5.0, 7.4, -3.6), 0.8)
    for y in (2.2, 4.4, 6.4):
        s.add('cyl', (-5.0, y, -3.6), (1.1, 0.12))
    s.add('cyl', (8.6, 0, -5.8), (0.34, 8.6))                          # stack
    s.add('cyl', (4.2, 0, -4.2), (1.45, 2.9))                          # storage tanks
    s.add('cyl', (7.4, 0, -2.6), (1.1, 2.2))
    s.add('sphere', (1.0, 3.9, -6.0), 1.4)                             # sphere tank on legs
    for dx, dz in ((-0.9, -0.9), (0.9, -0.9), (-0.9, 0.9), (0.9, 0.9)):
        s.add('box', (1.0 + dx, 1.4, -6.0 + dz), (0.09, 1.4, 0.09))
    # pipe rack: posts, a beam and three pipes along x, from the column to the tanks
    for x in (-4.0, -0.4, 3.2, 6.6):
        s.add('box', (x, 1.6, -1.8), (0.1, 1.6, 0.1))
    s.add('box', (1.3, 3.25, -1.8), (5.5, 0.08, 0.35))
    for dz, r in ((-0.22, 0.16), (0.05, 0.12), (0.28, 0.1)):
        s.add('cyl', (7.0, 3.33 + r, -1.8 + dz), (r, 11.6), R=HORIZ)
    # operator console in front: desk and a tilted screen, turned towards the camera
    turn = rot_y(0.12)
    con = np.array([0.2, 0, 1.6])
    s.add('box', con + turn @ [0, 0.45, 0], (1.7, 0.45, 0.6), R=turn)
    s.add('box', con + turn @ np.array([0, 2.15, -0.05]), (2.1, 1.25, 0.06), R=turn @ rot_x(-0.32), mat=1)
    s.add('box', con + turn @ [0, 0.95, 0.05], (0.12, 0.2, 0.08), R=turn)  # screen stand

    def checklist(scene, p):
        """The console screen: 1 = glass, 0 = dark mark (checkbox, text line, frame)."""
        q = scene.prims[scene.ids(1)[0]]
        hx, hy, hz = q.size
        lp = (p - q.c) @ q.R
        u = (lp[:, 0] / hx + 1) / 2          # 0..1 left -> right
        v = (1 - lp[:, 1] / hy) / 2          # 0..1 top -> bottom
        front = lp[:, 2] > hz * 0.9
        row = np.floor(v * 3.4 - 0.2)
        fv = v * 3.4 - 0.2 - row
        inrow = (row >= 0) & (row < 3) & (fv > 0.2) & (fv < 0.8)
        box = inrow & (u > 0.07) & (u < 0.17)
        lengths = np.array([0.86, 0.64, 0.76])
        line = inrow & (u > 0.24) & (u < lengths[np.clip(row, 0, 2).astype(int)])
        edge = (u < 0.03) | (u > 0.97) | (v < 0.05) | (v > 0.95)
        return np.where(box | line | edge, 0.0, 1.0), front, box

    s.pattern = checklist
    return s


def battery():
    s = Scene((190, 62), eye=(5.0, 6.6, 12.5), look=(0.2, 1.8, 0.0), fov=0.36,
              sun=(-0.6, 0.75, 0.45), fade=(0.4, 0.0, 7.0, 2.8))
    s.add('box', (0, -0.1, 0), (30.0, 0.1, 20.0), mat=2)               # ground
    s.add('box', (0, 0.1, 0), (5.6, 0.1, 1.35))                        # base plate
    # four large cylindrical cells: body, a raised band near the top, the positive terminal
    for x in (-3.9, -1.3, 1.3, 3.9):
        s.add('cyl', (x, 0.2, 0), (1.0, 3.6))
        s.add('cyl', (x, 3.0, 0), (1.04, 0.22), accent='g')
        s.add('cyl', (x, 3.8, 0), (0.36, 0.2), accent='y')
    return s


SCENES = {'industry': industry, 'battery': battery}


# ---------- rendering ----------

def render(s):
    W, H = s.W, s.H
    fwd = norm(s.look - s.eye)
    right = norm(np.cross(fwd, [0, 1, 0]))
    up = np.cross(right, fwd)
    aspect = (W * CELL_W) / (H * CELL_H)
    xs = (np.arange(W * SS) + 0.5) / (W * SS) * 2 - 1
    ys = 1 - (np.arange(H * SS) + 0.5) / (H * SS) * 2
    X, Y = np.meshgrid(xs * aspect * s.fov, ys * s.fov)
    d = norm(fwd + X.reshape(-1, 1) * right + Y.reshape(-1, 1) * up)
    o = np.broadcast_to(s.eye, d.shape).copy()
    t, n, mid = s.trace(o, d)
    hit = t < INF
    p = o + d * t[:, None]
    n = np.where((n * d).sum(1, keepdims=True) > 0, -n, n)
    lam = np.clip(n @ s.sun, 0, 1)
    so = p + n * 2e-3
    ts, _, _ = s.trace(so, np.broadcast_to(s.sun, so.shape).copy())
    lit = ts >= INF
    sky = 0.5 + 0.5 * n[:, 1]                     # hemisphere fill light
    L = 0.12 + 0.18 * sky + 0.7 * lam * lit
    accent = np.zeros(len(p), int)                # 0 none, 1 leaf, 2 sun (Dewpoint study)
    for i, q in enumerate(s.prims):
        if q.accent:
            accent = np.where(hit & (mid == i), ' gy'.index(q.accent), accent)
    if s.pattern:
        glass, front, leafy = s.pattern(s, p)
        marked = hit & np.isin(mid, s.ids(1)) & front
        accent = np.where(marked & leafy, 1, accent)
    else:
        glass, marked = np.ones(len(p)), np.zeros(len(p), bool)
    ground = hit & np.isin(mid, s.ids(2))
    # The ground shows only near the subject and fades out (no hard edges).
    cx, cz, rx, rz = s.fade
    fade = np.clip(1 - ((p[:, 0] - cx) / rx) ** 2 - ((p[:, 2] - cz) / rz) ** 2, 0, 1) ** 0.7
    shape = (H, SS, W, SS)
    return dict(L=L, fade=fade, ground=ground, lit=lit, hit=hit, mid=mid, glass=glass,
                marked=marked, accent=accent, cell=lambda a: a.reshape(shape).mean((1, 3)), shape=shape)


def to_ascii(r, mode):
    L, hit, glass, marked = r['L'], r['hit'], r['glass'], r['marked']
    if mode == 'day':
        ink = 0.06 + 0.8 * (1 - L) ** 1.3
        ink = np.where(marked, np.where(glass > 0.5, 0.0, 0.95), ink)
        ink = np.where(r['ground'], np.where(r['lit'], 0.1, 0.45) * r['fade'], ink)
    else:
        ink = 0.08 + 0.92 * L ** 0.9
        ink = np.where(marked, np.where(glass > 0.5, 0.85, 0.12), ink)
        ink = np.where(r['ground'], np.where(r['lit'], 0.3, 0.06) * r['fade'], ink)
    ink = np.where(hit, ink, 0.0)
    cov = r['cell'](hit.astype(float))
    val = r['cell'](ink) / np.maximum(cov, 1e-9)
    # Outlines: cells where the object under the samples changes get a little more ink.
    # (Ground and empty background count as one, so the fading ground gets no outline.)
    mid = np.where(r['ground'], -1, r['mid']).reshape(r['shape'])
    mixed = mid.min((1, 3)) != mid.max((1, 3))
    val = np.where(mixed & (cov > 0.2), np.minimum(1, val + 0.12), val)
    val = val * np.clip(cov * 1.6, 0, 1)
    idx = np.where(cov < 0.22, 0, np.clip(np.round(val * (len(RAMP) - 1)), 0, len(RAMP) - 1)).astype(int)
    return [''.join(RAMP[i] for i in row).rstrip() for row in idx]


def to_accents(r, day, dusk):
    """Accent map in the same grid: 'g' (leaf) or 'y' (sun) where a third of a drawn cell has that accent."""
    leaf = r['cell']((r['accent'] == 1).astype(float))
    sun = r['cell']((r['accent'] == 2).astype(float))
    lines = []
    for y in range(len(day)):
        row = ''
        for x in range(leaf.shape[1]):
            drawn = day[y][x:x + 1].strip() or dusk[y][x:x + 1].strip()
            g, u = leaf[y, x], sun[y, x]
            row += ('g' if g >= u else 'y') if drawn and max(g, u) >= 0.3 else ' '
        lines.append(row.rstrip())
    return lines


def boxed(day, dusk, *extra):
    """Same box for both (and for any accent map): crop the shared empty border, pad to equal width."""
    rows = [i for i in range(len(day)) if day[i].strip() or dusk[i].strip()]
    a, b = rows[0], rows[-1] + 1
    day, dusk = day[a:b], dusk[a:b]
    left = min(len(l) - len(l.lstrip()) for l in day + dusk if l.strip())
    width = max(len(l) for l in day + dusk) - left
    fix = lambda ls: '\n'.join(l[left:].ljust(width) for l in ls)
    return (fix(day), fix(dusk)) + tuple(fix(e[a:b]) for e in extra)


if __name__ == '__main__':
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('scene', choices=SCENES)
    ap.add_argument('--out', help='write NAME_day.txt / NAME_dusk.txt here instead of src/assets/ascii')
    ap.add_argument('--show', action='store_true', help='print both versions')
    args = ap.parse_args()
    r = render(SCENES[args.scene]())
    day_lines, dusk_lines = to_ascii(r, 'day'), to_ascii(r, 'dusk')
    day, dusk, accents = boxed(day_lines, dusk_lines, to_accents(r, day_lines, dusk_lines))
    assert day.count('\n') == dusk.count('\n')
    assert {len(l) for l in day.split('\n')} == {len(l) for l in dusk.split('\n')}
    root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'src', 'assets', 'ascii')
    for theme, txt in (('day', day), ('dusk', dusk)):
        path = (os.path.join(args.out, f'{args.scene}_{theme}.txt') if args.out
                else os.path.join(root, theme, f'{args.scene}.txt'))
        open(path, 'w', encoding='utf8', newline='\n').write(txt)
    if accents.strip():   # accent map for the Dewpoint study (same grid), used by <AsciiArt accents=...>
        path = (os.path.join(args.out, f'{args.scene}_accents.txt') if args.out
                else os.path.join(root, 'accents', f'{args.scene}.txt'))
        os.makedirs(os.path.dirname(path), exist_ok=True)
        open(path, 'w', encoding='utf8', newline='\n').write(accents)
    if args.show:
        print(day, '=' * 40, dusk, sep='\n')
