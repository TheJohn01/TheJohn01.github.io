// Textos da página inicial: apresentação, resumo e destaque da indústria.

export interface Fact {
  term: string;
  value: string;
}

export interface CaseColumn {
  label: string;
  heading: string;
  text: string;
}

export const hero = {
  chip: 'Engenharia Química · Ponte de Lima e Porto',
  title: 'Modelo processos e depois confronto-os com a realidade.',
  intro:
    'Estudante de Mestrado em Engenharia Química na FEUP. Simulo instalações em Aspen Plus, construo modelos em Python e procuro a energia que um processo deixa por aproveitar.',
  artLabel:
    'Arte ASCII de cinco gotas com aspeto de vidro, de tamanhos bem diferentes: uma grande e quatro mais pequenas',
} as const;

export const quickFacts: readonly Fact[] = [
  { term: 'Procuro', value: 'Primeiro emprego em engenharia química, na indústria' },
  { term: 'Formação', value: 'Mestrado em Engenharia Química, FEUP (em curso)' },
  { term: 'Disponibilidade', value: 'A partir de meados de 2027' },
  { term: 'Mobilidade', value: 'Região Norte (Porto)' },
  { term: 'Carta de condução', value: 'Sim' },
  { term: 'Idiomas', value: 'Português (nativo), inglês (C1)' },
];

export const industryHighlight = {
  label: 'Em destaque na indústria · Bondalti Chemicals · Verão de 2026',
  heading: 'Testes para operadores, gerados em segundos',
  intro:
    'Na área de Produção de Anilina e Derivados da Bondalti, em Estarreja, desenvolvi uma plataforma digital que avalia os conhecimentos dos operadores da instalação de mononitrobenzeno (MNB).',
  columns: [
    {
      label: 'O problema',
      heading: 'Não havia avaliação estruturada',
      text: 'A instalação não tinha uma forma estruturada de avaliar os conhecimentos dos seus operadores.',
    },
    {
      label: 'A solução',
      heading: 'Um teste diferente para cada avaliação',
      text: 'A plataforma gera testes aleatórios em poucos segundos, por isso cada avaliação é diferente da anterior.',
    },
    {
      label: 'O resultado',
      heading: 'Pronta para crescer',
      text: 'Foi desenvolvida para a instalação de MNB e pensada desde o início para ser alargada a outras instalações.',
    },
  ] satisfies CaseColumn[],
  tools: ['Power Apps', 'Power Automate', 'SharePoint'],
  note: 'Carta de recomendação da Bondalti disponível a pedido.',
  artLabel:
    'Arte ASCII de uma instalação química genérica, com coluna, tanques, chaminé e um suporte de tubagens, e à frente uma consola que mostra um teste com caixas de verificação',
} as const;
