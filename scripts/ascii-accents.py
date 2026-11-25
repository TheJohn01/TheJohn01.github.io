"""Accent maps for hand-drawn ASCII art (Dewpoint study): which characters take a non-blue colour.

A map has the art's grid: ' ' keeps the density tone, 'g' leaf, 'y' sun, 'w' white glint.
Regions are rectangles (rows and columns inclusive); only drawn characters are marked, and a rule
can take only the light characters (. ' -). Rendered scenes (battery, industry, wine) get their maps
from ascii-scene.py.

    python scripts/ascii-accents.py      # writes src/assets/ascii/accents/<variant>[.dusk].txt
"""
import os

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'src', 'assets', 'ascii')
LIGHT = ".'-"

# variant: (art name, theme, [(rows, cols, accent, only_light)])
MAPS = {
    # CO2 -> methanol: the sphere is the machine-learning model; it gets the one sun glint.
    'plant': ('plant', 'day', [((11, 15), (38, 46), 'y', False)]),
    'plant.dusk': ('plant', 'dusk', [((10, 14), (37, 45), 'y', False)]),
}

for variant, (name, theme, rules) in MAPS.items():
    art = open(os.path.join(ROOT, theme, f'{name}.txt'), encoding='utf8').read().split('\n')
    out = []
    for y, line in enumerate(art):
        row = ''
        for x, ch in enumerate(line):
            mark = ' '
            for (r0, r1), (c0, c1), accent, only_light in rules:
                if ch != ' ' and r0 <= y <= r1 and c0 <= x <= c1 and (not only_light or ch in LIGHT):
                    mark = accent
            row += mark
        out.append(row.rstrip())
    os.makedirs(os.path.join(ROOT, 'accents'), exist_ok=True)
    open(os.path.join(ROOT, 'accents', f'{variant}.txt'), 'w', encoding='utf8', newline='\n').write('\n'.join(out))
    print(variant, sum(row.count(a) for row in out for a in 'gyw'), 'marked')
