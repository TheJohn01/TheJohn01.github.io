// Registo das artes ASCII. Cada peça é um ficheiro .txt em src/assets/ascii/day,
// com uma versão opcional para o modo escuro em src/assets/ascii/dusk (mesmo nome).
// Este módulo é usado no servidor (para escrever a arte no HTML) e no browser (versões escuras, para a animação).

const day = import.meta.glob<string>('../assets/ascii/day/*.txt', {
  query: '?raw',
  import: 'default',
  eager: true,
});
const dusk = import.meta.glob<string>('../assets/ascii/dusk/*.txt', {
  query: '?raw',
  import: 'default',
  eager: true,
});

export type Theme = 'day' | 'dusk';

function byName(files: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [path, text] of Object.entries(files)) {
    const name = path.split('/').pop()?.replace(/\.txt$/, '');
    if (name) out[name] = text;
  }
  return out;
}

// PURE: o browser só usa ART_DUSK, por isso o build deixa a arte clara fora do JavaScript.
export const ART_DAY = /*#__PURE__*/ byName(day);
export const ART_DUSK = /*#__PURE__*/ byName(dusk);

/** Texto da arte para o tema pedido. Sem versão escura, usa a clara. */
export function artFor(name: string, theme: Theme = 'day'): string {
  const text = (theme === 'dusk' ? ART_DUSK[name] : undefined) ?? ART_DAY[name];
  if (text === undefined) throw new Error(`Arte ASCII desconhecida: "${name}"`);
  return text;
}
