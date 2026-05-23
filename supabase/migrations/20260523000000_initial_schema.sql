-- Burnline v1 schema

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  currency text not null default 'SGD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.budget_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  income_amount_cents integer not null check (income_amount_cents >= 0),
  income_frequency text not null check (
    income_frequency in ('weekly', 'fortnightly', 'monthly')
  ),
  next_payday date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.savings_targets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  amount_cents integer not null check (amount_cents >= 0),
  frequency text not null check (
    frequency in ('weekly', 'fortnightly', 'monthly', 'annually')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bill_streams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  category text not null,
  frequency text not null check (
    frequency in ('weekly', 'fortnightly', 'monthly', 'quarterly', 'annually')
  ),
  estimated_amount_cents integer not null check (estimated_amount_cents >= 0),
  is_active boolean not null default true,
  estimation_method text not null default 'rolling_average',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bill_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  bill_stream_id uuid not null references public.bill_streams (id) on delete cascade,
  amount_cents integer not null check (amount_cents >= 0),
  paid_on date not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.manual_spends (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  amount_cents integer not null check (amount_cents > 0),
  category text not null,
  note text,
  spent_on date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists budget_settings_user_id_unique on public.budget_settings (user_id);
create index if not exists budget_settings_user_id_idx on public.budget_settings (user_id);
create index if not exists savings_targets_user_id_idx on public.savings_targets (user_id);
create index if not exists bill_streams_user_id_idx on public.bill_streams (user_id);
create index if not exists bill_streams_active_user_idx on public.bill_streams (user_id)
where is_active = true;
create index if not exists bill_payments_user_id_idx on public.bill_payments (user_id);
create index if not exists bill_payments_bill_stream_id_idx on public.bill_payments (bill_stream_id);
create index if not exists bill_payments_user_paid_on_idx on public.bill_payments (user_id, paid_on);
create index if not exists manual_spends_user_id_idx on public.manual_spends (user_id);
create index if not exists manual_spends_user_spent_on_idx on public.manual_spends (user_id, spent_on);

alter table public.profiles enable row level security;
alter table public.budget_settings enable row level security;
alter table public.savings_targets enable row level security;
alter table public.bill_streams enable row level security;
alter table public.bill_payments enable row level security;
alter table public.manual_spends enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());

create policy "profiles_insert_own" on public.profiles
  for insert with check (id = auth.uid());

create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());

create policy "budget_settings_select_own" on public.budget_settings
  for select using (user_id = auth.uid());

create policy "budget_settings_insert_own" on public.budget_settings
  for insert with check (user_id = auth.uid());

create policy "budget_settings_update_own" on public.budget_settings
  for update using (user_id = auth.uid());

create policy "budget_settings_delete_own" on public.budget_settings
  for delete using (user_id = auth.uid());

create policy "savings_targets_select_own" on public.savings_targets
  for select using (user_id = auth.uid());

create policy "savings_targets_insert_own" on public.savings_targets
  for insert with check (user_id = auth.uid());

create policy "savings_targets_update_own" on public.savings_targets
  for update using (user_id = auth.uid());

create policy "savings_targets_delete_own" on public.savings_targets
  for delete using (user_id = auth.uid());

create policy "bill_streams_select_own" on public.bill_streams
  for select using (user_id = auth.uid());

create policy "bill_streams_insert_own" on public.bill_streams
  for insert with check (user_id = auth.uid());

create policy "bill_streams_update_own" on public.bill_streams
  for update using (user_id = auth.uid());

create policy "bill_streams_delete_own" on public.bill_streams
  for delete using (user_id = auth.uid());

create policy "bill_payments_select_own" on public.bill_payments
  for select using (user_id = auth.uid());

create policy "bill_payments_insert_own" on public.bill_payments
  for insert with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.bill_streams bs
      where bs.id = bill_stream_id
        and bs.user_id = auth.uid()
    )
  );

create policy "bill_payments_update_own" on public.bill_payments
  for update using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.bill_streams bs
      where bs.id = bill_stream_id
        and bs.user_id = auth.uid()
    )
  );

create policy "bill_payments_delete_own" on public.bill_payments
  for delete using (user_id = auth.uid());

create policy "manual_spends_select_own" on public.manual_spends
  for select using (user_id = auth.uid());

create policy "manual_spends_insert_own" on public.manual_spends
  for insert with check (user_id = auth.uid());

create policy "manual_spends_update_own" on public.manual_spends
  for update using (user_id = auth.uid());

create policy "manual_spends_delete_own" on public.manual_spends
  for delete using (user_id = auth.uid());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
