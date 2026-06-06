import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CategoryParamDto, CreateCategoryDto, UpdateCategoryDto } from 'src/common/dto/category.dto';
import { CurrentUser } from '../auth/currentuser.decorator';
import type { CurrentUserPayload } from '../auth/types/current-user.type';
import { PERMISSION_CODES } from 'src/common/constants/permissions.constant';
import { Permissions } from '../auth/permissions.decorator';
import { SWAGGER_BEARER_AUTH } from 'src/swagger';

@ApiTags('Categories')
@ApiBearerAuth(SWAGGER_BEARER_AUTH)
@Controller('categories')
export class CategoriesController {
    constructor(
        private readonly categoriesService: CategoriesService
    ){}

    @Post()
    @Permissions(PERMISSION_CODES.PRODUCT_CREATE)
    @ApiOperation({ summary: 'Create a category in the authenticated tenant' })
    public async createCategory(
        @Body() createCategoryDto: CreateCategoryDto,
        @CurrentUser() user: CurrentUserPayload
    ){
        return await this.categoriesService.createCategory(createCategoryDto,user.tenantId)
    }

    @Get()
    @Permissions(PERMISSION_CODES.PRODUCT_READ)
    @ApiOperation({ summary: 'List categories in the authenticated tenant' })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    @ApiQuery({ name: 'search', required: false, type: String, example: 'Electronics' })
    public async getPaginatedCategory(
        @Query() categoryParamDto: CategoryParamDto,
        @CurrentUser() user: CurrentUserPayload
    ){
        return await this.categoriesService.getPaginatedCategories(user.tenantId,categoryParamDto.page,categoryParamDto.limit,categoryParamDto.search)
    }

    @Get(':categoryId')
    @Permissions(PERMISSION_CODES.PRODUCT_READ)
    @ApiParam({ name: 'categoryId', format: 'uuid' })
    @ApiOperation({ summary: 'Get a category by id' })
    public async getCategoryById(
        @Param('categoryId', ParseUUIDPipe) categoryId: string
    ){
        return await this.categoriesService.getCategoryById(categoryId)
    }

    @Patch(':categoryId')
    @Permissions(PERMISSION_CODES.PRODUCT_MODIFY)
    @ApiParam({ name: 'categoryId', format: 'uuid' })
    @ApiOperation({ summary: 'Update a category' })
    public async updatecategory(
        @Body() updateCategoryDto: UpdateCategoryDto,
        @Param('categoryId', ParseUUIDPipe) categoryId: string
    ){
        return await this.categoriesService.updateCategory(updateCategoryDto,categoryId)
    }

    @Delete(':categoryId')
    @Permissions(PERMISSION_CODES.PRODUCT_MODIFY)
    @ApiParam({ name: 'categoryId', format: 'uuid' })
    @ApiOperation({ summary: 'Delete a category' })
    public async deleteCategory(
        @Param('categoryId', ParseUUIDPipe) categoryId: string
    ){
        return await this.categoriesService.deleteCategory(categoryId)
    }

}
