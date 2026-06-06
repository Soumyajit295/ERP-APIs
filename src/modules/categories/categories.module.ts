import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CategoryRepository } from 'src/repositories/category.repository';
import { DatabaseService } from 'src/database/database.service';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoryRepository, DatabaseService]
})
export class CategoriesModule {}
