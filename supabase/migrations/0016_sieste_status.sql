alter table public.statuses
  drop constraint if exists statuses_state_check,
  add constraint statuses_state_check
    check (state in ('free', 'busy', 'sieste'));
