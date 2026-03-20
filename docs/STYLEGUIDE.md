# Styleguide — Sinaliza / LibrasFlow

Guia de design e implementação visual do monorepo. Objetivo: manter **consistência** entre apps (`librasflow`, `sinaliza`), **libs** de feature e **componentes de UI**, e reduzir decisões ad hoc.

**Referência visual do painel:** inspiração no padrão de admin dashboards como [TailAdmin Angular](https://angular-demo.tailadmin.com/) — cartões claros, fundo cinza, primário índigo, tipografia legível.

---

## 1. Stack de estilos

| Ferramenta | Uso principal | Onde entra no build |
|------------|---------------|---------------------|
| **Tailwind CSS v4** | Utilitários em templates (libs + app), JIT | `librasflow/tailwind.css`, `src/tailwind.css` + `.postcssrc.json` com `@tailwindcss/postcss` |
| **Bootstrap 5.3.8** | Grid, componentes (cards, tabelas, botões, progress), layout do painel | `node_modules/bootstrap/dist/css/bootstrap.min.css` nos `styles` do app (ex.: `librasflow/project.json`) |
| **SCSS** | Estilos globais leves, layout shell (`ui-components`) | `*.scss` por app / componente |
| **CSS do componente** | Tokens locais (ex.: `.dash` no dashboard) | `feature-home.css`, etc. |

### Regra prática: quando usar o quê

- **Telas tipo admin / formulários / tabelas:** priorize **Bootstrap** para não reinventar padrões (espaçamento, estados, responsivo).
- **Ajustes rápidos ou libs sem Bootstrap no escopo:** **Tailwind** (classes utilitárias).
- **Shell (sidebar, header, layout):** **SCSS** em `libs/ui/components` — são a “casca” do produto; evite misturar três sistemas no mesmo seletor.

### PostCSS e Angular

O builder do Angular só lê **`.postcssrc.json`** ou **`postcss.config.json`** na raiz do workspace (não use só `postcss.config.mjs` para o app). Ver raiz: [`.postcssrc.json`](../.postcssrc.json).

---

## 2. Cores

### 2.1 Primário (painel / marca UI)

| Token / uso | Hex | Notas |
|-------------|-----|--------|
| Primário | `#3c50e0` | Botões primários, links fortes, ícones de destaque |
| Primário claro (gradiente) | `#6576ff` | Gradientes com o primário |
| Hover link | `#2a3cb8` | `--bs-link-hover-color` no escopo `.dash` |

RGB para variáveis Bootstrap: `60, 80, 224`.

### 2.2 Neutros (texto e superfície — estilo slate)

| Uso | Hex |
|-----|-----|
| Texto principal | `#1e293b` / `#0f172a` |
| Texto secundário | `#64748b` |
| Bordas | `#e2e8f0` |
| Fundo app (conteúdo) | `#f1f5f9` |
| Superfície cartão / header | `#ffffff` |

### 2.3 Semânticos (KPIs, estados)

| Uso | Cor sugerida |
|-----|----------------|
| Sucesso / positivo | `#22c55e` ou classes Bootstrap `text-success` |
| Aviso | `#f59e0b` / `text-warning` |
| Erro / negativo | `#ef4444` / `text-danger` |
| Informação | primário ou `text-primary` |

### 2.4 Gradientes de ícone (dashboard)

Usados nos cartões KPI (`feature-home`): índigo, cyan, âmbar, rose — ver [feature-home.css](../libs/feature/home/src/lib/feature-home/feature-home.css) (classes `.dash__kpi-icon--*`).

---

## 3. Tipografia

### 3.1 Família

- **Painel / dashboard (`feature-home`):** [Inter](https://fonts.google.com/specimen/Inter) — pesos 400, 500, 600, 700 (import no CSS do componente).
- **Outras telas:** herdado do browser + Tailwind/Bootstrap; para alinhar ao painel, prefira Inter também no `index.html` ou em `styles.scss` global quando fizer sentido.

### 3.2 Escala sugerida

| Elemento | Classe Bootstrap / uso |
|----------|-------------------------|
| Título de página | `h3 fw-semibold` ou `h4` |
| Seção | `h5` / `h6 fw-semibold` |
| Corpo | `small`, `lead` conforme hierarquia |
| Labels / KPI | `text-uppercase small fw-semibold` + `letter-spacing` leve quando for métrica |

### 3.3 Números e dados

- Valores grandes: `h4 fw-bold` ou `h5 fw-bold`, `letter-spacing` negativo leve (`dash__kpi-value`).
- Sempre combinar com label pequena em cinza acima ou ao lado.

---

## 4. Layout e espaçamento

### 4.1 Shell (`main-layout`)

- Sidebar: **17rem**, fundo branco, borda `#e2e8f0`.
- Área principal: fundo **`#f1f5f9`**, conteúdo com padding **`1.5rem`** (bottom um pouco maior).
- Mobile: sidebar vira bloco superior (coluna).

Arquivos: [main-layout.component.scss](../libs/ui/components/src/lib/layout/main-layout/main-layout.component.scss).

### 4.2 Largura do conteúdo do dashboard

- Conteúdo interno do painel: `max-width: 1400px`, centralizado (`.dash__main`).

### 4.3 Grid

- Use **`row` / `col-*`** (Bootstrap) para blocos principais.
- Gutter confortável: `g-3` / `g-4` / `g-xl-4`.

---

## 5. Componentes (Bootstrap)

### 5.1 Cartões

- `card border-0 shadow-sm rounded-3`
- Corpo: `p-4` ou `p-4 p-lg-5` para hero de métrica.
- Hover sutil: ver `.dash__kpi` (borda + sombra).

### 5.2 Botões

- Ação principal: `btn btn-primary` (herda `--bs-primary` no escopo `.dash`).
- Secundária: `btn-outline-primary` / `btn-outline-secondary`.
- Compacta em tabela: `btn-sm rounded-pill`.

### 5.3 Tabelas

- `table table-hover align-middle`
- Cabeçalho: `thead table-light`, labels `small text-uppercase fw-semibold`.

### 5.4 Progresso

- `progress rounded-pill` + `progress-bar` com altura ~0.65rem (ver `.dash__progress`).

### 5.5 Badges e pills

- `badge rounded-pill` para status; versão suave: fundo rgba do primário (ex.: `.dash__badge-soft`).

---

## 6. Tailwind no monorepo

- **LibrasFlow:** `librasflow/tailwind.css` com `@import "tailwindcss" source("./src/app")` e `@source "../libs"` para incluir templates das libs.
- **App raiz `sinaliza`:** `src/tailwind.css` análogo com `@source "../libs"`.
- Diretivas **`@source` / `source()`** ficam em **`.css`**, não em `.scss` (o Sass não conhece `@source`; o validador do editor também reclama).

Documentação Nx: [Using Tailwind CSS with Angular](https://nx.dev/docs/technologies/angular/guides/using-tailwind-css-with-angular-projects).

---

## 7. Acessibilidade

- **Skip link** para `#conteudo-principal` / `#dash-main`: visível só no foco.
- **Landmarks:** `main`, `nav` com `aria-label` onde fizer sentido.
- **Contraste:** texto secundário `#64748b` sobre branco — ok para corpo; títulos em `#1e293b` / `#0f172a`.
- **Modo escuro:** o dashboard (`.dash`) define overrides em `@media (prefers-color-scheme: dark)`; novos cartões devem repetir o padrão (fundo escuro, borda `#334155`).

---

## 8. Ícones

- Preferir **SVG inline** nos templates (como na sidebar e no dashboard) para controle de cor e tamanho.
- Ícones decorativos: `aria-hidden="true"`.
- Se no futuro adotar **Bootstrap Icons** ou **Lucide**, documente aqui e padronize um pacote só.

---

## 9. Arquivos de referência rápida

| Área | Arquivo |
|------|---------|
| Tokens do dashboard | `libs/feature/home/src/lib/feature-home/feature-home.css` |
| Layout + sidebar + header | `libs/ui/components/src/lib/layout/**` |
| Estilos globais LibrasFlow | `librasflow/src/styles.scss`, `librasflow/tailwind.css` |
| Ordem de CSS no build | `librasflow/project.json` → `styles` |
| PostCSS | `.postcssrc.json` (raiz) |

---

## 10. Evolução

Ao introduzir **novo primário** ou **nova fonte**:

1. Atualizar este documento.
2. Ajustar variáveis no SCSS do layout e/ou `.dash` (ou extrair para `_tokens.scss` compartilhado se crescer).
3. Garantir que `--bs-primary` continue coerente onde Bootstrap é usado.

---

*Última revisão alinhada ao layout TailAdmin-like e ao app **librasflow**.*
