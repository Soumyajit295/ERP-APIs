-- Up Migration

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE tenants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name varchar(200) NOT NULL,
    company_email varchar(150) NOT NULL,
    phone varchar(150),
    city varchar(150),
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);

CREATE UNIQUE INDEX tenants_company_email_unique_active_idx
    ON tenants (company_email)
    WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX tenants_phone_unique_active_idx
    ON tenants (phone)
    WHERE phone IS NOT NULL AND deleted_at IS NULL;

CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL,
    fname varchar(150) NOT NULL,
    lname varchar(250) NOT NULL,
    email varchar(150) NOT NULL,
    password_hash text NOT NULL,
    role varchar(150) NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,
    CONSTRAINT users_tenant_id_fk
        FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE UNIQUE INDEX users_tenant_id_email_unique_active_idx
    ON users (tenant_id, email)
    WHERE deleted_at IS NULL;

CREATE INDEX users_tenant_id_idx
    ON users (tenant_id);

-- Down Migration

DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS tenants;
