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
    // Sem \r: um checkout no Windows pode trazer CRLF, que muda a altura da arte e a animação.
    if (name) out[name] = text.replace(/\r/g, '');
  }
  return out;
}

// PURE: o browser só usa ART_DUSK, por isso o build deixa a arte clara fora do JavaScript.
export const ART_DAY = /*#__PURE__*/ byName(day);
export const ART_DUSK = /*#__PURE__*/ byName(dusk);

// Tons Dewpoint: cada carácter pertence a uma faixa de densidade, desenhada numa camada
// própria com a sua cor. 0 = leve (. ' -), 1 = média (: ~ ; = +), 2 = densa (o resto: * c v x o O).
// Um mapa de acentos (src/assets/ascii/accents) pode pôr caracteres noutras camadas:
// 3 = folha (g), 4 = sol (y), 5 = brilho branco (w).
export const TONE_COUNT = 3;
export const ACCENT_TONE_COUNT = 6;
const LIGHT = ".'-";
const MID = ':~;=+';
const ACCENT_MARKS = 'gyw';

const accentFiles = import.meta.glob<string>('../assets/ascii/accents/*.txt', {
  query: '?raw',
  import: 'default',
  eager: true,
});
const ACCENTS = /*#__PURE__*/ byName(accentFiles);

/** Faixa de densidade de um carácter visível. */
export function toneOf(ch: string): number {
  return LIGHT.includes(ch) ? 0 : MID.includes(ch) ? 1 : 2;
}

/** Camada de um carácter visível, com a marca do mapa de acentos na mesma posição (ou espaço). */
export function toneAt(ch: string, mark: string): number {
  const accent = ACCENT_MARKS.indexOf(mark);
  return accent >= 0 && mark !== '' ? 3 + accent : toneOf(ch);
}

/**
 * Mapa de acentos alinhado com o texto (o mesmo comprimento, carácter a carácter), ou '' sem mapa.
 * Usa "<variante>.dusk" no tema escuro, se existir.
 */
export function accentsFor(variant: string | undefined, theme: Theme, text: string): string {
  const file = variant ? ((theme === 'dusk' ? ACCENTS[`${variant}.dusk`] : undefined) ?? ACCENTS[variant]) : undefined;
  if (file === undefined) return '';
  const map = file.split('\n');
  return text
    .split('\n')
    .map((line, row) => (map[row] ?? '').padEnd(line.length).slice(0, line.length))
    .join('\n');
}

/** Diz se a peça tem mapa de acentos em algum dos temas (e, por isso, as camadas de acento). */
export function hasAccents(variant: string | undefined): boolean {
  return variant !== undefined && (variant in ACCENTS || `${variant}.dusk` in ACCENTS);
}

/**
 * Uma cópia do texto por camada: os caracteres das outras camadas passam a espaços (a grelha mantém-se).
 * `layered` dá as 6 camadas mesmo sem acentos neste tema, para os do outro tema terem onde ir.
 */
export function splitTones(text: string, accents = '', layered = accents !== ''): string[] {
  const count = layered ? ACCENT_TONE_COUNT : TONE_COUNT;
  return Array.from({ length: count }, (_, tone) =>
    text.replace(/[^\s]/g, (ch, i: number) => (toneAt(ch, accents.charAt(i)) === tone ? ch : ' ')),
  );
}

/** O inverso de splitTones: junta as camadas, carácter a carácter. */
export function joinTones(layers: string[]): string {
  const first = layers[0] ?? '';
  let out = '';
  for (let i = 0; i < first.length; i++) {
    out += layers.map((layer) => layer.charAt(i)).find((ch) => ch !== ' ') ?? ' ';
  }
  return out;
}

/** Texto da arte para o tema pedido. Sem versão escura, usa a clara. */
export function artFor(name: string, theme: Theme = 'day'): string {
  const text = (theme === 'dusk' ? ART_DUSK[name] : undefined) ?? ART_DAY[name];
  if (text === undefined) throw new Error(`Arte ASCII desconhecida: "${name}"`);
  return text;
}
