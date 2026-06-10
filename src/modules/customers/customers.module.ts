import { Module } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { CustomerRepository } from 'src/repositories/customer.repository';
import { DatabaseService } from 'src/database/database.service';

@Module({
  controllers: [CustomersController],
  providers: [CustomersService,CustomerRepository,DatabaseService]
})
export class CustomersModule {}
