# Tomás Caldas — Portefólio

Site pessoal de João Tomás Lima Caldas, estudante de Mestrado em Engenharia Química.
Publicado em https://thejohn01.github.io.

Feito com [Astro](https://astro.build) e TypeScript. Os textos estão em ficheiros de dados (`.ts`) e em Markdown (`.md`); o Astro junta tudo e gera páginas HTML estáticas. O GitHub constrói e publica o site sozinho sempre que há alterações no ramo `main`.

## Estrutura

```
.
├── .github/workflows/deploy.yml   # constrói e publica no GitHub Pages
├── public/                        # copiado tal como está (CV, og-image.png, favicon.svg)
├── src/
│   ├── assets/ascii/day/*.txt     # arte ASCII (modo claro)
│   ├── assets/ascii/dusk/*.txt    # versões para o modo escuro (opcional, mesmo nome)
│   ├── components/                # uma secção da página por ficheiro .astro
│   ├── content/projects/*.md      # um ficheiro por projeto
│   ├── content/publications/*.md  # um ficheiro por publicação
│   ├── content.config.ts          # campos obrigatórios de projetos e publicações (Zod)
│   ├── data/*.ts                  # textos da página inicial
│   ├── layouts/Base.astro         # <head>, cabeçalho, rodapé, scripts
│   ├── lib/                       # funções partilhadas (arte ASCII, texto)
│   ├── pages/index.astro          # página inicial
│   ├── scripts/*.ts               # tema claro/escuro e animação da arte ASCII
│   └── styles/global.css          # design Dewpoint
├── astro.config.mjs
├── package.json
└── tsconfig.json                  # TypeScript no modo mais rigoroso
```

## Trabalhar no computador

É preciso o [Node.js](https://nodejs.org) 22.23 ou mais recente (a versão LTS serve).

```bash
npm install        # só na primeira vez
npm run dev        # abre em http://localhost:4321 e atualiza a cada gravação
npm run build      # verifica os tipos e gera o site final em dist/
npm run preview    # mostra o dist/ tal como vai ficar online
```

Se um campo de um projeto estiver em falta ou com o tipo errado, `npm run build` (e a publicação no GitHub) falha com uma mensagem a dizer qual é o ficheiro e o campo.
