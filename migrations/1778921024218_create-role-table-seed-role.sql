-- Up Migration
CREATE TABLE ROLES (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL,
    name VARCHAR(250) NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,

    CONSTRAINT roles_tenant_id_fk
        FOREIGN KEY (tenant_id)
        REFERENCES tenants(id)
);

CREATE UNIQUE INDEX roles_tenant_id_name_unique_active_idx
    ON roles (tenant_id, name)
    WHERE deleted_at IS NULL;

CREATE INDEX roles_tenant_id_idx
    ON roles (tenant_id);

-- User table alert
ALTER TABLE users
DROP COLUMN role;

ALTER TABLE users
ADD COLUMN role_id uuid;

ALTER TABLE users
ADD CONSTRAINT users_role_id_fk
    FOREIGN KEY (role_id)
    REFERENCES roles(id);

CREATE INDEX users_role_id_idx
    ON users (role_id);

-- Down Migration

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_id_fk;
DROP INDEX IF EXISTS users_role_id_idx;

ALTER TABLE users DROP COLUMN IF EXISTS role_id;

ALTER TABLE users ADD COLUMN role varchar(150) NOT NULL;

DROP TABLE IF EXISTS roles;