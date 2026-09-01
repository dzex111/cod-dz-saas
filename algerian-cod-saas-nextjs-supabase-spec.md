# وثيقة المواصفات الفنية الكاملة — منصة إدارة تجارة COD في الجزائر
## دليل التطوير الكامل لوكيل الذكاء الاصطناعي — Next.js + Supabase (نسخة مجانية بالكامل للبداية)

> هذه الوثيقة تحل محل أي مواصفات سابقة مبنية على Laravel/PHP. المنطق التجاري (نظام الولايات، القائمة السوداء، حالات الطلب، الاشتراكات) محفوظ بالكامل، لكن التنفيذ التقني بالكامل مبني على ستاك حديث، مجاني في البداية، ويتوسع لاحقاً بسهولة.

---

## 0. لماذا هذا الستاك (ملخص القرار)

| الطبقة | التقنية | التكلفة عند البداية |
|---|---|---|
| الواجهة + الخلفية (Full-stack) | **Next.js 15 (App Router)** على **Vercel** | مجاني (Hobby Plan) |
| قاعدة البيانات + المصادقة + التخزين | **Supabase** (PostgreSQL + Auth + Storage) | مجاني (Free Tier) |
| عزل بيانات التجار | **Row Level Security (RLS)** في PostgreSQL | مدمج مجاناً |
| الدفع التلقائي | **Chargily Pay v2** (نفس الخطة الأصلية) | عمولة على المعاملات فقط |
| الدفع اليدوي | **BaridiMob** (رفع إيصال + مراجعة يدوية) | مجاني |
| الشحن | **Yalidine API** (كل تاجر بحسابه الخاص) | مجاني (كل تاجر يدفع لـ Yalidine مباشرة) |
| النطاقات الفرعية | Vercel Wildcard Domains + Cloudflare DNS | مجاني |

**النتيجة:** المشروع بالكامل يشتغل على Free Tier إلى أن يكبر حجم الاستخدام (مئات التجار)، وعندها تدفع فقط لما تستهلكه فعلياً — بدون أي إعادة بناء (rewrite).

---

## 1. البنية التقنية والمعمارية (Architecture)

### 1.1 نموذج تعدد المستأجرين (Multi-Tenancy)
- قاعدة بيانات واحدة مشتركة في Supabase (PostgreSQL).
- كل جدول مرتبط بـ `merchant_id`.
- **الفرق الجوهري عن Laravel:** بدلاً من الاعتماد فقط على كود PHP (Global Scope) لمنع تسرب البيانات، نستخدم **Row Level Security (RLS)** على مستوى قاعدة البيانات نفسها. هذا يعني حتى لو نسي المطور (أو الوكيل) شرط `WHERE merchant_id = ...` في مكان ما، قاعدة البيانات **ترفض** إرجاع بيانات تاجر آخر تلقائياً. هذا أمان حقيقي على مستوى أعمق من الكود.

### 1.2 هيكل المشروع (Next.js App Router)
```
app/
├── (public)/
│   ├── page.tsx                          # الصفحة الرئيسية للمنصة (تسويق)
│   ├── pricing/page.tsx                  # صفحة الأسعار والاشتراكات
│   └── [subdomain]/
│       └── p/[slug]/
│           └── page.tsx                  # صفحة الهبوط الديناميكية للمنتج (SSR)
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── (merchant)/
│   └── dashboard/
│       ├── layout.tsx                    # يتحقق من الجلسة وحالة الاشتراك
│       ├── page.tsx                      # لوحة الإحصائيات
│       ├── products/
│       │   ├── page.tsx
│       │   └── [id]/page.tsx
│       ├── orders/
│       │   └── page.tsx                  # جدول الطلبات + أزرار التأكيد/الشحن
│       ├── settings/
│       │   ├── shipping/page.tsx         # ربط مفاتيح Yalidine
│       │   └── billing/page.tsx          # حالة الاشتراك ورفع إيصال BaridiMob
├── (admin)/
│   └── admin/
│       └── subscriptions/page.tsx        # مراجعة تحويلات BaridiMob (لصاحب المنصة)
├── api/
│   ├── checkout/route.ts                 # استقبال طلب الزبون من صفحة الهبوط
│   ├── orders/[id]/ship/route.ts         # إرسال الطلب لـ Yalidine
│   ├── webhooks/
│   │   └── chargily/route.ts             # استقبال ويب هوك Chargily
│   └── baridimob/submit/route.ts         # رفع إيصال بريدي موب
├── middleware.ts                          # حل النطاق الفرعي + فحص الاشتراك
lib/
├── supabase/
│   ├── server.ts                          # عميل Supabase من جهة السيرفر
│   ├── client.ts                          # عميل Supabase من جهة المتصفح
│   └── middleware.ts
├── services/
│   ├── yalidine.ts                        # التكامل مع Yalidine API
│   └── chargily.ts                        # التكامل مع Chargily API
├── validators/
│   └── order.ts                           # التحقق من رقم الهاتف الجزائري، الولايات، إلخ (Zod)
supabase/
├── migrations/
│   └── 0001_init.sql                      # كل الجداول + RLS Policies
```

---

## 2. مخطط قاعدة البيانات الكامل (Supabase / PostgreSQL)

```sql
-- تفعيل الإضافات المطلوبة
create extension if not exists "uuid-ossp";

-- ============================================
-- 1. جدول التجار (المستأجرين)
-- ============================================
create table merchants (
    id uuid primary key default uuid_generate_v4(),
    owner_user_id uuid references auth.users(id) on delete cascade not null,
    business_name varchar(150) not null,
    subdomain varchar(50) unique not null,
    custom_domain varchar(100) unique,
    phone varchar(20) not null,
    subscription_status varchar(20) default 'trial', -- trial, active, expired, suspended
    trial_ends_at timestamptz default (now() + interval '14 days'),
    subscription_ends_at timestamptz,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- ============================================
-- 2. جدول أعضاء الفريق (ربط مستخدمي Supabase Auth بالتاجر)
-- ============================================
create table merchant_members (
    id uuid primary key default uuid_generate_v4(),
    merchant_id uuid references merchants(id) on delete cascade not null,
    user_id uuid references auth.users(id) on delete cascade not null,
    role varchar(30) default 'admin', -- admin, confirmation_agent, packer
    created_at timestamptz default now(),
    unique(merchant_id, user_id)
);

-- ============================================
-- 3. جدول المنتجات
-- ============================================
create table products (
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
-- 4. إعدادات الشحن (مفاتيح Yalidine الخاصة بكل تاجر)
-- ============================================
create table shipping_configs (
    id uuid primary key default uuid_generate_v4(),
    merchant_id uuid references merchants(id) on delete cascade not null,
    provider_name varchar(50) not null, -- yalidine, zr_express
    api_id varchar(255) not null,
    api_token varchar(255) not null,
    is_active boolean default true,
    created_at timestamptz default now(),
    unique(merchant_id, provider_name)
);

-- ============================================
-- 5. جدول الطلبات
-- ============================================
create table orders (
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
    confirmation_status varchar(30) default 'pending', -- pending, confirmed, canceled, fake, double
    shipping_status varchar(50) default 'not_shipped', -- not_shipped, shipped, delivered, returned
    shipping_provider varchar(50),
    tracking_number varchar(100),
    waybill_pdf_url text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
create index idx_orders_merchant_status on orders(merchant_id, confirmation_status);
create index idx_orders_merchant_shipping on orders(merchant_id, shipping_status);
create index idx_orders_phone on orders(customer_phone);

-- ============================================
-- 6. القائمة السوداء (مكافحة الطلبات الوهمية)
-- ============================================
create table blacklists (
    id uuid primary key default uuid_generate_v4(),
    merchant_id uuid references merchants(id) on delete cascade not null,
    phone_number varchar(20) not null,
    reason varchar(255),
    created_at timestamptz default now(),
    unique(merchant_id, phone_number)
);

-- ============================================
-- 7. مدفوعات الاشتراكات (Chargily + BaridiMob)
-- ============================================
create table subscription_payments (
    id uuid primary key default uuid_generate_v4(),
    merchant_id uuid references merchants(id) on delete cascade not null,
    payment_method varchar(30) not null, -- chargily, baridimob
    transaction_reference varchar(100) unique not null,
    amount numeric(10,2) not null,
    proof_image_path text,
    status varchar(20) default 'pending', -- pending, approved, rejected
    approved_at timestamptz,
    created_at timestamptz default now()
);

-- ============================================
-- تفعيل Row Level Security على كل الجداول الحساسة
-- ============================================
alter table merchants enable row level security;
alter table merchant_members enable row level security;
alter table products enable row level security;
alter table shipping_configs enable row level security;
alter table orders enable row level security;
alter table blacklists enable row level security;
alter table subscription_payments enable row level security;

-- ============================================
-- دالة مساعدة: هل المستخدم الحالي عضو في هذا التاجر؟
-- ============================================
create or replace function is_merchant_member(target_merchant_id uuid)
returns boolean as $$
  select exists (
    select 1 from merchant_members
    where merchant_id = target_merchant_id
    and user_id = auth.uid()
  );
$$ language sql security definer stable;

-- ============================================
-- سياسات RLS: كل جدول تاجر يقيد الوصول بـ is_merchant_member()
-- ============================================
create policy "merchants_select" on merchants for select using (is_merchant_member(id));
create policy "merchants_update" on merchants for update using (is_merchant_member(id));

create policy "products_all" on products for all using (is_merchant_member(merchant_id));
create policy "shipping_configs_all" on shipping_configs for all using (is_merchant_member(merchant_id));
create policy "orders_all" on orders for all using (is_merchant_member(merchant_id));
create policy "blacklists_all" on blacklists for all using (is_merchant_member(merchant_id));
create policy "subscription_payments_select" on subscription_payments for select using (is_merchant_member(merchant_id));

-- ملاحظة مهمة: صفحات الهبوط العامة (checkout) تُقرأ عبر Service Role Key من السيرفر
-- (API route)، وليس عبر جلسة المستخدم — لذلك RLS لا تمنع الزبائن من إتمام الشراء.
```

---

## 3. عزل النطاقات الفرعية وفحص الاشتراك (Next.js Middleware)

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // مفتاح سري، يُستخدم فقط في السيرفر
)

const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'coddz.com'

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''
  const url = request.nextUrl.clone()

  // تجاهل النطاق الرئيسي (لوحة التحكم، صفحات التسويق)
  if (host === BASE_DOMAIN || host === `www.${BASE_DOMAIN}` || host.includes('localhost')) {
    return NextResponse.next()
  }

  // استخراج subdomain
  const subdomain = host.endsWith(`.${BASE_DOMAIN}`)
    ? host.replace(`.${BASE_DOMAIN}`, '')
    : null

  if (!subdomain) {
    return NextResponse.next()
  }

  // جلب بيانات التاجر والتحقق من حالة الاشتراك
  const { data: merchant } = await supabaseAdmin
    .from('merchants')
    .select('id, subscription_status, trial_ends_at, subscription_ends_at')
    .eq('subdomain', subdomain)
    .single()

  if (!merchant) {
    return NextResponse.rewrite(new URL('/store-not-found', request.url))
  }

  const isExpired =
    (merchant.subscription_status === 'trial' && new Date(merchant.trial_ends_at) < new Date()) ||
    (merchant.subscription_status === 'active' && merchant.subscription_ends_at && new Date(merchant.subscription_ends_at) < new Date()) ||
    ['expired', 'suspended'].includes(merchant.subscription_status)

  if (isExpired) {
    return NextResponse.rewrite(new URL('/store-suspended', request.url), { status: 402 })
  }

  // إعادة التوجيه الداخلي لمسار [subdomain] مع تمرير معرف التاجر
  url.pathname = `/${subdomain}${url.pathname}`
  const response = NextResponse.rewrite(url)
  response.headers.set('x-merchant-id', merchant.id)
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

---

## 4. معالجة الطلب من صفحة الهبوط (API Route)

```typescript
// app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// التحقق من صحة رقم الهاتف الجزائري (Mobilis, Djezzy, Ooredoo)
const checkoutSchema = z.object({
  merchant_subdomain: z.string(),
  product_slug: z.string(),
  customer_name: z.string().min(2).max(100),
  customer_phone: z.string().regex(/^(05|06|07)[0-9]{8}$/, 'رقم هاتف جزائري غير صحيح'),
  wilaya_code: z.string(),
  wilaya_name: z.string(),
  baladia_name: z.string(),
  address: z.string().min(5),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = checkoutSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const data = parsed.data
  const cleanPhone = data.customer_phone.replace(/[^0-9]/g, '')

  // 1. جلب التاجر والمنتج
  const { data: merchant } = await supabaseAdmin
    .from('merchants')
    .select('id, subscription_status')
    .eq('subdomain', data.merchant_subdomain)
    .single()

  if (!merchant || merchant.subscription_status === 'expired') {
    return NextResponse.json({ error: 'المتجر غير متاح حالياً' }, { status: 403 })
  }

  const { data: product } = await supabaseAdmin
    .from('products')
    .select('id, price')
    .eq('merchant_id', merchant.id)
    .eq('slug', data.product_slug)
    .single()

  if (!product) {
    return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 })
  }

  // 2. فحص القائمة السوداء
  const { data: blacklisted } = await supabaseAdmin
    .from('blacklists')
    .select('id')
    .eq('merchant_id', merchant.id)
    .eq('phone_number', cleanPhone)
    .maybeSingle()

  // 3. فحص الطلبات المكررة خلال 24 ساعة
  const { data: recentOrder } = await supabaseAdmin
    .from('orders')
    .select('id')
    .eq('merchant_id', merchant.id)
    .eq('customer_phone', cleanPhone)
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .maybeSingle()

  const confirmationStatus = blacklisted ? 'fake' : recentOrder ? 'double' : 'pending'

  // 4. إنشاء الطلب
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .insert({
      merchant_id: merchant.id,
      product_id: product.id,
      customer_name: data.customer_name,
      customer_phone: cleanPhone,
      wilaya_code: data.wilaya_code,
      wilaya_name: data.wilaya_name,
      baladia_name: data.baladia_name,
      address: data.address,
      total_price: product.price,
      confirmation_status: confirmationStatus,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'فشل إنشاء الطلب' }, { status: 500 })
  }

  return NextResponse.json({ success: true, order_id: order.id, held: confirmationStatus !== 'pending' })
}
```

---

## 5. خدمة التكامل مع Yalidine

```typescript
// lib/services/yalidine.ts
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const YALIDINE_BASE_URL = 'https://api.yalidine.app/v1'

export async function createYalidineShipment(orderId: string) {
  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('*, products(name)')
    .eq('id', orderId)
    .single()

  if (!order) throw new Error('الطلب غير موجود')

  const { data: config } = await supabaseAdmin
    .from('shipping_configs')
    .select('*')
    .eq('merchant_id', order.merchant_id)
    .eq('provider_name', 'yalidine')
    .eq('is_active', true)
    .single()

  if (!config) {
    throw new Error('لم يقم التاجر بربط حساب Yalidine بعد')
  }

  const payload = [{
    order_id: `ORD-${order.id}`,
    firstname: order.customer_name,
    familyname: '',
    contact_phone: order.customer_phone,
    address: order.address,
    to_wilaya_name: order.wilaya_name,
    to_commune_name: order.baladia_name,
    product_list: order.products?.name || 'منتج',
    price: Math.round(order.total_price),
    is_stopdesk: false,
    freeshipping: false,
  }]

  const response = await fetch(`${YALIDINE_BASE_URL}/parcels`, {
    method: 'POST',
    headers: {
      'X-API-ID': config.api_id,
      'X-API-TOKEN': config.api_token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`فشل الاتصال بـ Yalidine: ${errorBody}`)
  }

  const result = await response.json()
  const parcelInfo = result[`ORD-${order.id}`]

  if (!parcelInfo || !parcelInfo.success) {
    throw new Error('Yalidine رفضت الطلب — تحقق من صحة البيانات')
  }

  await supabaseAdmin
    .from('orders')
    .update({
      shipping_status: 'shipped',
      tracking_number: parcelInfo.tracking,
      waybill_pdf_url: parcelInfo.label,
      shipping_provider: 'yalidine',
    })
    .eq('id', orderId)

  return { tracking: parcelInfo.tracking, label: parcelInfo.label }
}
```

> ⚠️ **ملاحظة مهمة يجب أن يعرفها الوكيل:** بنية طلب/رد Yalidine API الفعلية قد تختلف قليلاً بين نسخ التوثيق. على الوكيل **جلب توثيق Yalidine API الرسمي الحالي** (https://yalidine.app أو من لوحة تحكم التاجر على Yalidine) والتحقق من أسماء الحقول بالضبط قبل الربط النهائي، بدلاً من الاعتماد فقط على هذا المثال.

---

## 6. ويب هوك Chargily (تفعيل الاشتراكات تلقائياً)

```typescript
// app/api/webhooks/chargily/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const signature = req.headers.get('signature') || ''
  const rawBody = await req.text()

  const computedSignature = crypto
    .createHmac('sha256', process.env.CHARGILY_SECRET_KEY!)
    .update(rawBody)
    .digest('hex')

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computedSignature))) {
    return NextResponse.json({ error: 'توقيع غير صالح' }, { status: 400 })
  }

  const event = JSON.parse(rawBody)

  if (event.type === 'checkout.paid') {
    const { merchant_id, duration_months } = event.data.metadata
    const amount = event.data.amount

    const { data: merchant } = await supabaseAdmin
      .from('merchants')
      .select('subscription_ends_at')
      .eq('id', merchant_id)
      .single()

    const currentEnd = merchant?.subscription_ends_at && new Date(merchant.subscription_ends_at) > new Date()
      ? new Date(merchant.subscription_ends_at)
      : new Date()

    currentEnd.setMonth(currentEnd.getMonth() + Number(duration_months || 1))

    await supabaseAdmin
      .from('merchants')
      .update({ subscription_status: 'active', subscription_ends_at: currentEnd.toISOString() })
      .eq('id', merchant_id)

    await supabaseAdmin.from('subscription_payments').insert({
      merchant_id,
      payment_method: 'chargily',
      transaction_reference: event.data.id,
      amount,
      status: 'approved',
      approved_at: new Date().toISOString(),
    })
  }

  return NextResponse.json({ received: true })
}
```

---

## 7. رفع إيصال BaridiMob ومراجعته

```typescript
// app/api/baridimob/submit/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const formData = await req.formData()
  const reference = formData.get('reference') as string
  const amount = formData.get('amount') as string
  const proofFile = formData.get('proof_image') as File

  const { data: membership } = await supabase
    .from('merchant_members')
    .select('merchant_id')
    .eq('user_id', user.id)
    .single()

  if (!membership) return NextResponse.json({ error: 'لا يوجد متجر مرتبط' }, { status: 403 })

  // رفع الصورة إلى Supabase Storage (bucket: baridimob-proofs، مجاني ضمن الحد المسموح)
  const filePath = `${membership.merchant_id}/${Date.now()}-${proofFile.name}`
  const { error: uploadError } = await supabase.storage
    .from('baridimob-proofs')
    .upload(filePath, proofFile)

  if (uploadError) return NextResponse.json({ error: 'فشل رفع الصورة' }, { status: 500 })

  const { error } = await supabase.from('subscription_payments').insert({
    merchant_id: membership.merchant_id,
    payment_method: 'baridimob',
    transaction_reference: reference,
    amount: Number(amount),
    proof_image_path: filePath,
    status: 'pending',
  })

  if (error) return NextResponse.json({ error: 'فشل حفظ طلب الدفع' }, { status: 500 })

  return NextResponse.json({ success: true, message: 'تم رفع الإيصال، سيتم المراجعة خلال دقائق' })
}
```

---

## 8. خطة التنفيذ خطوة بخطوة للوكيل (Execution Plan)

### المرحلة 0: إعداد الحسابات المجانية (تتم يدوياً من طرفك أنت، وليس الوكيل — انظر القسم 9)

### المرحلة 1: تهيئة المشروع
- `npx create-next-app@latest` مع TypeScript + Tailwind + App Router.
- تثبيت `@supabase/supabase-js`, `@supabase/ssr`, `zod`.
- **معيار النجاح:** المشروع يشتغل محلياً على `localhost:3000`.

### المرحلة 2: قاعدة البيانات
- تنفيذ ملف `supabase/migrations/0001_init.sql` (القسم 2 أعلاه) عبر Supabase CLI أو لوحة التحكم.
- **معيار النجاح:** كل الجداول موجودة، RLS مفعّلة، ويمكن التحقق من عزل البيانات بإنشاء تاجرين تجريبيين والتأكد أن استعلامات تاجر لا تُرجع بيانات الآخر.

### المرحلة 3: المصادقة ولوحة التحكم
- تسجيل/دخول عبر Supabase Auth.
- عند تسجيل تاجر جديد: إنشاء صف في `merchants` + صف في `merchant_members` بدور `admin`.
- **معيار النجاح:** تاجر جديد يدخل مباشرة بحالة `trial` لمدة 14 يوم.

### المرحلة 4: النطاقات الفرعية والـ Middleware
- تفعيل `middleware.ts` (القسم 3).
- إعداد Wildcard Domain في Vercel (`*.coddz.com`) — يحتاج نطاق حقيقي مربوط بـ Cloudflare (انظر القسم 9).
- **معيار النجاح:** فتح `merchant1.coddz.com` يعرض صفحة هبوط ذلك التاجر تحديداً.

### المرحلة 5: صفحة الهبوط ومعالجة الطلب
- بناء صفحة `[subdomain]/p/[slug]` مع نموذج طلب سريع (اسم، هاتف، ولاية، بلدية، عنوان).
- التحقق الفوري من رقم الهاتف الجزائري في الواجهة (Regex: `^(05|06|07)[0-9]{8}$`).
- ربط `api/checkout` (القسم 4).
- **معيار النجاح:** طلب تجريبي يُحفظ في قاعدة البيانات بحالة `pending`، ورقم مكرر خلال 24 ساعة يُعلَّم كـ `double`.

### المرحلة 6: إدارة الطلبات والشحن
- جدول الطلبات في لوحة التاجر مع أزرار "تأكيد" و"إرسال لـ Yalidine".
- ربط `lib/services/yalidine.ts` (القسم 5).
- **معيار النجاح:** طلب تجريبي (بحساب Yalidine Sandbox إن وُجد، أو حساب حقيقي بكمية صغيرة) يُرسل بنجاح ويُحفظ رقم التتبع.

### المرحلة 7: الاشتراكات والدفع
- صفحة Billing تعرض حالة الاشتراك.
- ربط ويب هوك Chargily (القسم 6) ونموذج رفع إيصال BaridiMob (القسم 7).
- لوحة أدمن بسيطة لموافقة/رفض دفعات BaridiMob يدوياً.
- **معيار النجاح:** محاكاة حدث `checkout.paid` من Chargily تُحدّث `subscription_ends_at` تلقائياً؛ وموافقة الأدمن على إيصال BaridiMob تُمدد الاشتراك شهراً.

### المرحلة 8: مكافحة الطلبات الوهمية
- واجهة لإضافة رقم لقائمة `blacklists` من داخل صفحة الطلب.
- **معيار النجاح:** رقم في القائمة السوداء يُعلَّم تلقائياً كـ `fake` عند أي طلب جديد.

---

## 9. الأشياء التي **يحتاجها الوكيل منك أنت** قبل/أثناء التنفيذ (لا يمكن للوكيل توفيرها بنفسه)

هذا القسم هو الأهم عملياً — لا تبدأ الوكيل بدون قراءته:

| # | ماذا تحتاج | مجاني؟ | ملاحظة |
|---|---|---|---|
| 1 | حساب Supabase + مشروع جديد | ✅ نعم (Free Tier) | تحصل على `SUPABASE_URL` و `ANON_KEY` و `SERVICE_ROLE_KEY` — أعطها للوكيل كمتغيرات بيئة (`.env.local`)، لا تكتبها مباشرة في الكود |
| 2 | حساب Vercel + ربط GitHub | ✅ نعم (Hobby Plan) | لنشر المشروع |
| 3 | نطاق (Domain) مثل `coddz.com` | ❌ يكلف عادة 8-15$/سنة | ضروري لتفعيل النطاقات الفرعية للتجار؛ بدونه المشروع يشتغل فقط على رابط Vercel المجاني بدون subdomains ديناميكية حقيقية |
| 4 | حساب Chargily Pay (كتاجر) | ✅ التسجيل مجاني، عمولة على كل معاملة فقط | تحتاج توثيق تجاري لفتح الحساب فعلياً في الإنتاج |
| 5 | حساب Yalidine — **واحد لكل تاجر** | يفتحه كل تاجر بنفسه | المنصة لا "تملك" حساب شحن واحد للجميع؛ كل تاجر يربط مفاتيحه الخاصة من لوحته |
| 6 | Cloudflare (لإدارة DNS الخاص بالنطاق) | ✅ مجاني | يسهّل ربط Wildcard Domain بـ Vercel |

**بمعنى آخر:** الوكيل يقدر يبني **كل الكود** بدون أي تدخل منك بعد إعطائه مفاتيح Supabase. لكن مفتاح Supabase نفسه، والنطاق، وحساب Chargily — هذه أشياء **أنت** لازم تنشئها وتعطيه إياها، لأنها حسابات مرتبطة بهويتك/نشاطك التجاري.

---

## 10. جدول مقارنة سريع: هل هذا فعلاً "مجاني في البداية"؟

| العنصر | التكلفة الشهرية عند الإطلاق (تجار قليلون) |
|---|---|
| Vercel Hosting | 0 دج |
| Supabase (DB + Auth + Storage) | 0 دج (ضمن الحد المجاني: 500MB DB، 1GB Storage، 50K مستخدم شهرياً) |
| Chargily | 0 دج (عمولة فقط عند وجود معاملات فعلية) |
| BaridiMob | 0 دج |
| **النطاق (Domain)** | ~1-1.5$ شهرياً (تكلفة سنوية مقسّمة) — **الشيء الوحيد غير المجاني عملياً** |

**الخلاصة:** المشروع مجاني تقريباً 100% للبداية، باستثناء ثمن النطاق نفسه (تكلفة رمزية سنوية، لا علاقة لها بالاستضافة أو التطوير).

> ⚠️ تم تدوير المفاتيح في 2026-09-01 — التوكنات القديمة أُلغيت. ضع مفاتيحك الجديدة في `.env.local` (انظر `.env.example`).
> `SUPABASE_URL` + `ANON_KEY` (publishable) + `SERVICE_ROLE_KEY` (secret) — لا تضعها في الكود أبداً.