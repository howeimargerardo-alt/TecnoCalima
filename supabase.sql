create table if not exists public.products (
  id bigint primary key,
  name text not null,
  category text not null,
  price bigint not null default 0,
  "oldPrice" bigint,
  image text not null,
  badge text,
  rating integer not null default 5,
  stock integer not null default 0
);

alter table public.products enable row level security;

drop policy if exists "Public read products" on public.products;
create policy "Public read products"
  on public.products for select
  using (true);

drop policy if exists "Public demo product management" on public.products;
create policy "Public demo product management"
  on public.products for all
  using (true)
  with check (true);

create table if not exists public.orders (
  id text primary key,
  customer text not null,
  total bigint not null default 0,
  status text not null default 'Pendiente'
    check (status in ('Pendiente', 'Procesando', 'Completado')),
  date text,
  items integer not null default 0,
  cart_items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

grant select, insert, update, delete on table public.products to anon, authenticated;
grant select, insert, update, delete on table public.orders to anon, authenticated;

drop policy if exists "Public read orders" on public.orders;
create policy "Public read orders"
  on public.orders for select
  using (true);

drop policy if exists "Public insert orders" on public.orders;
create policy "Public insert orders"
  on public.orders for insert
  with check (true);

drop policy if exists "Public update orders" on public.orders;
create policy "Public update orders"
  on public.orders for update
  using (true)
  with check (true);
