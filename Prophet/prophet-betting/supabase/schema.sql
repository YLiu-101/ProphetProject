/* =========================================================================
   Prophet – Bet-on-Everything Platform
   Ready-to-run Supabase migration
   ========================================================================= */

/* ---------- 0. Extensions ------------------------------------------------ */
create extension if not exists "uuid-ossp";

/* ---------- 1. Enum helper types (optional but safer than text CHECK) ---- */
do $$
begin
  if not exists (select 1 from pg_type where typname = 'bet_status') then
    create type bet_status as enum ('active','pending_resolution','resolved','cancelled');
  end if;
  if not exists (select 1 from pg_type where typname = 'prediction_choice') then
    create type prediction_choice as enum ('yes','no');
  end if;
  if not exists (select 1 from pg_type where typname = 'arbitrator_decision') then
    create type arbitrator_decision as enum ('yes','no','tie');
  end if;
end$$;

/* ---------- 2. Core domain tables --------------------------------------- */
create table if not exists public.users (
    id              uuid references auth.users(id) on delete cascade primary key,
    email           text unique                      not null,
    username        text unique,
    full_name       text,
    avatar_url      text,
    role            text check (role in ('user','admin','super_admin')) default 'user',
    is_active       boolean                           default true,
    balance         numeric(14,4)                     default 0  check (balance >= 0),
    total_winnings  numeric(14,4)                     default 0,
    total_losses    numeric(14,4)                     default 0,
    created_at      timestamptz                      default timezone('utc', now()) not null,
    updated_at      timestamptz                      default timezone('utc', now()) not null
);

create table if not exists public.markets (
    id          uuid default uuid_generate_v4() primary key,
    name        text not null unique,
    description text,
    category    text not null,     -- e.g. sports, politics …
    is_active   boolean default true,
    created_by  uuid references public.users(id) on delete set null,
    created_at  timestamptz default timezone('utc', now()) not null,
    updated_at  timestamptz default timezone('utc', now()) not null
);

create table if not exists public.bets (
    id                  uuid default uuid_generate_v4() primary key,
    title               text not null,
    description         text,
    creator_id          uuid references public.users(id) on delete cascade not null,
    market_id           uuid references public.markets(id) on delete set null,
    arbitrator_type     text check (arbitrator_type in ('friend','ai')) not null,
    arbitrator_contact  text,
    deadline            timestamptz not null,
    status              bet_status default 'active',
    outcome             arbitrator_decision,          -- set when resolved
    resolved_at         timestamptz,
    total_pool          numeric(14,4) default 0,
    created_at          timestamptz default timezone('utc', now()) not null,
    updated_at          timestamptz default timezone('utc', now()) not null
);

create table if not exists public.bet_participants (
    id          uuid default uuid_generate_v4() primary key,
    bet_id      uuid references public.bets(id) on delete cascade not null,
    user_id     uuid references public.users(id) on delete cascade not null,
    prediction  prediction_choice not null,
    amount      numeric(14,4) not null check (amount > 0),
    created_at  timestamptz default timezone('utc', now()) not null,
    unique(bet_id, user_id)
);

create table if not exists public.arbitrator_decisions (
    id              uuid default uuid_generate_v4() primary key,
    bet_id          uuid references public.bets(id) on delete cascade not null unique,
    arbitrator_id   uuid references public.users(id) on delete set null,
    decision        arbitrator_decision not null,
    reasoning       text,
    is_ai_decision  boolean default false,
    appeal_count    integer default 0,
    created_at      timestamptz default timezone('utc', now()) not null
);

/* ---------- 3. Ledger & admin / moderation ------------------------------ */
create table if not exists public.credit_transactions (
    id          uuid default uuid_generate_v4() primary key,
    user_id     uuid references public.users(id) on delete cascade,
    type        text check (type in ('bet_placed','payout','admin_adjustment','refund')) not null,
    amount      numeric(14,4) not null,
    description text,
    created_at  timestamptz default timezone('utc', now()) not null
);

/* Admin audit tables (unchanged from original, trimmed for brevity) */
create table if not exists public.user_management_logs (
    id uuid default uuid_generate_v4() primary key,
    target_user_id uuid references public.users(id) on delete cascade not null,
    admin_id uuid references public.users(id) on delete set null not null,
    action text check (action in ('suspend','activate','role_change','balance_adjustment','warning_issued')) not null,
    old_value text,
    new_value text,
    reason text,
    created_at timestamptz default timezone('utc', now()) not null
);

create table if not exists public.bet_moderation (
    id uuid default uuid_generate_v4() primary key,
    bet_id uuid references public.bets(id) on delete cascade not null,
    admin_id uuid references public.users(id) on delete set null not null,
    action text check (action in ('approved','rejected','flagged','force_resolved','cancelled')) not null,
    reason text,
    automated boolean default false,
    created_at timestamptz default timezone('utc', now()) not null
);

create table if not exists public.system_settings (
    id uuid default uuid_generate_v4() primary key,
    key text unique not null,
    value text not null,
    description text,
    updated_by uuid references public.users(id) on delete set null,
    updated_at timestamptz default timezone('utc', now()) not null
);

create table if not exists public.market_management (
    id uuid default uuid_generate_v4() primary key,
    market_id uuid references public.markets(id) on delete cascade not null,
    admin_id uuid references public.users(id) on delete set null not null,
    action text check (action in ('created','activated','deactivated','modified','featured')) not null,
    old_values jsonb,
    new_values jsonb,
    created_at timestamptz default timezone('utc', now()) not null
);

create table if not exists public.content_reports (
    id uuid default uuid_generate_v4() primary key,
    reporter_id uuid references public.users(id) on delete set null not null,
    content_type text check (content_type in ('bet','user','comment')) not null,
    content_id uuid not null,
    reason text check (reason in ('inappropriate','spam','fraud','harassment','other')) not null,
    description text,
    status text check (status in ('pending','reviewed','resolved','dismissed')) default 'pending',
    reviewed_by uuid references public.users(id) on delete set null,
    admin_notes text,
    created_at timestamptz default timezone('utc', now()) not null,
    reviewed_at timestamptz
);

/* ---------- 4. Functions & Triggers ------------------------------------ */

/* Sync auth.users → public.users */
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (new.id, new.email,
          new.raw_user_meta_data ->> 'full_name',
          new.raw_user_meta_data ->> 'avatar_url');
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

/* Auto-update total_pool on participant changes */
create or replace function public.update_bet_total_pool()
returns trigger
language plpgsql
security definer
as $$
begin
  update public.bets
     set total_pool = coalesce((select sum(amount)
                                  from public.bet_participants
                                 where bet_id = new.bet_id), 0)
   where id = new.bet_id;
  return new;
end; $$;

drop trigger if exists trig_bet_participants_pool on public.bet_participants;
create trigger trig_bet_participants_pool
after insert or update or delete on public.bet_participants
for each row execute function public.update_bet_total_pool();

/* Generic updated_at */
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end; $$;

create or replace trigger touch_users_updated_at
before update on public.users
for each row execute function public.touch_updated_at();

create or replace trigger touch_bets_updated_at
before update on public.bets
for each row execute function public.touch_updated_at();

/* ---------- 5. Row-Level Security -------------------------------------- */
alter table public.users              enable row level security;
alter table public.markets            enable row level security;
alter table public.bets               enable row level security;
alter table public.bet_participants   enable row level security;
alter table public.arbitrator_decisions enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.user_management_logs enable row level security;
alter table public.bet_moderation     enable row level security;
alter table public.system_settings    enable row level security;
alter table public.market_management  enable row level security;
alter table public.content_reports    enable row level security;

/* Users */
create policy "Users: read profiles" on public.users
  for select using (true);

create policy "Users: upsert own profile" on public.users
  for all using (auth.uid() = id);

/* Markets */
create policy "Markets: view active" on public.markets
  for select using (is_active);

create policy "Markets: admins manage" on public.markets
  for all using (
    exists (select 1 from public.users
            where id = auth.uid()
              and role in ('admin','super_admin'))
);

/* Bets */
create policy "Bets: view" on public.bets
  for select using (true);

create policy "Bets: create" on public.bets
  for insert with check (auth.uid() = creator_id);

create policy "Bets: creator update" on public.bets
  for update using (auth.uid() = creator_id);

create policy "Bets: admins manage" on public.bets
  for all using (exists (select 1 from public.users
                         where id = auth.uid()
                           and role in ('admin','super_admin')));

/* Participants */
create policy "Participants: view" on public.bet_participants
  for select using (true);

create policy "Participants: join" on public.bet_participants
  for insert with check (auth.uid() = user_id);

create policy "Participants: update own" on public.bet_participants
  for update using (auth.uid() = user_id);

/* Arbitrator decisions */
create policy "Decisions: view" on public.arbitrator_decisions
  for select using (true);

create policy "Decisions: write" on public.arbitrator_decisions
  for insert with check (
        auth.uid() = arbitrator_id
     or exists (select 1 from public.bets
                 where id = bet_id
                   and arbitrator_type = 'ai')
);

/* Credit transactions */
create policy "Ledger: user can view own" on public.credit_transactions
  for select using (auth.uid() = user_id);

create policy "Ledger: admin manage" on public.credit_transactions
  for all using (exists (select 1 from public.users
                         where id = auth.uid()
                           and role in ('admin','super_admin')));

/* Admin tables – view/manage only for admins (examples) */
create policy "Admin logs read" on public.user_management_logs
  for select using (exists (select 1 from public.users
                            where id = auth.uid()
                              and role in ('admin','super_admin')));

/* ---------- 6. Indexes -------------------------------------------------- */
create index if not exists idx_bets_creator      on public.bets(creator_id);
create index if not exists idx_bets_status       on public.bets(status);
create index if not exists idx_bets_deadline     on public.bets(deadline);
create index if not exists idx_bets_market       on public.bets(market_id);
create index if not exists idx_participants_bet  on public.bet_participants(bet_id);
create index if not exists idx_participants_pred on public.bet_participants(bet_id,prediction);
create index if not exists idx_users_role        on public.users(role);
create index if not exists idx_markets_category  on public.markets(category,is_active);
create index if not exists idx_reports_status    on public.content_reports(status);
create index if not exists idx_decisions_bet     on public.arbitrator_decisions(bet_id);

/* ---------- 7. Seed default markets ------------------------------------ */
insert into public.markets (name, description, category, is_active)
values  ('Sports','Sports betting and predictions','sports',true),
        ('Politics','Political predictions and outcomes','politics',true),
        ('Cryptocurrency','Crypto price predictions and trends','crypto',true),
        ('Weather','Weather forecasts and climate events','weather',true),
        ('Entertainment','Movies, TV, celebrity events','entertainment',true)
on conflict (name) do nothing;

/* =========================================================================
   END OF MIGRATION
   ========================================================================= */
