-- Up Migration

-- Up Migration

CREATE TABLE inventory (
    inventory_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    tenant_id UUID NOT NULL,

    warehouse_id UUID NOT NULL,

    product_id UUID NOT NULL,

    quantity INTEGER NOT NULL DEFAULT 0
        CHECK (quantity >= 0),

    reserved_quantity INTEGER NOT NULL DEFAULT 0
        CHECK (reserved_quantity >= 0),

    last_restock_date TIMESTAMP NULL,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_inventory_tenant
        FOREIGN KEY (tenant_id)
        REFERENCES tenants(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_inventory_warehouse
        FOREIGN KEY (warehouse_id)
        REFERENCES warehouses(warehouse_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_inventory_product
        FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON DELETE CASCADE,

    CONSTRAINT uq_inventory_warehouse_product
        UNIQUE (warehouse_id, product_id)
);

CREATE INDEX idx_inventory_tenant_id
ON inventory(tenant_id);

CREATE INDEX idx_inventory_warehouse_id
ON inventory(warehouse_id);

CREATE INDEX idx_inventory_product_id
ON inventory(product_id);

CREATE INDEX idx_inventory_tenant_warehouse
ON inventory(tenant_id, warehouse_id);

-- Down Migration

DROP INDEX IF EXISTS idx_inventory_tenant_warehouse;
DROP INDEX IF EXISTS idx_inventory_product_id;
DROP INDEX IF EXISTS idx_inventory_warehouse_id;
DROP INDEX IF EXISTS idx_inventory_tenant_id;

DROP TABLE IF EXISTS inventory;