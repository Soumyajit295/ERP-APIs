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
    RolesModule
  ],
  controllers: [AppController],
  providers: [AppService, DatabaseService, UsersRepository,TenantRepository,RefreshTokensRepository],
})
export class AppModule {}
