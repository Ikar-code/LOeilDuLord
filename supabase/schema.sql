-- Radar — schéma complet. À exécuter dans Supabase > SQL Editor (un seul copier-coller).
-- Modèle mono-utilisateur "propriétaire" : chaque ligne est rattachée à un user_id
-- (auth.uid()). Le pipeline Python (GitHub Actions) écrit avec la clé service_role
-- en utilisant OWNER_USER_ID comme user_id. Le frontend (Figma → React) lit/écrit
-- avec la clé anon, une fois l'utilisateur connecté, protégé par les policies RLS.

create extension if not exists pgcrypto;

-- ---------- Profil utilisateur ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  updated_at timestamptz default now()
);

-- ---------- Paramètres (clés API, préférences) ----------
-- ⚠️ Les clés API sont stockées en clair, protégées uniquement par RLS
-- (visibles seulement par leur propriétaire). Pour un usage à plusieurs
-- utilisateurs ou en production sensible, chiffrer via Supabase Vault
-- (extension pgsodium) plutôt que de stocker les valeurs brutes.
create table if not exists public.settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  groq_api_key text,
  gemini_api_key text,
  openai_api_key text,
  notif_email boolean not null default true,
  notif_min_priority text not null default 'moyenne' check (notif_min_priority in ('haute', 'moyenne', 'basse')),
  updated_at timestamptz default now()
);

-- ---------- Concurrents ----------
create table if not exists public.competitors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  logo_url text,
  sector text,
  website text,
  monitoring_frequency text not null default 'quotidien' check (monitoring_frequency in ('horaire', 'quotidien', 'hebdomadaire')),
  status text not null default 'actif' check (status in ('actif', 'pause')),
  created_at timestamptz default now()
);

-- ---------- Sources surveillées ----------
create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  competitor_id uuid not null references public.competitors(id) on delete cascade,
  type text not null check (type in ('site_web', 'blog', 'github', 'linkedin', 'rss', 'changelog', 'documentation', 'emploi')),
  url text not null,
  reliability_score int not null default 80 check (reliability_score between 0 and 100),
  status text not null default 'actif' check (status in ('actif', 'pause', 'erreur')),
  last_analyzed_at timestamptz,
  created_at timestamptz default now()
);

-- ---------- Snapshots bruts (pour diff / vérification factuelle) ----------
create table if not exists public.snapshots (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.sources(id) on delete cascade,
  content_hash text not null,
  raw_text text,
  fetched_at timestamptz default now()
);

create index if not exists snapshots_source_idx on public.snapshots(source_id, fetched_at desc);

-- ---------- Exécutions d'agents (pour pages "Agents IA" et "Historique") ----------
create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  agent_name text not null check (agent_name in ('recherche', 'scraping', 'verification', 'analyse', 'redaction', 'controle_qualite', 'publication')),
  competitor_id uuid references public.competitors(id) on delete cascade,
  source_id uuid references public.sources(id) on delete set null,
  status text not null default 'running' check (status in ('idle', 'running', 'success', 'error')),
  progress int not null default 0 check (progress between 0 and 100),
  message text,
  started_at timestamptz default now(),
  finished_at timestamptz,
  duration_ms int
);

create index if not exists agent_runs_user_idx on public.agent_runs(user_id, started_at desc);

-- ---------- Rapports IA ----------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  competitor_id uuid not null references public.competitors(id) on delete cascade,
  title text not null,
  summary text not null,
  confidence_score int not null default 0 check (confidence_score between 0 and 100),
  sources_count int not null default 0,
  facts jsonb not null default '[]',
  changes jsonb not null default '[]',
  analysis text,
  recommendations jsonb not null default '[]',
  status text not null default 'publie' check (status in ('brouillon', 'publie', 'rejete')),
  generated_at timestamptz default now()
);

create index if not exists reports_user_idx on public.reports(user_id, generated_at desc);

-- ---------- Sources citées dans un rapport ----------
create table if not exists public.report_sources (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  source_id uuid references public.sources(id) on delete set null,
  url text not null,
  excerpt text
);

-- ---------- Alertes ----------
create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  report_id uuid references public.reports(id) on delete cascade,
  competitor_id uuid references public.competitors(id) on delete cascade,
  type text not null check (type in ('nouveau_produit', 'changement_prix', 'nouvelle_fonctionnalite', 'nouvelle_offre_emploi', 'levee_de_fonds', 'autre')),
  priority text not null default 'moyenne' check (priority in ('haute', 'moyenne', 'basse')),
  title text not null,
  description text,
  read boolean not null default false,
  created_at timestamptz default now()
);

create index if not exists alerts_user_idx on public.alerts(user_id, created_at desc);

-- ---------- RLS ----------
alter table public.profiles enable row level security;
alter table public.settings enable row level security;
alter table public.competitors enable row level security;
alter table public.sources enable row level security;
alter table public.snapshots enable row level security;
alter table public.agent_runs enable row level security;
alter table public.reports enable row level security;
alter table public.report_sources enable row level security;
alter table public.alerts enable row level security;

create policy "own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own settings" on public.settings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own competitors" on public.competitors for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own sources" on public.sources for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own agent_runs" on public.agent_runs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own reports" on public.reports for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own alerts" on public.alerts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- snapshots et report_sources n'ont pas de user_id direct : on passe par la table parente.
create policy "own snapshots" on public.snapshots for all
  using (exists (select 1 from public.sources s where s.id = snapshots.source_id and s.user_id = auth.uid()))
  with check (exists (select 1 from public.sources s where s.id = snapshots.source_id and s.user_id = auth.uid()));

create policy "own report_sources" on public.report_sources for all
  using (exists (select 1 from public.reports r where r.id = report_sources.report_id and r.user_id = auth.uid()))
  with check (exists (select 1 from public.reports r where r.id = report_sources.report_id and r.user_id = auth.uid()));

-- Le pipeline Python écrit avec la clé service_role, qui ignore RLS par
-- conception : ces policies protègent uniquement l'accès depuis le frontend.

-- ---------- Profil auto-créé à l'inscription ----------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  insert into public.settings (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
