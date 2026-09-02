-- Store customization like Shopify — light version via Storage JSON
-- Bucket store-configs already created via API (public)
-- This migration documents the feature; no table change required because config is stored as JSON in storage
-- Each merchant has store-configs/<merchant_id>.json with { template, primary_color, accent_color, hero_title, hero_subtitle, announcement, show_reviews, show_features, show_shipping, footer_text }

-- Optional: ensure bucket exists (if not created via API)
insert into storage.buckets (id, name, public) values ('store-configs', 'store-configs', true) on conflict (id) do nothing;

-- Policies for store-configs bucket
create policy "store_configs_public_read" on storage.objects for select using (bucket_id = 'store-configs');
create policy "store_configs_auth_write" on storage.objects for insert with check (bucket_id = 'store-configs' and auth.role() = 'authenticated');
create policy "store_configs_auth_update" on storage.objects for update using (bucket_id = 'store-configs' and auth.role() = 'authenticated');
create policy "store_configs_auth_delete" on storage.objects for delete using (bucket_id = 'store-configs' and auth.role() = 'authenticated');
