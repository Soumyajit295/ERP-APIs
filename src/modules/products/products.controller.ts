import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import {
    CreateProductDto,
    GetProductQueryDto,
    ProductCategoryOptionDto,
    ProductMessageResponseDto,
    ProductPaginatedResponseDto,
    ProductResponseDto,
    UpdateProductDto,
} from 'src/common/dto/product.dto';
import { CurrentUser } from '../auth/currentuser.decorator';
import type { CurrentUserPayload } from '../auth/types/current-user.type';
import { PERMISSION_CODES } from 'src/common/constants/permissions.constant';
import { Permissions } from '../auth/permissions.decorator';
import { SWAGGER_BEARER_AUTH } from 'src/swagger';
import { ProductStatus } from 'src/common/enums/product.enum';

@ApiTags('Products')
@ApiBearerAuth(SWAGGER_BEARER_AUTH)
@Controller('products')
export class ProductsController {
    constructor(
        private readonly productService: ProductsService
    ){}

    @Post()
    @Permissions(PERMISSION_CODES.PRODUCT_CREATE)
    @ApiOperation({ summary: 'Create a product in the authenticated tenant' })
    @ApiCreatedResponse({ type: ProductMessageResponseDto })
    public async createProduct(
        @Body() createProductDto: CreateProductDto,
        @CurrentUser() user: CurrentUserPayload
    ){
        return await this.productService.createProduct(createProductDto,user.tenantId)
    }

    @Get()
    @Permissions(PERMISSION_CODES.PRODUCT_READ)
    @ApiOperation({ summary: 'List products in the authenticated tenant' })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    @ApiQuery({ name: 'categoryId', required: false, format: 'uuid' })
    @ApiQuery({ name: 'status', required: false, enum: ProductStatus })
    @ApiQuery({ name: 'search', required: false, type: String, example: 'keyboard' })
    @ApiOkResponse({ type: ProductPaginatedResponseDto })
    public async getPaginatedProducts(
        @Query() getProductQueryDto: GetProductQueryDto,
        @CurrentUser() user: CurrentUserPayload
    ){
        return await this.productService.getPaginatedProducts(user.tenantId,getProductQueryDto)
    }

    @Get('categories')
    @Permissions(PERMISSION_CODES.PRODUCT_READ)
    @ApiOperation({ summary: 'List product category options in the authenticated tenant' })
    @ApiOkResponse({ type: [ProductCategoryOptionDto] })
    public async getProductCategories(
        @CurrentUser() user: CurrentUserPayload
    ){
        return await this.productService.getProductsCategory(user.tenantId)
    }

    @Get(':productId')
    @Permissions(PERMISSION_CODES.PRODUCT_READ)
    @ApiParam({ name: 'productId', format: 'uuid' })
    @ApiOperation({ summary: 'Get a product by id' })
    @ApiOkResponse({ type: ProductResponseDto })
    public async getProductById(
        @Param('productId', ParseUUIDPipe) productId: string,
        @CurrentUser() user: CurrentUserPayload
    ){
        return await this.productService.getProductById(productId,user.tenantId)
    }

    @Patch(':productId')
    @Permissions(PERMISSION_CODES.PRODUCT_MODIFY)
    @ApiParam({ name: 'productId', format: 'uuid' })
    @ApiOperation({ summary: 'Update a product' })
    @ApiOkResponse({ type: ProductMessageResponseDto })
    public async updateProduct(
        @Body() updateProductDto: UpdateProductDto,
        @Param('productId', ParseUUIDPipe) productId: string,
        @CurrentUser() user: CurrentUserPayload
    ){
        return await this.productService.updateProduct(updateProductDto,productId,user.tenantId)
    }

    @Delete(':productId')
    @Permissions(PERMISSION_CODES.PRODUCT_MODIFY)
    @ApiParam({ name: 'productId', format: 'uuid' })
    @ApiOperation({ summary: 'Delete a product' })
    @ApiOkResponse({ type: ProductMessageResponseDto })
    public async deleteProduct(
        @Param('productId', ParseUUIDPipe) productId: string,
        @CurrentUser() user: CurrentUserPayload
    ){
        return await this.productService.deleteProduct(productId,user.tenantId)
    }
}
