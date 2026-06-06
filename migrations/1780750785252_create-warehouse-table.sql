-- Up Migration

CREATE TABLE warehouses (
    warehouse_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    tenant_id UUID NOT NULL,

    warehouse_name VARCHAR(255) NOT NULL,

    address TEXT,

    contact_person VARCHAR(255),

    phone VARCHAR(20),

    capacity INTEGER,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP NULL,

    CONSTRAINT fk_warehouses_tenant
        FOREIGN KEY (tenant_id)
        REFERENCES tenants(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_warehouse_name_per_tenant
        UNIQUE (tenant_id, warehouse_name)
);

CREATE INDEX idx_warehouses_tenant_id
ON warehouses(tenant_id);

CREATE INDEX idx_warehouses_name
ON warehouses(warehouse_name);

CREATE INDEX idx_warehouses_active
ON warehouses(is_active);

-- Down Migration

DROP INDEX IF EXISTS idx_warehouses_active;
DROP INDEX IF EXISTS idx_warehouses_name;
DROP INDEX IF EXISTS idx_warehouses_tenant_id;

DROP TABLE IF EXISTS warehouses;