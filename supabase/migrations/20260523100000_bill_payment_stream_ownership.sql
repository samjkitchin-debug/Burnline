-- Enforce bill_payments only reference the current user's bill_streams.
-- Apply this if 20260523000000_initial_schema.sql was already run with weaker policies.

drop policy if exists "bill_payments_insert_own" on public.bill_payments;
drop policy if exists "bill_payments_update_own" on public.bill_payments;

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
