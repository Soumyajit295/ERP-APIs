import { Injectable } from '@nestjs/common';
import { CreateCategoryDto, UpdateCategoryDto } from 'src/common/dto/category.dto';
import { CategoryRepository } from 'src/repositories/category.repository';

@Injectable()
export class CategoriesService {
    constructor(
        private readonly categoriesRepository: CategoryRepository
    ){}

    public async createCategory(createCategoryDto: CreateCategoryDto,tenantId: string){
        return await this.categoriesRepository.createCategory(createCategoryDto,tenantId)
    }

    public async getPaginatedCategories(tenantId: string,page: number,limit: number,search?: string){
        return await this.categoriesRepository.getPaginatedCategories(tenantId,page,limit,search)
    }

    public async getCategoryById(categoryId: string){
        return await this.categoriesRepository.getCategoryById(categoryId)
    }

    public async updateCategory(updateCategoryDto: UpdateCategoryDto,categoryId: string){
        return await this.categoriesRepository.updateCategory(updateCategoryDto,categoryId)
    }

    public async deleteCategory(categoryId: string){
        return await this.categoriesRepository.deleteCategory(categoryId)
    }
}
