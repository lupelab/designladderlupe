-- Agrega PHD al catálogo de agencias utilizado por Design Ladder y el módulo NPS.
insert into public.agencies (name, slug)
select 'PHD', 'phd'
where not exists (
  select 1 from public.agencies where slug = 'phd'
);

alter table public.access_users
  drop constraint if exists access_users_agency_check;

alter table public.access_users
  add constraint access_users_agency_check
  check (agency in ('ROGER','LUPE','AMPLIFY','OMD','PHD','NASTA','BRICK','ROW','BPR','TEXO'));
