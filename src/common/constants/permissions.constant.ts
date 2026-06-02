// Permission Constants
// Format: [MODULE]_[ACTION]

export const PERMISSIONS = {
  CUSTOMERS: {
    CREATE: 'customers_create',
    MODIFY: 'customers_modify',
    READ: 'customers_read',
  },

  FINANCE: {
    CREATE: 'finance_create',
    MODIFY: 'finance_modify',
    READ: 'finance_read',
  },

  INVENTORY: {
    CREATE: 'inventory_create',
    MODIFY: 'inventory_modify',
    READ: 'inventory_read',
  },

  PRODUCT: {
    CREATE: 'product_create',
    MODIFY: 'product_modify',
    READ: 'product_read',
  },

  PURCHASES: {
    CREATE: 'purchases_create',
    MODIFY: 'purchases_modify',
    READ: 'purchases_read',
  },

  SALES: {
    CREATE: 'sales_create',
    MODIFY: 'sales_modify',
    READ: 'sales_read',
  },

  SUPPLIERS: {
    CREATE: 'suppliers_create',
    MODIFY: 'suppliers_modify',
    READ: 'suppliers_read',
  },

  USER: {
    CREATE: 'user_create',
    MODIFY: 'user_modify',
    READ: 'user_read',
  },
} as const;

// Flattened permissions for easy access
export const PERMISSION_CODES = {
  // Customers
  CUSTOMERS_CREATE: PERMISSIONS.CUSTOMERS.CREATE,
  CUSTOMERS_MODIFY: PERMISSIONS.CUSTOMERS.MODIFY,
  CUSTOMERS_READ: PERMISSIONS.CUSTOMERS.READ,

  // Finance
  FINANCE_CREATE: PERMISSIONS.FINANCE.CREATE,
  FINANCE_MODIFY: PERMISSIONS.FINANCE.MODIFY,
  FINANCE_READ: PERMISSIONS.FINANCE.READ,

  // Inventory
  INVENTORY_CREATE: PERMISSIONS.INVENTORY.CREATE,
  INVENTORY_MODIFY: PERMISSIONS.INVENTORY.MODIFY,
  INVENTORY_READ: PERMISSIONS.INVENTORY.READ,

  // Product
  PRODUCT_CREATE: PERMISSIONS.PRODUCT.CREATE,
  PRODUCT_MODIFY: PERMISSIONS.PRODUCT.MODIFY,
  PRODUCT_READ: PERMISSIONS.PRODUCT.READ,

  // Purchases
  PURCHASES_CREATE: PERMISSIONS.PURCHASES.CREATE,
  PURCHASES_MODIFY: PERMISSIONS.PURCHASES.MODIFY,
  PURCHASES_READ: PERMISSIONS.PURCHASES.READ,

  // Sales
  SALES_CREATE: PERMISSIONS.SALES.CREATE,
  SALES_MODIFY: PERMISSIONS.SALES.MODIFY,
  SALES_READ: PERMISSIONS.SALES.READ,

  // Suppliers
  SUPPLIERS_CREATE: PERMISSIONS.SUPPLIERS.CREATE,
  SUPPLIERS_MODIFY: PERMISSIONS.SUPPLIERS.MODIFY,
  SUPPLIERS_READ: PERMISSIONS.SUPPLIERS.READ,

  // User
  USER_CREATE: PERMISSIONS.USER.CREATE,
  USER_MODIFY: PERMISSIONS.USER.MODIFY,
  USER_READ: PERMISSIONS.USER.READ,
} as const;

// Type for permission values
export type PermissionCode =
  typeof PERMISSION_CODES[keyof typeof PERMISSION_CODES];