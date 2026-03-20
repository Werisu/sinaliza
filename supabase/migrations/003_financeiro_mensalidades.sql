-- LibrasFlow: valor mensal sugerido no aluno + mensalidades por competência (histórico para relatórios).

alter table public.alunos
  add column if not exists valor_mensal numeric(12, 2)
    constraint alunos_valor_mensal_check check (valor_mensal is null or valor_mensal >= 0);

comment on column public.alunos.valor_mensal is
  'Valor mensal de referência do aluno (sugestão ao lançar mensalidades).';

create table if not exists public.mensalidades (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null
    references public.alunos (id) on delete cascade,
  -- Primeiro dia do mês de competência (ex.: 2026-03-01)
  referencia_mes date not null,
  valor numeric(12, 2) not null
    constraint mensalidades_valor_check check (valor >= 0),
  status text not null
    constraint mensalidades_status_check
      check (status in ('pendente', 'pago')),
  data_vencimento date not null,
  pago_em timestamptz,
  observacoes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mensalidades_aluno_mes_unique unique (aluno_id, referencia_mes)
);

comment on table public.mensalidades is
  'Cobrança mensal por aluno e competência. Base para fluxo de caixa e relatórios (filtros por período, status, somatórios).';

create index if not exists mensalidades_referencia_mes_idx
  on public.mensalidades (referencia_mes desc);

create index if not exists mensalidades_status_idx
  on public.mensalidades (status);

create index if not exists mensalidades_aluno_id_idx
  on public.mensalidades (aluno_id);

alter table public.mensalidades enable row level security;

create policy "mensalidades_select_anon"
  on public.mensalidades for select
  to anon
  using (true);

create policy "mensalidades_insert_anon"
  on public.mensalidades for insert
  to anon
  with check (true);

create policy "mensalidades_update_anon"
  on public.mensalidades for update
  to anon
  using (true)
  with check (true);

create policy "mensalidades_delete_anon"
  on public.mensalidades for delete
  to anon
  using (true);
