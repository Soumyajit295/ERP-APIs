-- Up Migration

CREATE TYPE purchase_order_status_enum AS ENUM (
    'DRAFT',
    'PENDING',
    'APPROVED',
    'RECEIVED',
    'CANCELLED'
);

CREATE TABLE purchase_orders (
    po_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    tenant_id UUID NOT NULL,

    po_number VARCHAR(50) NOT NULL,

    supplier_id UUID NOT NULL,

    warehouse_id UUID NOT NULL,

    order_date DATE NOT NULL,

    status purchase_order_status_enum NOT NULL DEFAULT 'DRAFT',

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP NULL,

    CONSTRAINT fk_purchase_orders_tenant
        FOREIGN KEY (tenant_id)
        REFERENCES tenants(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_purchase_orders_supplier
        FOREIGN KEY (supplier_id)
        REFERENCES suppliers(supplier_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_purchase_orders_warehouse
        FOREIGN KEY (warehouse_id)
        REFERENCES warehouses(warehouse_id)
        ON DELETE RESTRICT,

    CONSTRAINT uq_purchase_order_number_per_tenant
        UNIQUE (tenant_id, po_number)
);

CREATE TABLE purchase_order_items (
    poi_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    po_id UUID NOT NULL,

    product_id UUID NOT NULL,

    quantity INTEGER NOT NULL CHECK (quantity > 0),

    cost_price NUMERIC(12,2) NOT NULL CHECK (cost_price >= 0),

    line_total NUMERIC(12,2) NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_purchase_order_items_po
        FOREIGN KEY (po_id)
        REFERENCES purchase_orders(po_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_purchase_order_items_product
        FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON DELETE RESTRICT
);

CREATE INDEX idx_purchase_orders_tenant_id
ON purchase_orders(tenant_id);

CREATE INDEX idx_purchase_orders_supplier_id
ON purchase_orders(supplier_id);

CREATE INDEX idx_purchase_orders_warehouse_id
ON purchase_orders(warehouse_id);

CREATE INDEX idx_purchase_orders_status
ON purchase_orders(status);

CREATE INDEX idx_purchase_order_items_po_id
ON purchase_order_items(po_id);

CREATE INDEX idx_purchase_order_items_product_id
ON purchase_order_items(product_id);

-- Down Migration

DROP INDEX IF EXISTS idx_purchase_order_items_product_id;
DROP INDEX IF EXISTS idx_purchase_order_items_po_id;

DROP INDEX IF EXISTS idx_purchase_orders_status;
DROP INDEX IF EXISTS idx_purchase_orders_warehouse_id;
DROP INDEX IF EXISTS idx_purchase_orders_supplier_id;
DROP INDEX IF EXISTS idx_purchase_orders_tenant_id;

DROP TABLE IF EXISTS purchase_order_items;
DROP TABLE IF EXISTS purchase_orders;

DROP TYPE IF EXISTS purchase_order_status_enum;