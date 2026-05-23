-- Financial tracking start (local calendar date); timezone already on profiles from prior migration
alter table public.profiles
  add column if not exists tracking_start_date date;

comment on column public.profiles.tracking_start_date is
  'First local calendar day the user began tracking spends (profile timezone). Null until onboarding completes.';
