-- LibrasFlow: horários fixos semanais (regra de recorrência) por aluno.
-- Separação: `alunos` = quem estuda; `aula_agendamentos` = slot recorrente (dia + hora).
--
-- Evolução futura (presença):
--   - `aula_ocorrencias`: instância concreta (agendamento_id, data_aula date, ...).
--   - `presencas`: (ocorrencia_id, status, notas...) ligada à ocorrência, não ao aluno diretamente.

create table if not exists public.aula_agendamentos (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null
    references public.alunos (id) on delete cascade,
  -- 0 = domingo … 6 = sábado (igual a `Date.getDay()` em JavaScript e EXTRACT(DOW) no Postgres)
  dia_semana smallint not null
    constraint aula_agendamentos_dia_semana_check
      check (dia_semana >= 0 and dia_semana <= 6),
  hora_inicio time not null,
  hora_fim time,
  observacoes text not null default '',
  created_at timestamptz not null default now(),
  constraint aula_agendamentos_aluno_dia_hora_unique
    unique (aluno_id, dia_semana, hora_inicio)
);

comment on table public.aula_agendamentos is
  'Slots recorrentes semanais (aluno + dia da semana + horário). Base para listar aulas do dia e para futuras ocorrências/presença.';

create index if not exists aula_agendamentos_dia_hora_idx
  on public.aula_agendamentos (dia_semana, hora_inicio);

alter table public.aula_agendamentos enable row level security;

create policy "aula_agendamentos_select_anon"
  on public.aula_agendamentos for select
  to anon
  using (true);

create policy "aula_agendamentos_insert_anon"
  on public.aula_agendamentos for insert
  to anon
  with check (true);

create policy "aula_agendamentos_update_anon"
  on public.aula_agendamentos for update
  to anon
  using (true)
  with check (true);

create policy "aula_agendamentos_delete_anon"
  on public.aula_agendamentos for delete
  to anon
  using (true);
