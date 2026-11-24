// Ponto de entrada do JavaScript do site (incluído em Base.astro).
import { initAscii } from './ascii-condense';
import { currentTheme, initThemeToggle } from './theme-toggle';

const ascii = initAscii(currentTheme);

initThemeToggle(() => {
  ascii.repaint();
  ascii.replayVisible();
});
