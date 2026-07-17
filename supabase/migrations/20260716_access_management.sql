-- Gestión de accesos para Design Ladder TEXO
create extension if not exists pgcrypto;

create table if not exists public.access_users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  agency text not null check (agency in ('ROGER','LUPE','AMPLIFY','OMD','NASTA','BRICK','ROW','BPR','TEXO')),
  job_title text,
  password_hash text not null,
  role text not null default 'member' check (role in ('member','admin')),
  status text not null default 'pending' check (status in ('pending','approved','rejected','suspended')),
  must_change_password boolean not null default false,
  requested_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by text,
  last_login_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.password_reset_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  status text not null default 'pending' check (status in ('pending','resolved')),
  requested_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists access_users_status_idx on public.access_users(status);
create index if not exists access_users_agency_idx on public.access_users(agency);
create index if not exists reset_requests_email_idx on public.password_reset_requests(email);

alter table public.access_users enable row level security;
alter table public.password_reset_requests enable row level security;
-- La aplicación accede exclusivamente con SUPABASE_SERVICE_ROLE_KEY desde el servidor.
