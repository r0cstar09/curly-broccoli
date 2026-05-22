-- Apply this migration to existing Turso databases created before the
-- persistent cart and idempotent order schema was added.

ALTER TABLE orders ADD COLUMN stripe_session_id TEXT;
ALTER TABLE orders ADD COLUMN status TEXT NOT NULL DEFAULT 'paid';

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_stripe_session ON orders(stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS carts (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cart_line_items (
  id TEXT PRIMARY KEY,
  cart_id TEXT NOT NULL,
  product_variant_id TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_cart_line_items_cart ON cart_line_items(cart_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_cart_line_items_variant ON cart_line_items(cart_id, product_variant_id);
