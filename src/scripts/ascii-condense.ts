// Animação de "condensação" da arte ASCII: os caracteres aparecem de cima para baixo,
// passando por uma rampa de caracteres leves, como gotas a formarem-se.
// Corre quando a peça entra no ecrã, ao passar o rato por cima e ao trocar de tema.
import { ART_DAY, ART_DUSK, type Theme } from '../lib/ascii';

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
  const pres = new Map<string, HTMLElement>();
  for (const el of document.querySelectorAll<HTMLElement>('[data-ascii]')) {
    const key = el.dataset['ascii'];
    if (key) pres.set(key, el);
  }

  let reduced = false;
  try {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    // matchMedia indisponível: assume movimento normal.
  }

  const progress = new Map<string, number>();
  const startedAt = new Map<string, number>();
  const visible = new Set<string>();
  const seen = new WeakSet<Element>();
  const thresholdCache = new Map<string, Float32Array>();
  let raf = 0;

  function source(key: string): string {
    return (getTheme() === 'dusk' ? ART_DUSK[key] : undefined) ?? ART_DAY[key] ?? '';
  }

  /** Limiar de cada carácter: metade aleatório (fixo), metade pela linha (de cima para baixo). */
  function thresholds(key: string, text: string): Float32Array {
    const cacheKey = `${key}:${getTheme()}`;
    const cached = thresholdCache.get(cacheKey);
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
    thresholdCache.set(cacheKey, out);
    return out;
  }

  function frame(key: string, p: number | undefined): string {
    const text = source(key);
    if (p === undefined || p >= 1) return text;
    const limits = thresholds(key, text);
    const shift = Math.floor(p * 60);
    let out = '';
    for (let i = 0; i < text.length; i++) {
      const ch = text.charAt(i);
      if (ch === '\n' || ch === ' ') {
        out += ch;
        continue;
      }
      const h = limits[i] ?? 1;
      out += h < p ? ch : h < p + BAND ? RAMP.charAt((i * 7 + shift) % RAMP.length) : ' ';
    }
    return out;
  }

  function paint(key: string): void {
    const el = pres.get(key);
    if (el) el.textContent = frame(key, progress.get(key));
  }

  function step(now: number): void {
    raf = 0;
    let active = false;
    for (const [key, t0] of startedAt) {
      const value = Math.min(1, (now - t0) / DURATION_MS);
      if (progress.get(key) !== value) {
        progress.set(key, value);
        paint(key);
      }
      if (value < 1) active = true;
      else startedAt.delete(key);
    }
    if (active) raf = requestAnimationFrame(step);
  }

  function start(key: string): void {
    if (reduced) return;
    startedAt.set(key, performance.now());
    progress.set(key, 0);
    paint(key);
    if (!raf) raf = requestAnimationFrame(step);
  }

  function repaint(): void {
    for (const key of pres.keys()) if (!startedAt.has(key)) paint(key);
  }

  // Primeiro desenho: troca para a versão escura, se for o caso.
  repaint();

  for (const wrapper of document.querySelectorAll<HTMLElement>('.art-hover')) {
    const key = wrapper.querySelector<HTMLElement>('[data-ascii]')?.dataset['ascii'];
    if (!key) continue;
    wrapper.addEventListener('mouseenter', () => {
      if (!startedAt.has(key)) start(key);
    });
  }

  if (!reduced && 'IntersectionObserver' in window) {
    for (const key of pres.keys()) {
      progress.set(key, 0);
      paint(key);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const key = (entry.target as HTMLElement).dataset['ascii'];
          if (!key) continue;
          if (entry.isIntersecting) {
            visible.add(key);
            if (!seen.has(entry.target)) {
              seen.add(entry.target);
              start(key);
            }
          } else {
            visible.delete(key);
          }
        }
      },
      { threshold: 0.2 },
    );
    for (const el of pres.values()) observer.observe(el);
  }

  // A arte estava escondida até agora (ver Base.astro) para não piscar antes da animação.
  document.documentElement.classList.remove('ascii-pending');

  return {
    repaint,
    replayVisible() {
      for (const key of visible) start(key);
    },
  };
}
