-- Profile timezone for local calendar-day correctness (v1 default: Asia/Singapore)
alter table public.profiles
  add column if not exists timezone text not null default 'Asia/Singapore';

-- v1: one active savings target per user
create unique index if not exists savings_targets_user_id_unique
  on public.savings_targets (user_id);
