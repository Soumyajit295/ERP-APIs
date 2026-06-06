-- Up Migration

CREATE TABLE suppliers (
    supplier_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    tenant_id UUID NOT NULL,

    supplier_name VARCHAR(255) NOT NULL,

    email VARCHAR(255),

    phone VARCHAR(20),

    contact_person VARCHAR(255),

    address TEXT,

    tax_number VARCHAR(100),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP NULL,

    CONSTRAINT fk_suppliers_tenant
        FOREIGN KEY (tenant_id)
        REFERENCES tenants(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_supplier_name_per_tenant
        UNIQUE (tenant_id, supplier_name)
);

CREATE INDEX idx_suppliers_tenant_id
ON suppliers(tenant_id);

CREATE INDEX idx_suppliers_name
ON suppliers(supplier_name);

CREATE INDEX idx_suppliers_email
ON suppliers(email);

CREATE INDEX idx_suppliers_active
ON suppliers(is_active);

-- Down Migration

DROP INDEX IF EXISTS idx_suppliers_active;
DROP INDEX IF EXISTS idx_suppliers_email;
DROP INDEX IF EXISTS idx_suppliers_name;
DROP INDEX IF EXISTS idx_suppliers_tenant_id;

DROP TABLE IF EXISTS suppliers;