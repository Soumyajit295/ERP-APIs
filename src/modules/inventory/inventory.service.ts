import { Injectable } from '@nestjs/common';
import {
    GetInventoryProductsQueryDto,
    InventoryDashboardResponseDto,
    InventoryProductsResponseDto,
} from 'src/common/dto/inventory.dto';
import { InventoryRepository } from 'src/repositories/inventory.repository';

@Injectable()
export class InventoryService {
    constructor(
        private readonly inventoryRepository: InventoryRepository
    ){}

    public async getInventoryDashboardData(tenantId: string): Promise<InventoryDashboardResponseDto>{
        return await this.inventoryRepository.getInventoryDashboardData(tenantId)
    }

    public async getInventoryProducts(getInventoryProductsQueryDto: GetInventoryProductsQueryDto,tenantId: string): Promise<InventoryProductsResponseDto>{
        return await this.inventoryRepository.getTenantProducts(getInventoryProductsQueryDto,tenantId)   
    }
}
