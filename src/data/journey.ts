// Percurso: experiência, formação, competências e idiomas.
// A publicação aparece automaticamente no cartão "Formação" (vem de src/content/publications).

export interface ExperienceItem {
  period: string;
  role: string;
  organization: string;
  text: string;
}

export interface EducationItem {
  period: string;
  title: string;
  organization: string;
  text: string;
}

export interface SkillGroup {
  label: string;
  items: readonly string[];
}

export interface Language {
  name: string;
  /** Nível de 0 a 5, desenhado como [#####]. */
  level: 0 | 1 | 2 | 3 | 4 | 5;
  /** Texto curto ao lado da barra. */
  short: string;
  /** Texto lido pelos leitores de ecrã. */
  spoken: string;
}

// Do mais recente para o mais antigo.
export const experience: readonly ExperienceItem[] = [
  {
    period: 'Julho — agosto de 2026',
    role: 'Estágio de verão',
    organization: 'Bondalti Chemicals, Estarreja',
    text: 'Na área de Produção de Anilina e Derivados, desenvolvi em Power Apps, Power Automate e SharePoint uma plataforma que gera testes para avaliar os conhecimentos dos operadores da instalação de mononitrobenzeno (MNB).',
  },
  {
    period: 'Agosto de 2026',
    role: 'Assistente de laboratório (sazonal)',
    organization: 'Casa de Nabais, Seara, Ponte de Lima',
    text: 'Preparação e padronização de soluções e reagentes de análise durante a campanha de vindima. Controlo de qualidade de mostos e vinhos (pH, acidez total, SO₂, grau alcoólico) e acompanhamento das fermentações.',
  },
  {
    period: 'Julho de 2024',
    role: 'Estágio de verão',
    organization: 'Simoldes Plásticos, Oliveira de Azeméis',
    text: 'Análises laboratoriais de formaldeído na indústria de polímeros. Fiz a revisão integral do protocolo de análise e reescrevi-o, com modificações e acrescentos, para o tornar mais claro.',
  },
  {
    period: 'Agosto — setembro de 2023',
    role: 'Estágio de verão',
    organization: 'INL — International Iberian Nanotechnology Laboratory, Braga',
    text: 'Investigação em tratamento de efluentes. Estudei a injeção de ozono na remoção de micropoluentes e, numa segunda fase, fiz ensaios de adsorção com azul de metileno.',
  },
];

export const education: readonly EducationItem[] = [
  {
    period: 'Set. 2025 — presente',
    title: 'Mestrado em Engenharia Química',
    organization: 'FEUP, Universidade do Porto',
    text: 'Em curso. Disponível para trabalhar a partir de meados de 2027.',
  },
  {
    period: 'Set. 2021 — jul. 2026',
    title: 'Licenciatura em Engenharia Química',
    organization: 'FEUP, Universidade do Porto',
    text: 'Último ano a tempo parcial, em paralelo com o 1.º ano do mestrado.',
  },
];

export const skills: readonly SkillGroup[] = [
  { label: 'Simulação', items: ['Aspen Plus'] },
  { label: 'Programação e dados', items: ['Python', 'MATLAB', 'Scilab'] },
  {
    label: 'Laboratório',
    items: ['Espetroscopia UV-Vis', 'Controlo de qualidade', 'Preparação de soluções'],
  },
  { label: 'Processos', items: ['Tratamento de efluentes', 'Ozonização catalítica', 'Adsorção'] },
  {
    label: 'Software',
    items: ['Excel', 'Power Apps', 'Power Automate', 'SharePoint', 'Microsoft Lists'],
  },
];

export const languages: readonly Language[] = [
  { name: 'Português', level: 5, short: 'nativo', spoken: 'Nativo' },
  { name: 'Inglês', level: 4, short: 'C1', spoken: 'C1' },
];
