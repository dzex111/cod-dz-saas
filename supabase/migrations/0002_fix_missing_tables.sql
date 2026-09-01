-- ============================================
-- إصلاح 0002: جداول وأعمدة مفقودة
-- هذا الملف يضيف ما ينقص الهجرة الأولى
-- ============================================

-- ============================================
-- 1. أعمدة مفقودة في جدول merchants
-- ============================================
alter table merchants add column if not exists logo_url text;
alter table merchants add column if not exists description text;
alter table merchants add column if not exists primary_color varchar(20) default '#18181b';
alter table merchants add column if not exists banner_url text;

-- ============================================
-- 2. عمود مفقود في جدول products
-- ============================================
alter table products add column if not exists category varchar(100);

-- ============================================
-- 3. جدول سجل تغييرات الطلبات (order_logs)
-- ============================================
create table if not exists order_logs (
    id uuid primary key default uuid_generate_v4(),
    order_id uuid references orders(id) on delete cascade not null,
    merchant_id uuid references merchants(id) on delete cascade not null,
    action varchar(100) not null,
    old_value text,
    new_value text,
    created_by uuid references auth.users(id),
    created_at timestamptz default now()
);
create index if not exists idx_order_logs_order on order_logs(order_id);
create index if not exists idx_order_logs_merchant on order_logs(merchant_id);

-- ============================================
-- 4. جدول الكوبونات (coupons)
-- ============================================
create table if not exists coupons (
    id uuid primary key default uuid_generate_v4(),
    merchant_id uuid references merchants(id) on delete cascade not null,
    code varchar(50) not null,
    discount_percent int not null check (discount_percent > 0 and discount_percent <= 90),
    is_active boolean default true,
    created_at timestamptz default now(),
    unique(merchant_id, code)
);
create index if not exists idx_coupons_merchant on coupons(merchant_id);

-- ============================================
-- 5. جدول التقييمات (reviews)
-- ============================================
create table if not exists reviews (
    id uuid primary key default uuid_generate_v4(),
    merchant_id uuid references merchants(id) on delete cascade not null,
    product_id uuid references products(id) on delete cascade not null,
    customer_name varchar(100) not null,
    rating int not null check (rating >= 1 and rating <= 5),
    comment text,
    is_approved boolean default true,
    created_at timestamptz default now()
);
create index if not exists idx_reviews_product on reviews(product_id);

-- ============================================
-- تفعيل RLS على الجداول الجديدة
-- ============================================
alter table order_logs enable row level security;
alter table coupons enable row level security;
alter table reviews enable row level security;

-- ============================================
-- سياسات RLS للجداول الجديدة
-- ============================================
create policy "order_logs_all" on order_logs for all using (is_merchant_member(merchant_id));
create policy "coupons_all" on coupons for all using (is_merchant_member(merchant_id));
create policy "reviews_select" on reviews for select using (true);
create policy "reviews_insert" on reviews for insert with check (true);
create policy "reviews_merchant" on reviews for update using (is_merchant_member(merchant_id));
create policy "reviews_merchant_delete" on reviews for delete using (is_merchant_member(merchant_id));

-- ============================================
-- Storage bucket لصور المنتجات (مجاني)
-- ============================================
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true) on conflict (id) do nothing;

create policy "product_images_upload" on storage.objects for insert with check (bucket_id = 'product-images' and auth.role() = 'authenticated');
create policy "product_images_public" on storage.objects for select using (bucket_id = 'product-images');
create policy "product_images_merchant" on storage.objects for all using (bucket_id = 'product-images');
