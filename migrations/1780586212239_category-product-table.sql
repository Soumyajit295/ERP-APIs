-- Up Migration

CREATE TABLE categories (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    tenant_id UUID NOT NULL,

    category_name VARCHAR(150) NOT NULL,

    description TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP NULL,

    CONSTRAINT fk_categories_tenant
        FOREIGN KEY (tenant_id)
        REFERENCES tenants(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_category_name_per_tenant
        UNIQUE (tenant_id, category_name)
);

CREATE TYPE product_status_enum AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'DISCONTINUED'
);

CREATE TABLE products (
    product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    tenant_id UUID NOT NULL,

    category_id UUID NOT NULL,

    product_name VARCHAR(255) NOT NULL,

    sku VARCHAR(100) NOT NULL,

    barcode VARCHAR(100),

    purchase_price NUMERIC(12,2) NOT NULL DEFAULT 0,

    selling_price NUMERIC(12,2) NOT NULL DEFAULT 0,

    description TEXT,

    status product_status_enum NOT NULL DEFAULT 'ACTIVE',

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP NULL,

    CONSTRAINT fk_products_tenant
        FOREIGN KEY (tenant_id)
        REFERENCES tenants(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_products_category
        FOREIGN KEY (category_id)
        REFERENCES categories(category_id)
        ON DELETE RESTRICT,

    CONSTRAINT uq_product_sku_per_tenant
        UNIQUE (tenant_id, sku),

    CONSTRAINT uq_product_barcode_per_tenant
        UNIQUE (tenant_id, barcode)
);

CREATE INDEX idx_categories_tenant_id
ON categories(tenant_id);

CREATE INDEX idx_products_tenant_id
ON products(tenant_id);

CREATE INDEX idx_products_category_id
ON products(category_id);

CREATE INDEX idx_products_sku
ON products(sku);

CREATE INDEX idx_products_barcode
ON products(barcode);

CREATE INDEX idx_products_status
ON products(status);

-- Down Migration

DROP INDEX IF EXISTS idx_products_status;
DROP INDEX IF EXISTS idx_products_barcode;
DROP INDEX IF EXISTS idx_products_sku;
DROP INDEX IF EXISTS idx_products_category_id;
DROP INDEX IF EXISTS idx_products_tenant_id;
DROP INDEX IF EXISTS idx_categories_tenant_id;

DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;

DROP TYPE IF EXISTS product_status_enum;