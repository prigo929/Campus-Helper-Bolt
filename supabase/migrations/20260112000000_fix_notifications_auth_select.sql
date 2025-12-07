-- Fix notifications RLS to avoid per-row auth.uid() re-evaluation
-- Supabase recommends wrapping auth.* calls in a SELECT for better performance.

drop policy if exists "Notifications are selectable by owner" on public.notifications;
drop policy if exists "Notifications can be updated by owner" on public.notifications;
drop policy if exists "Notifications can be inserted by owner" on public.notifications;

create policy "Notifications are selectable by owner" on public.notifications
  for select using ((select auth.uid()) = user_id);

create policy "Notifications can be updated by owner" on public.notifications
  for update using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Notifications can be inserted by owner" on public.notifications
  for insert with check ((select auth.uid()) = user_id);
