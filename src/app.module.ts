import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseService } from './database/database.service';
import { TenantsModule } from './modules/tenants/tenants.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersRepository } from './repositories/user.repository';
import { TenantRepository } from './repositories/tenant.repository';
import { RefreshTokensRepository } from './repositories/refresh-token.repository';
import { QueueModule } from './modules/queue/queue.module';
import { EmailModule } from './modules/email/email.module';
import { RedisModule } from './modules/redis/redis.module';
import { RolesModule } from './modules/roles/roles.module';
import { RolesRepository } from './repositories/role.repository';
import { PermissionRepository } from './repositories/permission.repository';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { WarehousesModule } from './modules/warehouses/warehouses.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { PurchaseOrdersModule } from './modules/purchase-orders/purchase-orders.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { CustomersModule } from './modules/customers/customers.module';
import { SalesOrdersModule } from './modules/sales-orders/sales-orders.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    TenantsModule,
    UsersModule,
    AuthModule,
    QueueModule,
    EmailModule,
    RedisModule,
    RolesModule,
    CategoriesModule,
    ProductsModule,
    WarehousesModule,
    SuppliersModule,
    PurchaseOrdersModule,
    InventoryModule,
    CustomersModule,
    SalesOrdersModule
  ],
  controllers: [AppController],
  providers: [AppService, DatabaseService, UsersRepository,TenantRepository,PermissionRepository,RefreshTokensRepository],
})
export class AppModule {}
