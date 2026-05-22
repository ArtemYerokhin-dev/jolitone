-- Jolitone migration — run once in psql or pgAdmin

CREATE TABLE IF NOT EXISTS stock (
  product_id  TEXT PRIMARY KEY,
  quantity    INTEGER NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS newsletter_logs (
  id        SERIAL PRIMARY KEY,
  subject   TEXT NOT NULL,
  body      TEXT,
  sent_to   INTEGER DEFAULT 0,
  sent_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS promo_codes (
  id               SERIAL PRIMARY KEY,
  code             TEXT UNIQUE NOT NULL,
  discount_percent INTEGER NOT NULL DEFAULT 0,
  min_order        NUMERIC(10,2) DEFAULT 0,
  uses_left        INTEGER,        -- NULL = unlimited
  expires_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock_notifications (
  id          SERIAL PRIMARY KEY,
  email       TEXT NOT NULL,
  product_id  TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  notified_at TIMESTAMPTZ,
  UNIQUE(email, product_id)
);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS promo_code      TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2) DEFAULT 0;
