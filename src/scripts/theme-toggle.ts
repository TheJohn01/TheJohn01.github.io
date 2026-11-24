// Botão de tema claro/escuro.
// O tema inicial é aplicado cedo por um script em Base.astro (para não piscar);
// aqui só se trata do clique e do estado aria-pressed.
import type { Theme } from '../lib/ascii';

const STORAGE_KEY = 'dp-theme';
const TRANSITION_MS = 650;

const root = document.documentElement;

export function currentTheme(): Theme {
  return root.classList.contains('dusk') ? 'dusk' : 'day';
}

/** Liga o botão #theme-toggle. `onChange` corre depois de cada troca. */
export function initThemeToggle(onChange: (theme: Theme) => void): void {
  const button = document.getElementById('theme-toggle');
  if (!button) return;

  const sync = (): void => {
    button.setAttribute('aria-pressed', String(currentTheme() === 'dusk'));
  };
  sync();

  button.addEventListener('click', () => {
    const next: Theme = currentTheme() === 'dusk' ? 'day' : 'dusk';
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Sem acesso ao armazenamento (ex.: modo privado): o tema muda na mesma.
    }
    root.classList.add('theming');
    root.classList.toggle('dusk', next === 'dusk');
    sync();
    window.setTimeout(() => root.classList.remove('theming'), TRANSITION_MS);
    onChange(next);
  });
}
