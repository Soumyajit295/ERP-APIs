-- Up Migration

CREATE TYPE payment_status_enum AS ENUM (
    'UNPAID',
    'PARTIALLY_PAID',
    'PAID'
);

ALTER TABLE purchase_orders
ADD COLUMN total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
ADD COLUMN paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
ADD COLUMN balance_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
ADD COLUMN payment_status payment_status_enum NOT NULL DEFAULT 'UNPAID';

CREATE INDEX idx_purchase_orders_payment_status
ON purchase_orders(payment_status);

-- Backfill

UPDATE purchase_orders po
SET
    total_amount = totals.total_amount,
    balance_amount = totals.total_amount
FROM (
    SELECT
        poi.po_id,
        COALESCE(SUM(poi.line_total), 0) AS total_amount
    FROM purchase_order_items poi
    GROUP BY poi.po_id
) totals
WHERE po.po_id = totals.po_id;

-- Down Migration

DROP INDEX IF EXISTS idx_purchase_orders_payment_status;

ALTER TABLE purchase_orders
DROP COLUMN IF EXISTS payment_status,
DROP COLUMN IF EXISTS balance_amount,
DROP COLUMN IF EXISTS paid_amount,
DROP COLUMN IF EXISTS total_amount;

DROP TYPE IF EXISTS payment_status_enum;