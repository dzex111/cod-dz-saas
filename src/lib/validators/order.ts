import { z } from "zod";

export const checkoutSchema = z.object({
  merchant_subdomain: z.string().min(2).max(50),
  product_slug: z.string().min(1),
  customer_name: z.string().min(2, "الاسم قصير جداً").max(100),
  customer_phone: z
    .string()
    .regex(/^(05|06|07)[0-9]{8}$/, "رقم هاتف جزائري غير صحيح (05/06/07 + 8 أرقام)"),
  wilaya_code: z.string().min(1, "اختر الولاية"),
  wilaya_name: z.string().min(1),
  baladia_name: z.string().min(1, "البلدية مطلوبة"),
  address: z.string().min(5, "العنوان قصير جداً").max(500),
  quantity: z.number().int().min(1).optional().default(1),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const productSchema = z.object({
  name: z.string().min(2).max(255),
  slug: z.string().min(2).max(255).regex(/^[a-z0-9-]+$/, "Slug يجب أن يكون أحرف إنجليزية صغيرة وأرقام وشرطة"),
  description: z.string().optional(),
  price: z.number().min(0),
  compare_at_price: z.number().optional().nullable(),
  stock_quantity: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
  image_url: z.string().url().optional().or(z.literal("")),
});

export const shippingConfigSchema = z.object({
  provider_name: z.enum(["yalidine", "zr_express"]),
  api_id: z.string().min(1, "معرف API مطلوب"),
  api_token: z.string().min(1, "رمز API مطلوب"),
});
