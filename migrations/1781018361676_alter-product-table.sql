-- Up Migration

ALTER TABLE products
ADD COLUMN reorder_level INTEGER DEFAULT 10;

-- Down Migration

ALTER TABLE products
DROP COLUMN reorder_level;