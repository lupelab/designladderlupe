-- Recorrido de preparación y certificación del aplicador
alter table public.access_users
  add column if not exists readiness_checklist jsonb not null default '{}'::jsonb,
  add column if not exists readiness_completed_at timestamptz,
  add column if not exists guide_completed_at timestamptz,
  add column if not exists certification_status text not null default 'not_started',
  add column if not exists certification_score integer,
  add column if not exists certification_attempts integer not null default 0,
  add column if not exists certification_answers jsonb,
  add column if not exists certified_at timestamptz,
  add column if not exists certification_version text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'access_users_certification_status_check'
  ) then
    alter table public.access_users
      add constraint access_users_certification_status_check
      check (certification_status in ('not_started','in_progress','passed','failed'));
  end if;
end $$;

create index if not exists access_users_certification_status_idx
  on public.access_users(certification_status);
