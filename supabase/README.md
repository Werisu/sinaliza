# Supabase — LibrasFlow

## 1. Criar o projeto

No [Supabase](https://supabase.com), crie um projeto e anote:

- **Project URL** (`https://xxx.supabase.co`)
- **anon public** key (Settings → API)

## 2. Tabela `alunos`

No **SQL Editor**, execute o script:

`migrations/001_create_alunos.sql`

Isso cria a tabela, constraints e políticas RLS para o role `anon` (adequado para desenvolvimento).

> **Produção:** restrinja as políticas RLS (ex.: `authenticated` apenas) e não exponha dados sensíveis com políticas permissivas.

## 3. Angular

Edite `librasflow/src/environments/environment.ts`:

```ts
supabaseUrl: 'https://SEU-PROJETO.supabase.co',
supabaseAnonKey: 'sua-chave-anon',
```

Para build de produção, use `environment.prod.ts` ou injeção via pipeline.
