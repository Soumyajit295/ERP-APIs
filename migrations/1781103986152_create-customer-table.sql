-- Up Migration

CREATE TABLE customers (
    customer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    tenant_id UUID NOT NULL,

    customer_name VARCHAR(255) NOT NULL,

    email VARCHAR(255),

    phone VARCHAR(20),

    city VARCHAR(100),

    address TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    deleted_at TIMESTAMP NULL,

    CONSTRAINT fk_customers_tenant
        FOREIGN KEY (tenant_id)
        REFERENCES tenants(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_customers_tenant_id
ON customers(tenant_id);

CREATE INDEX idx_customers_name
ON customers(customer_name);

CREATE INDEX idx_customers_email
ON customers(email);

-- Down Migration

DROP INDEX IF EXISTS idx_customers_email;
DROP INDEX IF EXISTS idx_customers_name;
DROP INDEX IF EXISTS idx_customers_tenant_id;

DROP TABLE IF EXISTS customers;