-- تفعيل الإضافات المطلوبة
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================
-- 1. جدول التجار (المستأجرين)
-- ============================================
create table if not exists merchants (
    id uuid primary key default uuid_generate_v4(),
    owner_user_id uuid references auth.users(id) on delete cascade not null,
    business_name varchar(150) not null,
    subdomain varchar(50) unique not null,
    custom_domain varchar(100) unique,
    phone varchar(20) not null,
    subscription_status varchar(20) default 'trial',
    trial_ends_at timestamptz default (now() + interval '14 days'),
    subscription_ends_at timestamptz,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- ============================================
-- 2. جدول أعضاء الفريق
-- ============================================
create table if not exists merchant_members (
    id uuid primary key default uuid_generate_v4(),
    merchant_id uuid references merchants(id) on delete cascade not null,
    user_id uuid references auth.users(id) on delete cascade not null,
    role varchar(30) default 'admin',
    created_at timestamptz default now(),
    unique(merchant_id, user_id)
);

-- ============================================
-- 3. جدول المنتجات
-- ============================================
create table if not exists products (
    id uuid primary key default uuid_generate_v4(),
    merchant_id uuid references merchants(id) on delete cascade not null,
    name varchar(255) not null,
    slug varchar(255) not null,
    description text,
    price numeric(10,2) not null,
    compare_at_price numeric(10,2),
    image_url text,
    stock_quantity int default 0,
    is_active boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(merchant_id, slug)
);

-- ============================================
-- 4. إعدادات الشحن
-- ============================================
create table if not exists shipping_configs (
    id uuid primary key default uuid_generate_v4(),
    merchant_id uuid references merchants(id) on delete cascade not null,
    provider_name varchar(50) not null,
    api_id varchar(255) not null,
    api_token varchar(255) not null,
    is_active boolean default true,
    created_at timestamptz default now(),
    unique(merchant_id, provider_name)
);

-- ============================================
-- 5. جدول الطلبات
-- ============================================
create table if not exists orders (
    id uuid primary key default uuid_generate_v4(),
    merchant_id uuid references merchants(id) on delete cascade not null,
    product_id uuid references products(id) on delete set null,
    customer_name varchar(150) not null,
    customer_phone varchar(20) not null,
    wilaya_code varchar(10) not null,
    wilaya_name varchar(100) not null,
    baladia_name varchar(100) not null,
    address text not null,
    total_price numeric(10,2) not null,
    confirmation_status varchar(30) default 'pending',
    shipping_status varchar(50) default 'not_shipped',
    shipping_provider varchar(50),
    tracking_number varchar(100),
    waybill_pdf_url text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
create index if not exists idx_orders_merchant_status on orders(merchant_id, confirmation_status);
create index if not exists idx_orders_merchant_shipping on orders(merchant_id, shipping_status);
create index if not exists idx_orders_phone on orders(customer_phone);

-- ============================================
-- 6. القائمة السوداء
-- ============================================
create table if not exists blacklists (
    id uuid primary key default uuid_generate_v4(),
    merchant_id uuid references merchants(id) on delete cascade not null,
    phone_number varchar(20) not null,
    reason varchar(255),
    created_at timestamptz default now(),
    unique(merchant_id, phone_number)
);

-- ============================================
-- 7. مدفوعات الاشتراكات
-- ============================================
create table if not exists subscription_payments (
    id uuid primary key default uuid_generate_v4(),
    merchant_id uuid references merchants(id) on delete cascade not null,
    payment_method varchar(30) not null,
    transaction_reference varchar(100) unique not null,
    amount numeric(10,2) not null,
    proof_image_path text,
    status varchar(20) default 'pending',
    approved_at timestamptz,
    created_at timestamptz default now()
);

-- ============================================
-- تفعيل RLS
-- ============================================
alter table merchants enable row level security;
alter table merchant_members enable row level security;
alter table products enable row level security;
alter table shipping_configs enable row level security;
alter table orders enable row level security;
alter table blacklists enable row level security;
alter table subscription_payments enable row level security;

-- دالة مساعدة
create or replace function is_merchant_member(target_merchant_id uuid)
returns boolean as $$
  select exists (
    select 1 from merchant_members
    where merchant_id = target_merchant_id
    and user_id = auth.uid()
  );
$$ language sql security definer stable;

-- سياسات RLS
drop policy if exists "merchants_select" on merchants;
create policy "merchants_select" on merchants for select using (is_merchant_member(id));
drop policy if exists "merchants_update" on merchants;
create policy "merchants_update" on merchants for update using (is_merchant_member(id));
drop policy if exists "merchants_insert" on merchants;
create policy "merchants_insert" on merchants for insert with check (auth.uid() = owner_user_id);

drop policy if exists "merchant_members_all" on merchant_members;
create policy "merchant_members_all" on merchant_members for all using (is_merchant_member(merchant_id) or auth.uid() = user_id);

drop policy if exists "products_all" on products;
create policy "products_all" on products for all using (is_merchant_member(merchant_id));

drop policy if exists "shipping_configs_all" on shipping_configs;
create policy "shipping_configs_all" on shipping_configs for all using (is_merchant_member(merchant_id));

drop policy if exists "orders_all" on orders;
create policy "orders_all" on orders for all using (is_merchant_member(merchant_id));

drop policy if exists "blacklists_all" on blacklists;
create policy "blacklists_all" on blacklists for all using (is_merchant_member(merchant_id));

drop policy if exists "subscription_payments_select" on subscription_payments;
create policy "subscription_payments_select" on subscription_payments for select using (is_merchant_member(merchant_id));
drop policy if exists "subscription_payments_insert" on subscription_payments;
create policy "subscription_payments_insert" on subscription_payments for insert with check (is_merchant_member(merchant_id));

-- Storage bucket for baridimob proofs
insert into storage.buckets (id, name, public) values ('baridimob-proofs', 'baridimob-proofs', false) on conflict (id) do nothing;

create policy "baridimob_upload" on storage.objects for insert with check (bucket_id = 'baridimob-proofs' and auth.role() = 'authenticated');
create policy "baridimob_select" on storage.objects for select using (bucket_id = 'baridimob-proofs' and auth.role() = 'authenticated');
create policy "baridimob_admin" on storage.objects for all using (bucket_id = 'baridimob-proofs');
