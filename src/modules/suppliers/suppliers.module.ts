import { Module } from '@nestjs/common';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';
import { DatabaseService } from 'src/database/database.service';
import { SupplierRepository } from 'src/repositories/supplier.repository';

@Module({
  controllers: [SuppliersController],
  providers: [SuppliersService, SupplierRepository, DatabaseService],
})
export class SuppliersModule {}
