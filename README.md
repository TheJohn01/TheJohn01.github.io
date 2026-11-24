# Tomás Caldas — Portefólio

Site pessoal de João Tomás Lima Caldas, estudante de Mestrado em Engenharia Química.
Publicado em https://thejohn01.github.io.

Feito com [Astro](https://astro.build) e TypeScript. Os textos estão em ficheiros de dados (`.ts`) e em Markdown (`.md`); o Astro junta tudo e gera páginas HTML estáticas. O GitHub constrói e publica o site sozinho sempre que há alterações no ramo `main`.

## Onde mudar o quê

| Quero mudar…                                              | Ficheiro                                   |
| --------------------------------------------------------- | ------------------------------------------ |
| Título do site, descrição, e-mail, LinkedIn, GitHub, CV   | `src/data/site.ts`                         |
| Apresentação, "Em resumo" e destaque da Bondalti          | `src/data/home.ts`                         |
| Experiência, formação, competências e idiomas             | `src/data/journey.ts`                      |
| Um projeto                                                | `src/content/projects/<projeto>.md`        |
| A publicação                                              | `src/content/publications/<artigo>.md`     |
| Arte ASCII                                                | `src/assets/ascii/day/` e `dusk/`          |
| Cores, letra, espaçamentos, animações, versão telemóvel   | `src/styles/global.css`                    |
| O CV, a imagem de partilha e o ícone                      | `public/`                                  |

As etiquetas pequenas em maiúsculas (ex.: "PROJETOS EM DESTAQUE") escrevem-se normalmente nos ficheiros; a conversão para maiúsculas é automática.

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

## Acrescentar um projeto

1. Copie um ficheiro de `src/content/projects/` (por exemplo, `heatpump-pinch.md`) e dê-lhe um nome novo, em minúsculas e com hífenes.
2. Preencha o cabeçalho (entre as linhas `---`):
   - `title`, `summary`: título e descrição curta;
   - `order`: posição na página (1 aparece primeiro);
   - `tags`: etiquetas por cima do título;
   - `status`: `Publicado` ou `Em curso`;
   - `art` e `artLabel`: a arte ASCII e a sua descrição para leitores de ecrã;
   - `links` (opcional): ligações com `label` e `href`.
3. Para o mostrar em grande, como o gémeo digital, acrescente `caseStudy` (ver `gemeo-digital-baterias.md`).

O texto por baixo do cabeçalho fica reservado para a futura página de cada projeto.

## Arte ASCII nova

1. Grave a arte em `src/assets/ascii/day/<nome>.txt` (e, se quiser, uma versão escura com o mesmo nome em `dusk/`).
2. Acrescente `<nome>` à lista `ART_KEYS` em `src/content.config.ts`.
3. Use `art: <nome>` no projeto.

## Publicar no GitHub Pages

### Primeira vez (troca do site antigo por este)

1. Em **Settings → Pages → Build and deployment → Source**, escolha **GitHub Actions**. O site antigo continua online até a nova versão ser publicada.
2. No repositório `TheJohn01.github.io`, apague os ficheiros do site antigo (`index.html`, `og-image.png`, `.nojekyll`, a pasta `cv/` e o `README.md`). Já estão todos incluídos neste projeto.
3. Carregue o conteúdo desta pasta (não a pasta em si) para a raiz do repositório, incluindo `package-lock.json`. Não carregue `node_modules/` nem `dist/` se existirem.
4. A pasta `.github` começa por um ponto e por isso fica escondida no Finder (macOS) e, às vezes, no Explorador (Windows). No Finder, carregue em <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>.</kbd> para a mostrar antes de arrastar. Em alternativa, no GitHub use **Add file → Create new file**, escreva `.github/workflows/deploy.yml` como nome e cole o conteúdo do ficheiro.
5. No separador **Actions**, acompanhe a publicação "Publicar no GitHub Pages". Quando ficar verde (1 a 2 minutos), o site está atualizado.

### Daí em diante

Cada alteração enviada para o ramo `main` volta a construir e publicar o site automaticamente.
