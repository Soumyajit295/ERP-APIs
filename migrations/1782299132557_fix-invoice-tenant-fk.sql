-- Up Migration

CREATE TABLE IF NOT EXISTS invoices (
    invoice_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    tenant_id UUID NOT NULL,
    sales_order_id UUID NOT NULL,
    customer_id UUID NOT NULL,

    invoice_number VARCHAR(50) NOT NULL,

    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,

    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(12,2) NOT NULL,

    paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    balance_amount NUMERIC(12,2) NOT NULL,

    status invoice_status_enum NOT NULL DEFAULT 'UNPAID',

    notes TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP NULL,

    CONSTRAINT fk_invoice_tenant
        FOREIGN KEY (tenant_id)
        REFERENCES tenants(id),

    CONSTRAINT fk_invoice_sales_order
        FOREIGN KEY (sales_order_id)
        REFERENCES sales_orders(so_id),

    CONSTRAINT fk_invoice_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(customer_id),

    CONSTRAINT uq_invoice_number_per_tenant
        UNIQUE (tenant_id, invoice_number),

    CONSTRAINT uq_invoice_sales_order
        UNIQUE (sales_order_id)
);

CREATE INDEX IF NOT EXISTS idx_invoices_tenant
ON invoices(tenant_id);

CREATE INDEX IF NOT EXISTS idx_invoices_customer
ON invoices(customer_id);

CREATE INDEX IF NOT EXISTS idx_invoices_sales_order
ON invoices(sales_order_id);

CREATE INDEX IF NOT EXISTS idx_invoices_status
ON invoices(status);

-- Down Migration

DROP INDEX IF EXISTS idx_invoices_status;
DROP INDEX IF EXISTS idx_invoices_customer;
DROP INDEX IF EXISTS idx_invoices_sales_order;
DROP INDEX IF EXISTS idx_invoices_tenant;

DROP TABLE IF EXISTS invoices;
