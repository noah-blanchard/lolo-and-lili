-- 0019 — Atomic treats adjustment.
-- Replaces read-modify-write on pets.treats (spendTreats / awardTreats /
-- rewardFromChore) which could lose increments when both partners act at once
-- (F-008). Single UPDATE ... = greatest(0, treats + delta) is atomic and can
-- never drive the wallet negative. SECURITY INVOKER (default) so the caller's
-- RLS still scopes the update to their own couple's pet.

create or replace function public.adjust_treats(p_pet_id uuid, p_delta int)
returns int
language plpgsql
set search_path = public
as $$
declare
  new_treats int;
begin
  update public.pets
    set treats = greatest(0, treats + p_delta)
    where id = p_pet_id
    returning treats into new_treats;
  return new_treats;
end
$$;
