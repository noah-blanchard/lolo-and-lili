-- 0018 — Enforce the two-member couple limit at the database level.
-- Defense in depth for the application check in joinCouple(): a couple is
-- exactly two people. A cross-row count can't be expressed as a CHECK
-- constraint, so use a BEFORE INSERT OR UPDATE trigger that rejects linking a
-- profile to a couple that already has two *other* members.

create or replace function public.enforce_couple_member_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  member_count int;
begin
  if new.couple_id is null then
    return new;
  end if;

  select count(*) into member_count
  from public.profiles
  where couple_id = new.couple_id
    and id <> new.id;

  if member_count >= 2 then
    raise exception 'couple % already has two members', new.couple_id
      using errcode = 'check_violation';
  end if;

  return new;
end
$$;

drop trigger if exists enforce_couple_member_limit on public.profiles;
create trigger enforce_couple_member_limit
  before insert or update of couple_id on public.profiles
  for each row execute function public.enforce_couple_member_limit();
