-- Up Migration

ALTER TABLE users ADD COLUMN created_by VARCHAR(150) NOT NULL DEFAULT 'SYSTEM';

-- Down Migration

ALTER TABLE users DROP COLUMN IF EXISTS created_by;
