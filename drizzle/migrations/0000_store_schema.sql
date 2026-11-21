create type public.app_role as enum ('admin', 'moderator', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;
grant execute on function public.has_role(uuid, public.app_role) to anon, authenticated;

create policy "Users read own roles" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "Admins manage roles" on public.user_roles for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create or replace function public.handle_first_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin') on conflict do nothing;
  end if;
  return new;
end;
$$;
create trigger on_auth_user_created_first_admin
  after insert on auth.users for each row execute function public.handle_first_admin();

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  image_url text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "Public read active categories" on public.categories for select to anon, authenticated
  using (is_active or public.has_role(auth.uid(), 'admin'));
create policy "Admins manage categories" on public.categories for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  name_en text,
  logo_url text,
  created_at timestamptz not null default now()
);
grant select on public.brands to anon, authenticated;
grant insert, update, delete on public.brands to authenticated;
grant all on public.brands to service_role;
alter table public.brands enable row level security;
create policy "Public read brands" on public.brands for select to anon, authenticated using (true);
create policy "Admins manage brands" on public.brands for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  brand_id uuid references public.brands(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  sku text,
  model_number text,
  short_description text,
  description text,
  price numeric(12,0) not null check (price >= 0),
  old_price numeric(12,0) check (old_price is null or old_price >= 0),
  stock int not null default 0 check (stock >= 0),
  images text[] not null default '{}',
  video_url text,
  video_poster text,
  video_orientation text not null default 'horizontal' check (video_orientation in ('horizontal','vertical')),
  specs jsonb not null default '[]'::jsonb,
  features text[] not null default '{}',
  colors jsonb not null default '[]'::jsonb,
  warranty text,
  is_published boolean not null default true,
  is_featured boolean not null default false,
  is_new boolean not null default false,
  is_bestseller boolean not null default false,
  rating numeric(2,1) not null default 0,
  review_count int not null default 0,
  sales_count int not null default 0,
  created_at timestamptz not null default now()
);
create index products_category_idx on public.products(category_id);
create index products_brand_idx on public.products(brand_id);
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "Public read published products" on public.products for select to anon, authenticated
  using (is_published or public.has_role(auth.uid(), 'admin'));
create policy "Admins manage products" on public.products for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  customer_name text not null check (char_length(customer_name) between 2 and 60),
  rating int not null check (rating between 1 and 5),
  comment text check (comment is null or char_length(comment) <= 1000),
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, insert on public.reviews to anon, authenticated;
grant update, delete on public.reviews to authenticated;
grant all on public.reviews to service_role;
alter table public.reviews enable row level security;
create policy "Public read approved reviews" on public.reviews for select to anon, authenticated
  using (is_approved or public.has_role(auth.uid(), 'admin'));
create policy "Anyone can submit a pending review" on public.reviews for insert to anon, authenticated
  with check (is_approved = false);
create policy "Admins manage reviews" on public.reviews for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create or replace function public.refresh_product_rating()
returns trigger language plpgsql security definer set search_path = public as $$
declare pid uuid;
begin
  pid := coalesce(new.product_id, old.product_id);
  update public.products p set
    rating = coalesce((select round(avg(rating)::numeric, 1) from public.reviews where product_id = pid and is_approved), 0),
    review_count = (select count(*) from public.reviews where product_id = pid and is_approved)
  where p.id = pid;
  return null;
end;
$$;
create trigger reviews_refresh_rating after insert or update or delete on public.reviews
  for each row execute function public.refresh_product_rating();

create table public.banners (
  id uuid primary key default gen_random_uuid(),
  placement text not null default 'hero' check (placement in ('hero','promo')),
  eyebrow text,
  title text not null,
  subtitle text,
  image_url text not null,
  cta_label text,
  cta_link text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.banners to anon, authenticated;
grant insert, update, delete on public.banners to authenticated;
grant all on public.banners to service_role;
alter table public.banners enable row level security;
create policy "Public read active banners" on public.banners for select to anon, authenticated
  using (is_active or public.has_role(auth.uid(), 'admin'));
create policy "Admins manage banners" on public.banners for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.faqs to anon, authenticated;
grant insert, update, delete on public.faqs to authenticated;
grant all on public.faqs to service_role;
alter table public.faqs enable row level security;
create policy "Public read faqs" on public.faqs for select to anon, authenticated using (true);
create policy "Admins manage faqs" on public.faqs for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create table public.store_settings (
  id int primary key default 1 check (id = 1),
  store_name text not null default 'باسم الغيث',
  whatsapp text not null default '9647886443032',
  phone text not null default '07886443032',
  email text,
  address text,
  working_hours text,
  about_text text,
  delivery_fee numeric(12,0) not null default 10000,
  free_delivery_threshold numeric(12,0) not null default 500000,
  cod_enabled boolean not null default true,
  bank_transfer_enabled boolean not null default true,
  online_payment_enabled boolean not null default false,
  bank_details text,
  instagram text,
  facebook text,
  tiktok text,
  updated_at timestamptz not null default now()
);
grant select on public.store_settings to anon, authenticated;
grant update on public.store_settings to authenticated;
grant all on public.store_settings to service_role;
alter table public.store_settings enable row level security;
create policy "Public read settings" on public.store_settings for select to anon, authenticated using (true);
create policy "Admins update settings" on public.store_settings for update to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create sequence public.order_number_seq start 10241;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null,
  phone text not null,
  city text not null,
  address text not null,
  notes text,
  payment_method text not null check (payment_method in ('cod','bank_transfer','online')),
  status text not null default 'pending' check (status in ('pending','confirmed','shipped','delivered','cancelled')),
  status_history jsonb not null default '[]'::jsonb,
  subtotal numeric(12,0) not null,
  savings numeric(12,0) not null default 0,
  delivery_fee numeric(12,0) not null default 0,
  total numeric(12,0) not null,
  created_at timestamptz not null default now()
);
grant select, update, delete on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "Admins manage orders" on public.orders for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_image text,
  color text,
  unit_price numeric(12,0) not null,
  quantity int not null check (quantity > 0)
);
grant select, update, delete on public.order_items to authenticated;
grant all on public.order_items to service_role;
alter table public.order_items enable row level security;
create policy "Admins manage order items" on public.order_items for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create or replace function public.track_order_status_change()
returns trigger language plpgsql set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    new.status_history := jsonb_build_array(jsonb_build_object('status', new.status, 'at', now()));
  elsif new.status is distinct from old.status then
    new.status_history := coalesce(old.status_history, '[]'::jsonb) || jsonb_build_object('status', new.status, 'at', now());
  end if;
  return new;
end;
$$;
create trigger orders_status_history before insert or update on public.orders
  for each row execute function public.track_order_status_change();

create or replace function public.place_order(p_customer jsonb, p_items jsonb, p_payment text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  s public.store_settings;
  v_name text := btrim(coalesce(p_customer->>'name', ''));
  v_phone text := regexp_replace(coalesce(p_customer->>'phone', ''), '[^0-9]', '', 'g');
  v_city text := btrim(coalesce(p_customer->>'city', ''));
  v_address text := btrim(coalesce(p_customer->>'address', ''));
  v_notes text := nullif(btrim(coalesce(p_customer->>'notes', '')), '');
  v_item jsonb;
  v_qty int;
  v_prod public.products;
  v_subtotal numeric := 0;
  v_savings numeric := 0;
  v_fee numeric := 0;
  v_order_id uuid;
  v_number text;
begin
  select * into s from public.store_settings where id = 1;
  if char_length(v_name) < 3 or char_length(v_name) > 80 then raise exception 'يرجى إدخال الاسم الكامل'; end if;
  if v_phone !~ '^(964)?0?7[0-9]{9}$' then raise exception 'رقم الهاتف غير صحيح'; end if;
  if char_length(v_city) < 2 or char_length(v_city) > 40 then raise exception 'يرجى اختيار المدينة'; end if;
  if char_length(v_address) < 5 or char_length(v_address) > 300 then raise exception 'يرجى إدخال العنوان بالتفصيل'; end if;
  if v_notes is not null and char_length(v_notes) > 500 then raise exception 'الملاحظات طويلة جداً'; end if;
  if p_payment not in ('cod','bank_transfer','online') then raise exception 'طريقة الدفع غير متاحة'; end if;
  if p_payment = 'cod' and not s.cod_enabled then raise exception 'طريقة الدفع غير متاحة'; end if;
  if p_payment = 'bank_transfer' and not s.bank_transfer_enabled then raise exception 'طريقة الدفع غير متاحة'; end if;
  if p_payment = 'online' and not s.online_payment_enabled then raise exception 'طريقة الدفع غير متاحة'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 30 then
    raise exception 'السلة فارغة';
  end if;

  v_number := 'BG-' || nextval('public.order_number_seq')::text;
  insert into public.orders (order_number, customer_name, phone, city, address, notes, payment_method, subtotal, savings, delivery_fee, total)
  values (v_number, v_name, v_phone, v_city, v_address, v_notes, p_payment, 0, 0, 0, 0)
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := coalesce((v_item->>'quantity')::int, 0);
    if v_qty < 1 or v_qty > 20 then raise exception 'كمية غير صحيحة'; end if;
    select * into v_prod from public.products where id = (v_item->>'product_id')::uuid and is_published for update;
    if not found then raise exception 'أحد المنتجات لم يعد متوفراً'; end if;
    if v_prod.stock < v_qty then raise exception 'الكمية المطلوبة من "%" غير متوفرة', v_prod.name; end if;
    update public.products set stock = stock - v_qty, sales_count = sales_count + v_qty where id = v_prod.id;
    insert into public.order_items (order_id, product_id, product_name, product_image, color, unit_price, quantity)
    values (v_order_id, v_prod.id, v_prod.name, v_prod.images[1], left(nullif(v_item->>'color', ''), 40), v_prod.price, v_qty);
    v_subtotal := v_subtotal + v_prod.price * v_qty;
    if v_prod.old_price is not null and v_prod.old_price > v_prod.price then
      v_savings := v_savings + (v_prod.old_price - v_prod.price) * v_qty;
    end if;
  end loop;

  v_fee := case when v_subtotal >= s.free_delivery_threshold then 0 else s.delivery_fee end;
  update public.orders set subtotal = v_subtotal, savings = v_savings, delivery_fee = v_fee, total = v_subtotal + v_fee
  where id = v_order_id;

  return jsonb_build_object('order_number', v_number, 'total', v_subtotal + v_fee);
end;
$$;
grant execute on function public.place_order(jsonb, jsonb, text) to anon, authenticated;

create or replace function public.track_order(p_order_number text, p_phone text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare o public.orders; v_phone text := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
begin
  if char_length(v_phone) < 9 then return null; end if;
  select * into o from public.orders
  where upper(order_number) = upper(btrim(p_order_number))
    and right(phone, 9) = right(v_phone, 9);
  if not found then return null; end if;
  return jsonb_build_object(
    'order_number', o.order_number, 'status', o.status, 'status_history', o.status_history,
    'created_at', o.created_at, 'city', o.city, 'customer_name', o.customer_name,
    'payment_method', o.payment_method, 'subtotal', o.subtotal, 'delivery_fee', o.delivery_fee,
    'savings', o.savings, 'total', o.total,
    'items', (select coalesce(jsonb_agg(jsonb_build_object('name', product_name, 'image', product_image, 'quantity', quantity, 'unit_price', unit_price, 'color', color)), '[]'::jsonb)
              from public.order_items where order_id = o.id)
  );
end;
$$;
grant execute on function public.track_order(text, text) to anon, authenticated;

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  phone text check (phone is null or char_length(phone) <= 20),
  subject text check (subject is null or char_length(subject) <= 120),
  message text not null check (char_length(message) between 5 and 2000),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
grant insert on public.contact_messages to anon, authenticated;
grant select, update, delete on public.contact_messages to authenticated;
grant all on public.contact_messages to service_role;
alter table public.contact_messages enable row level security;
create policy "Anyone can send a message" on public.contact_messages for insert to anon, authenticated with check (is_read = false);
create policy "Admins manage messages" on public.contact_messages for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 200),
  created_at timestamptz not null default now()
);
grant insert on public.newsletter_subscribers to anon, authenticated;
grant select, delete on public.newsletter_subscribers to authenticated;
grant all on public.newsletter_subscribers to service_role;
alter table public.newsletter_subscribers enable row level security;
create policy "Anyone can subscribe" on public.newsletter_subscribers for insert to anon, authenticated with check (true);
create policy "Admins manage subscribers" on public.newsletter_subscribers for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "Public read media" on storage.objects for select to anon, authenticated using (bucket_id = 'media');
create policy "Admins upload media" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.has_role(auth.uid(), 'admin'));
create policy "Admins update media" on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.has_role(auth.uid(), 'admin'));
create policy "Admins delete media" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.has_role(auth.uid(), 'admin'));