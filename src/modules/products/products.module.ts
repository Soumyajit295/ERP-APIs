import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductRepository } from 'src/repositories/product.repository';
import { DatabaseService } from 'src/database/database.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService,ProductRepository,DatabaseService]
})
export class ProductsModule {}
