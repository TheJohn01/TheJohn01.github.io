// Ponto de entrada do JavaScript do site (incluído em Base.astro).
import { initAscii } from './ascii-condense';
import { currentTheme, initThemeToggle } from './theme-toggle';

const ascii = initAscii(currentTheme);

initThemeToggle(() => {
  ascii.repaint();
  ascii.replayVisible();
});

// Linha de progresso por baixo do cabeçalho. O CSS trata dela com linhas do tempo de scroll;
// onde isso não existe (ou com movimento reduzido), acompanha o scroll aqui.
const cssDrivesProgress =
  CSS.supports('animation-timeline: scroll()') && !matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!cssDrivesProgress) {
  const root = document.documentElement;
  let queued = false;
  const update = (): void => {
    queued = false;
    const max = root.scrollHeight - innerHeight;
    root.style.setProperty('--progress', String(max > 0 ? Math.min(1, scrollY / max) : 0));
  };
  root.classList.add('js-progress');
  update();
  addEventListener(
    'scroll',
    () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  addEventListener('resize', update);
}
