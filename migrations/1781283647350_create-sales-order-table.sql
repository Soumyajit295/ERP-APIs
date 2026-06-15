-- Up Migration

CREATE TYPE sales_order_status_enum AS ENUM (
    'DRAFT',
    'CONFIRMED',
    'COMPLETED',
    'CANCELLED'
);

CREATE TABLE sales_orders (
    so_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    tenant_id UUID NOT NULL,

    so_number VARCHAR(50) NOT NULL,

    customer_id UUID NOT NULL,

    warehouse_id UUID NOT NULL,

    order_date DATE NOT NULL,

    status sales_order_status_enum NOT NULL DEFAULT 'DRAFT',

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    deleted_at TIMESTAMP NULL,

    CONSTRAINT fk_sales_orders_tenant
        FOREIGN KEY (tenant_id)
        REFERENCES tenants(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_sales_orders_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(customer_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_sales_orders_warehouse
        FOREIGN KEY (warehouse_id)
        REFERENCES warehouses(warehouse_id)
        ON DELETE RESTRICT,

    CONSTRAINT uq_sales_order_number
        UNIQUE (tenant_id, so_number)
);

CREATE INDEX idx_sales_orders_tenant
ON sales_orders(tenant_id);

CREATE INDEX idx_sales_orders_customer
ON sales_orders(customer_id);

CREATE INDEX idx_sales_orders_warehouse
ON sales_orders(warehouse_id);

CREATE INDEX idx_sales_orders_status
ON sales_orders(status);

CREATE TABLE sales_order_items (
    soi_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    so_id UUID NOT NULL,

    tenant_id UUID NOT NULL,

    product_id UUID NOT NULL,

    quantity INTEGER NOT NULL CHECK(quantity > 0),

    selling_price NUMERIC(12,2) NOT NULL,

    discount NUMERIC(12,2) NOT NULL DEFAULT 0,

    line_total NUMERIC(12,2) NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_sales_order_items_order
        FOREIGN KEY (so_id)
        REFERENCES sales_orders(so_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_sales_order_items_product
        FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_sales_order_items_tenant
        FOREIGN KEY (tenant_id)
        REFERENCES tenants(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_sales_order_items_so
ON sales_order_items(so_id);

CREATE INDEX idx_sales_order_items_product
ON sales_order_items(product_id);

CREATE INDEX idx_sales_order_items_tenant
ON sales_order_items(tenant_id);

-- Down Migration

-- Down Migration

DROP INDEX IF EXISTS idx_sales_order_items_tenant;
DROP INDEX IF EXISTS idx_sales_order_items_product;
DROP INDEX IF EXISTS idx_sales_order_items_so;

DROP TABLE IF EXISTS sales_order_items;

DROP INDEX IF EXISTS idx_sales_orders_status;
DROP INDEX IF EXISTS idx_sales_orders_warehouse;
DROP INDEX IF EXISTS idx_sales_orders_customer;
DROP INDEX IF EXISTS idx_sales_orders_tenant;

DROP TABLE IF EXISTS sales_orders;

DROP TYPE IF EXISTS sales_order_status_enum;