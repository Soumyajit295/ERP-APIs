-- Up Migration

CREATE TYPE payment_direction_enum AS ENUM (
    'RECEIVED',
    'MADE'
);

CREATE TYPE payment_method_enum AS ENUM (
    'CASH',
    'BANK_TRANSFER',
    'CARD',
    'CHEQUE'
);

CREATE TABLE payments (
    payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    tenant_id UUID NOT NULL,

    payment_number VARCHAR(50) NOT NULL,

    invoice_id UUID NULL,
    purchase_order_id UUID NULL,

    payment_direction payment_direction_enum NOT NULL,

    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),

    payment_method payment_method_enum NOT NULL,

    payment_date DATE NOT NULL,

    transaction_id VARCHAR(100) NULL,

    notes TEXT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP NULL,

    CONSTRAINT fk_payment_tenant
        FOREIGN KEY (tenant_id)
        REFERENCES tenants(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_payment_invoice
        FOREIGN KEY (invoice_id)
        REFERENCES invoices(invoice_id),

    CONSTRAINT fk_payment_purchase_order
        FOREIGN KEY (purchase_order_id)
        REFERENCES purchase_orders(po_id),

    CONSTRAINT uq_payment_number_per_tenant
        UNIQUE (tenant_id, payment_number)
);

CREATE INDEX idx_payments_tenant
ON payments(tenant_id);

CREATE INDEX idx_payments_invoice
ON payments(invoice_id);

CREATE INDEX idx_payments_purchase_order
ON payments(purchase_order_id);

CREATE INDEX idx_payments_direction
ON payments(payment_direction);

-- Down Migration

DROP INDEX IF EXISTS idx_payments_direction;
DROP INDEX IF EXISTS idx_payments_purchase_order;
DROP INDEX IF EXISTS idx_payments_invoice;
DROP INDEX IF EXISTS idx_payments_tenant;


DROP TABLE IF EXISTS payments;
DROP TYPE IF EXISTS payment_direction_enum;
DROP TYPE IF EXISTS payment_method_enum;
