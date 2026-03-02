-- Run this against your Turso database to create the schema.
-- turso db shell <database-name> < src/lib/db/schema.sql

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  location TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  number INTEGER NOT NULL,
  customer_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  total_price INTEGER NOT NULL,
  shipping_price INTEGER NOT NULL,
  billing_address TEXT,
  shipping_address TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE IF NOT EXISTS order_line_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  product_variant_id TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_line_items_order ON order_line_items(order_id);
