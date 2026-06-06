import { Injectable } from '@nestjs/common';
import { CreateProductDto, GetProductQueryDto, UpdateProductDto } from 'src/common/dto/product.dto';
import { ProductRepository } from 'src/repositories/product.repository';

@Injectable()
export class ProductsService {
    constructor(
        private readonly productRepository: ProductRepository
    ){}

    public async createProduct(createProductDto: CreateProductDto,tenantId: string){
        return await this.productRepository.createProduct(createProductDto,tenantId)
    }

    public async getPaginatedProducts(tenantId: string,getProductQueryDto: GetProductQueryDto){
        return await this.productRepository.getPaginatedProducts(tenantId,getProductQueryDto)
    }

    public async getProductById(productId: string,tenantId: string){
        return await this.productRepository.getProductById(productId,tenantId)
    }

    public async updateProduct(updateProductDto: UpdateProductDto,productId: string,tenantId: string){
        return await this.productRepository.updateProduct(updateProductDto,productId,tenantId)
    }

    public async deleteProduct(productId: string,tenantId: string){
        return await this.productRepository.deleteProduct(productId,tenantId)
    }

    public async getProductsCategory(tenantId: string){
        return await this.productRepository.getProductsCategory(tenantId)
    }
}
