-- Lolo & Lili — love coupons: mint sweet redeemable coupons for your partner.
-- Optionally cost treats from the shared pet wallet. Run in the Supabase SQL
-- editor (or `supabase db push`), then `bun run gen:types`.

create table if not exists public.coupons (
  id          uuid primary key default gen_random_uuid(),
  couple_id   uuid not null references public.couples (id) on delete cascade,
  created_by  uuid references public.profiles (id) on delete set null,
  title       text not null check (char_length(title) between 1 and 60),
  emoji       text not null default '🎟️',
  cost_treats int  not null default 0 check (cost_treats >= 0),
  status      text not null default 'available' check (status in ('available','redeemed')),
  redeemed_by uuid references public.profiles (id) on delete set null,
  redeemed_at timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists coupons_couple_created_idx
  on public.coupons (couple_id, created_at desc);

alter table public.coupons enable row level security;

create policy coupons_all on public.coupons
  for all using (couple_id = public.current_couple_id())
  with check (couple_id = public.current_couple_id());

alter publication supabase_realtime add table public.coupons;
