-- LibrasFlow: tabela de alunos
-- Execute no SQL Editor do Supabase ou via CLI: supabase db push

create table if not exists public.alunos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefone text not null,
  tipo_aula text not null
    constraint alunos_tipo_aula_check
      check (tipo_aula in ('presencial', 'online', 'semipresencial')),
  nivel text not null
    constraint alunos_nivel_check
      check (nivel in ('básico', 'intermediário', 'avançado')),
  observacoes text not null default '',
  created_at timestamptz not null default now()
);

comment on table public.alunos is 'Alunos do LibrasFlow';

-- RLS: habilitado; políticas permissivas para desenvolvimento (substitua por auth em produção)
alter table public.alunos enable row level security;

create policy "alunos_select_anon"
  on public.alunos for select
  to anon
  using (true);

create policy "alunos_insert_anon"
  on public.alunos for insert
  to anon
  with check (true);

create policy "alunos_update_anon"
  on public.alunos for update
  to anon
  using (true)
  with check (true);

create policy "alunos_delete_anon"
  on public.alunos for delete
  to anon
  using (true);

create index if not exists alunos_nome_idx on public.alunos (nome);
