// Animação de "condensação" da arte ASCII: os caracteres aparecem de cima para baixo,
// passando por uma rampa de caracteres leves, como gotas a formarem-se.
// Corre quando a peça entra no ecrã, ao passar o rato por cima e ao trocar de tema.
import { ART_DUSK, accentsFor, joinTones, toneAt, type Theme } from '../lib/ascii';

const RAMP = " .'-:~;=+*cvxo";
const DURATION_MS = 1400;
/** Largura da faixa de caracteres "em formação" (0–1). */
const BAND = 0.16;

export interface AsciiController {
  /** Volta a desenhar as peças paradas (ex.: depois de mudar de tema). */
  repaint(): void;
  /** Repete a animação nas peças visíveis no ecrã. */
  replayVisible(): void;
}

export function initAscii(getTheme: () => Theme): AsciiController {
  // Guardado por elemento (não pelo nome da arte): duas peças com a mesma arte animam cada uma.
  // A versão clara vem do próprio HTML, para não ir também no JavaScript.
  // Numa peça em camadas de tom, cada camada guarda o texto completo (a junção das camadas) e a sua faixa.
  const day = new Map<HTMLElement, string>();
  const toneOfEl = new Map<HTMLElement, number>();
  for (const el of document.querySelectorAll<HTMLElement>('pre[data-ascii]')) {
    const tone = el.dataset['tone'];
    if (tone === undefined) {
      day.set(el, el.textContent ?? '');
      continue;
    }
    const layers = [...(el.parentElement?.querySelectorAll<HTMLElement>('pre[data-tone]') ?? [])];
    day.set(el, joinTones(layers.map((layer) => layer.textContent ?? '')));
    toneOfEl.set(el, Number(tone));
  }

  let reduced = false;
  try {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    // matchMedia indisponível: assume movimento normal.
  }

  const progress = new Map<HTMLElement, number>();
  const startedAt = new Map<HTMLElement, number>();
  const visible = new Set<HTMLElement>();
  const seen = new WeakSet<HTMLElement>();
  const thresholdCache = new Map<string, Float32Array>();
  const marksCache = new Map<string, string>();
  let raf = 0;

  /** Texto da arte para o tema atual. Sem versão escura, usa a clara. */
  /** Tema da peça: o do site, salvo as peças que ficam sempre claras (data-light-only). */
  function themeOf(el: HTMLElement): Theme {
    return el.dataset['lightOnly'] === undefined ? getTheme() : 'day';
  }

  function source(el: HTMLElement): string {
    const light = day.get(el) ?? '';
    return themeOf(el) === 'dusk' ? (ART_DUSK[el.dataset['ascii'] ?? ''] ?? light) : light;
  }

  /** Limiar de cada carácter: metade aleatório (fixo), metade pela linha (de cima para baixo). */
  function thresholds(text: string): Float32Array {
    const cached = thresholdCache.get(text);
    if (cached) return cached;
    const lines = text.split('\n').length;
    const out = new Float32Array(text.length);
    let row = 0;
    for (let i = 0; i < text.length; i++) {
      if (text.charCodeAt(i) === 10) {
        row++;
        continue;
      }
      const hash = (((i * 2654435761) >>> 0) % 1000) / 1000;
      out[i] = 0.55 * hash + 0.45 * (row / lines) * 0.98;
    }
    thresholdCache.set(text, out);
    return out;
  }

  function frame(el: HTMLElement, p: number | undefined): string {
    const text = source(el);
    const tone = toneOfEl.get(el);
    const variant = el.dataset['accents'];
    const key = `${variant ?? ''}|${themeOf(el)}|${el.dataset['ascii'] ?? ''}`;
    let marks = variant ? marksCache.get(key) : '';
    if (marks === undefined) {
      marks = accentsFor(variant, themeOf(el), text);
      marksCache.set(key, marks);
    }
    const done = p === undefined || p >= 1;
    if (done && tone === undefined) return text;
    const limits = thresholds(text);
    const shift = Math.floor((p ?? 1) * 60);
    let out = '';
    for (let i = 0; i < text.length; i++) {
      const ch = text.charAt(i);
      if (ch === '\n' || ch === ' ') {
        out += ch;
        continue;
      }
      // Camada de tom: só os caracteres da sua faixa (pelo carácter final, para a cor não saltar).
      if (tone !== undefined && toneAt(ch, marks.charAt(i)) !== tone) {
        out += ' ';
        continue;
      }
      if (done) {
        out += ch;
        continue;
      }
      const h = limits[i] ?? 1;
      out += h < p ? ch : h < p + BAND ? RAMP.charAt((i * 7 + shift) % RAMP.length) : ' ';
    }
    return out;
  }

  function paint(el: HTMLElement): void {
    el.textContent = frame(el, progress.get(el));
  }

  function step(now: number): void {
    raf = 0;
    let active = false;
    for (const [el, t0] of startedAt) {
      const value = Math.min(1, (now - t0) / DURATION_MS);
      if (progress.get(el) !== value) {
        progress.set(el, value);
        paint(el);
      }
      if (value < 1) active = true;
      else startedAt.delete(el);
    }
    if (active) raf = requestAnimationFrame(step);
  }

  function start(el: HTMLElement): void {
    if (reduced) return;
    startedAt.set(el, performance.now());
    progress.set(el, 0);
    paint(el);
    if (!raf) raf = requestAnimationFrame(step);
  }

  function repaint(): void {
    for (const el of day.keys()) if (!startedAt.has(el)) paint(el);
  }

  // Primeiro desenho: troca para a versão escura, se for o caso.
  repaint();

  for (const wrapper of document.querySelectorAll<HTMLElement>('.art-hover')) {
    // Todas as camadas da peça (sem tons, só uma) começam juntas.
    const layers = [...wrapper.querySelectorAll<HTMLElement>('pre[data-ascii]')];
    wrapper.addEventListener('mouseenter', () => {
      for (const el of layers) if (!startedAt.has(el)) start(el);
    });
  }

  if (!reduced && 'IntersectionObserver' in window) {
    for (const el of day.keys()) {
      progress.set(el, 0);
      paint(el);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            visible.add(el);
            if (!seen.has(el)) {
              seen.add(el);
              start(el);
            }
          } else {
            visible.delete(el);
          }
        }
      },
      { threshold: 0.2 },
    );
    for (const el of day.keys()) observer.observe(el);
  }

  // A arte estava escondida até agora (ver Base.astro) para não piscar antes da animação.
  document.documentElement.classList.remove('ascii-pending');

  return {
    repaint,
    replayVisible() {
      for (const el of visible) start(el);
    },
  };
}
