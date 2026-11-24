// Dados gerais do site: metadados, contactos e navegação.
// Alterar aqui atualiza o cabeçalho, o rodapé e as etiquetas de partilha (LinkedIn, etc.).

export interface Link {
  href: string;
  label: string;
}

export const site = {
  url: 'https://thejohn01.github.io',
  lang: 'pt-PT',
  locale: 'pt_PT',
  title: 'Tomás Caldas — Portefólio',
  description:
    'Portefólio de João Tomás Lima Caldas, estudante de Mestrado em Engenharia Química na FEUP: estágios na indústria química, projetos de simulação e modelação, e investigação.',
  ogImage: {
    path: '/og-image.png',
    width: 1200,
    height: 627,
    alt: 'Tomás Caldas — Portefólio de Engenharia Química',
  },
} as const;

export const person = {
  fullName: 'João Tomás Lima Caldas',
  shortName: 'Tomás Caldas',
  email: 'tomascaldas2016@gmail.com',
  linkedin: {
    href: 'https://www.linkedin.com/in/joao-tomas-caldas/',
    label: 'linkedin.com/in/joao-tomas-caldas',
  },
  github: { href: 'https://github.com/TheJohn01', label: 'github.com/TheJohn01' },
  cv: {
    href: '/cv/Joao_Tomas_Lima_Caldas_CV.pdf',
    filename: 'Joao_Tomas_Lima_Caldas_CV.pdf',
  },
} as const;

// As ligações começam por "/" para funcionarem também a partir de outras páginas.
export const nav: readonly Link[] = [
  { href: '/#industria', label: 'Indústria' },
  { href: '/#work', label: 'Projetos' },
  { href: '/#research', label: 'Investigação' },
  { href: '/#experience', label: 'Percurso' },
];

export const contact = {
  heading: 'Vamos conversar.',
  text: 'Perguntas sobre um projeto, uma dissertação ou um estágio são sempre bem-vindas.',
} as const;
