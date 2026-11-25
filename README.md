# Tomás Caldas — Portefólio

Site pessoal de João Tomás Lima Caldas, estudante de Mestrado em Engenharia Química.
Publicado em https://thejohn01.github.io.

Feito com [Astro](https://astro.build) e TypeScript. Os textos estão em ficheiros de dados (`.ts`) e em Markdown (`.md` e `.mdx`, que pode levar gráficos); o Astro junta tudo e gera páginas HTML estáticas. O GitHub constrói e publica o site sozinho sempre que há alterações no ramo `main`.

## Estrutura

```
.
├── .github/workflows/deploy.yml   # constrói e publica no GitHub Pages
├── public/                        # copiado tal como está (CV, og-image.png, favicon.svg)
├── scripts/                       # geram a arte ASCII (Python): ascii-scene.py, ascii-accents.py
├── src/
│   ├── assets/ascii/day/*.txt     # arte ASCII (modo claro)
│   ├── assets/ascii/dusk/*.txt    # versões para o modo escuro (opcional, mesmo nome)
│   ├── assets/ascii/accents/*.txt # que caracteres levam cor de acento (folha, sol, brilho)
│   ├── components/                # uma secção da página por ficheiro .astro
│   ├── components/charts/         # gráficos sem JavaScript para as páginas .mdx
│   ├── content/projects/          # um .md ou .mdx por projeto (o texto é a página do projeto)
│   ├── content/publications/      # um .md ou .mdx por publicação
│   ├── content.config.ts          # campos obrigatórios de projetos e publicações (Zod)
│   ├── data/*.ts                  # textos da página inicial
│   ├── layouts/Base.astro         # <head>, cabeçalho, rodapé, scripts
│   ├── lib/                       # funções partilhadas (arte ASCII, texto)
│   ├── pages/                     # página inicial e páginas de projeto e publicação
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

Com um Node mais antigo instalado, dá para usar o 22 só para o site: `npx -y node@22 node_modules/astro/bin/astro.mjs dev` (ou `check`, `build`, `preview`).

A arte ASCII em 3D (`battery`, `industry`, `wine`) é gerada por `python scripts/ascii-scene.py <nome>` (precisa de numpy), que escreve as duas versões e o mapa de acentos. Para mudar a arte, muda-se a cena no script.

Se um campo de um projeto estiver em falta ou com o tipo errado, `npm run build` (e a publicação no GitHub) falha com uma mensagem a dizer qual é o ficheiro e o campo.
