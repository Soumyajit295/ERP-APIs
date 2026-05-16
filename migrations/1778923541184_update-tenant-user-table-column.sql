-- Up Migration

ALTER TABLE tenants
DROP COLUMN IF EXISTS company_email;

ALTER TABLE tenants
DROP COLUMN IF EXISTS phone;

ALTER TABLE users
ADD COLUMN phone varchar(20);


-- Down Migration

ALTER TABLE users
DROP COLUMN IF EXISTS phone;

ALTER TABLE tenants
ADD COLUMN company_email varchar(150) NOT NULL DEFAULT '';

ALTER TABLE tenants
ADD COLUMN phone varchar(20);