-- WMS-SDU Multi-tenant Migration
-- Adds owner_id column to all tenant-scoped tables.
-- Run BEFORE the backfill API. After backfill, run 002-multi-tenant-not-null.sql.

BEGIN;

ALTER TABLE public.warehouses      ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.products        ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.product_stocks  ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.locations       ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.orders          ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.order_items     ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.purchases       ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.purchase_items  ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.stock_movements ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.wallets         ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.transactions    ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.categories      ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.suppliers       ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_warehouses_owner       ON public.warehouses(owner_id);
CREATE INDEX IF NOT EXISTS idx_products_owner         ON public.products(owner_id);
CREATE INDEX IF NOT EXISTS idx_product_stocks_owner   ON public.product_stocks(owner_id);
CREATE INDEX IF NOT EXISTS idx_locations_owner        ON public.locations(owner_id);
CREATE INDEX IF NOT EXISTS idx_orders_owner           ON public.orders(owner_id);
CREATE INDEX IF NOT EXISTS idx_order_items_owner      ON public.order_items(owner_id);
CREATE INDEX IF NOT EXISTS idx_purchases_owner        ON public.purchases(owner_id);
CREATE INDEX IF NOT EXISTS idx_purchase_items_owner   ON public.purchase_items(owner_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_owner  ON public.stock_movements(owner_id);
CREATE INDEX IF NOT EXISTS idx_wallets_owner          ON public.wallets(owner_id);
CREATE INDEX IF NOT EXISTS idx_transactions_owner     ON public.transactions(owner_id);
CREATE INDEX IF NOT EXISTS idx_categories_owner       ON public.categories(owner_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_owner        ON public.suppliers(owner_id);

COMMIT;
