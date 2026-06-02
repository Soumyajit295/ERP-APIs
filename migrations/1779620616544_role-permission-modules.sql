-- Up Migration

CREATE TABLE modules (
    module_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    module_name VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);

CREATE TABLE permissions (
    permission_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    permission_name VARCHAR(50) NOT NULL,
    module_id uuid NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP NULL,

    CONSTRAINT fk_permissions_module
        FOREIGN KEY (module_id)
        REFERENCES modules(module_id)
        ON DELETE CASCADE,

    CONSTRAINT uq_module_permission
        UNIQUE (module_id, permission_name)
);

CREATE TABLE role_permissions (
    rp_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id uuid NOT NULL,
    per_id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP NULL,

    CONSTRAINT fk_role_permissions_role
        FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_role_permissions_permission
        FOREIGN KEY (per_id)
        REFERENCES permissions(permission_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_role_permissions_tenant
        FOREIGN KEY (tenant_id)
        REFERENCES tenants(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_role_permission_tenant
        UNIQUE (role_id, per_id, tenant_id)
);

CREATE INDEX idx_permissions_module_id
ON permissions(module_id);

CREATE INDEX idx_role_permissions_role_id
ON role_permissions(role_id);

CREATE INDEX idx_role_permissions_permission_id
ON role_permissions(per_id);

CREATE INDEX idx_role_permissions_tenant_id
ON role_permissions(tenant_id);

-- Seeds to modules

INSERT INTO modules (module_name)
VALUES ('user'),('product');

-- Seeds to permissions

INSERT INTO permissions (permission_name, module_id)
SELECT 'CREATE', module_id FROM modules;

INSERT INTO permissions (permission_name, module_id)
SELECT 'READ', module_id FROM modules;

INSERT INTO permissions (permission_name, module_id)
SELECT 'MODIFY', module_id FROM modules;

-- Down Migration

DROP INDEX IF EXISTS idx_role_permissions_tenant_id;
DROP INDEX IF EXISTS idx_role_permissions_permission_id;
DROP INDEX IF EXISTS idx_role_permissions_role_id;
DROP INDEX IF EXISTS idx_permissions_module_id;

DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS modules;