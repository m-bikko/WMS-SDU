-- WMS-SDU: Full database cleanup script
-- Deletes ALL data from all tables respecting foreign key order

-- 1. Child tables first (dependent on other tables)
TRUNCATE TABLE public.stock_movements CASCADE;
TRUNCATE TABLE public.transactions CASCADE;
TRUNCATE TABLE public.order_items CASCADE;
TRUNCATE TABLE public.purchase_items CASCADE;
TRUNCATE TABLE public.product_stocks CASCADE;
TRUNCATE TABLE public.locations CASCADE;

-- 2. Mid-level tables
TRUNCATE TABLE public.orders CASCADE;
TRUNCATE TABLE public.purchases CASCADE;
TRUNCATE TABLE public.products CASCADE;
TRUNCATE TABLE public.wallets CASCADE;

-- 3. Top-level entities
TRUNCATE TABLE public.customers CASCADE;
TRUNCATE TABLE public.suppliers CASCADE;
TRUNCATE TABLE public.warehouses CASCADE;
TRUNCATE TABLE public.categories CASCADE;
