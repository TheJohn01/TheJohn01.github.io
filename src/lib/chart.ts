// Funções partilhadas pelos gráficos (src/components/charts).

const NUMBER = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 2 });

/** Número em português (vírgula decimal, espaço nos milhares). */
export function fmt(value: number): string {
  return NUMBER.format(value);
}

/** Marcas "redondas" para um eixo linear, entre min e max (ex.: 0, 20, 40…). */
export function niceTicks(min: number, max: number, count = 5): number[] {
  const span = max - min || 1;
  const raw = span / count;
  const power = 10 ** Math.floor(Math.log10(raw));
  const step = ([1, 2, 2.5, 5, 10].find((m) => m * power >= raw) ?? 10) * power;
  const ticks: number[] = [];
  for (let t = Math.ceil(min / step) * step; t <= max + step * 1e-9; t += step) {
    ticks.push(Number(t.toFixed(10)));
  }
  return ticks;
}

/** Potências de 10 entre min e max, para um eixo logarítmico. */
export function logTicks(min: number, max: number): number[] {
  const ticks: number[] = [];
  for (let e = Math.floor(Math.log10(min)); e <= Math.ceil(Math.log10(max)); e++) ticks.push(10 ** e);
  return ticks;
}
