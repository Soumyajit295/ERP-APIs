-- Up Migration

INSERT INTO modules(module_name)
VALUES
  ('Suppliers'),
  ('Purchases'),
  ('Inventory'),
  ('Customers'),
  ('Sales'),
  ('Finance')
ON CONFLICT (module_name) DO NOTHING;

INSERT INTO permissions (permission_name, module_id)
SELECT 'CREATE', module_id FROM modules
ON CONFLICT DO NOTHING;

INSERT INTO permissions (permission_name, module_id)
SELECT 'READ', module_id FROM modules
ON CONFLICT DO NOTHING;

INSERT INTO permissions (permission_name, module_id)
SELECT 'MODIFY', module_id FROM modules
ON CONFLICT DO NOTHING;

-- Down Migration

DELETE FROM permissions
WHERE permission_name IN (
    'CREATE',
    'READ',
    'MODIFY'
);

DELETE FROM modules
WHERE module_name IN (
    'Suppliers',
    'Purchases',
    'Inventory',
    'Customers',
    'Sales',
    'Finance'
);