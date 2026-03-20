# Supabase — LibrasFlow

## 1. Criar o projeto

No [Supabase](https://supabase.com), crie um projeto e anote:

- **Project URL** (`https://xxx.supabase.co`)
- **anon public** key (Settings → API)

## 2. Tabelas

No **SQL Editor**, execute os scripts **nesta ordem**:

1. `migrations/001_create_alunos.sql` — alunos
2. `migrations/002_create_aula_agendamentos.sql` — horários fixos semanais (agenda)
3. `migrations/003_financeiro_mensalidades.sql` — valor mensal no aluno + mensalidades

Isso cria as tabelas, constraints e políticas RLS para o role `anon` (adequado para desenvolvimento).

> **Produção:** restrinja as políticas RLS (ex.: `authenticated` apenas) e não exponha dados sensíveis com políticas permissivas.

## 3. Angular

Edite `librasflow/src/environments/environment.ts`:

```ts
supabaseUrl: 'https://SEU-PROJETO.supabase.co',
supabaseAnonKey: 'sua-chave-anon',
```

### Produção (Vercel)

No projeto Vercel: **Settings → Environment Variables**, crie as duas variáveis e marque **Production** (e Preview, se quiser previews com Supabase).

| Nome | Valor |
|------|--------|
| `SUPABASE_URL` | URL do projeto (Supabase → Settings → API → Project URL) |
| `SUPABASE_ANON_KEY` | chave **anon public** (mesma tela) |

Também são aceitos os nomes `NEXT_PUBLIC_SUPABASE_*` ou `VITE_SUPABASE_*`, caso você tenha copiado de outro template.

**Importante:** no Vercel, variáveis marcadas como **Sensitive** não entram no **build**. Para este app, não use Sensitive nessas duas chaves (a anon key já é pública no cliente; o que importa é o RLS no Supabase).

Depois de salvar: **Deployments** → menu **⋯** no último deploy → **Redeploy**.

O `buildCommand` roda `sync-env-prod.mjs` antes do `npm run build`; sem variáveis o build falha de propósito (evita publicar o app sem Supabase).

Build local com produção: `SUPABASE_URL=... SUPABASE_ANON_KEY=... node librasflow/scripts/sync-env-prod.mjs && npx nx run librasflow:build:production` (no PowerShell use `$env:SUPABASE_URL="..."`).
