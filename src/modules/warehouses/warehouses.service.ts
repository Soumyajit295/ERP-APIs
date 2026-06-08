import { Injectable } from '@nestjs/common';
import {
  CreateWarehouseDto,
  GetWarehouseParamsDto,
  UpdateWarehouseDto,
} from 'src/common/dto/warehouse.dto';
import { WarehouseRepository } from 'src/repositories/warehouse.repository';

@Injectable()
export class WarehousesService {
  constructor(private readonly warehouseRepository: WarehouseRepository) {}

  public async createWarehouse(
    createWarehouseDto: CreateWarehouseDto,
    tenantId: string,
  ) {
    return await this.warehouseRepository.createWarehouse(
      createWarehouseDto,
      tenantId,
    );
  }

  public async updateWarehouse(
    updateWarehouseDto: UpdateWarehouseDto,
    warehouseId: string,
    tenantId: string,
  ) {
    return await this.warehouseRepository.updatewarehouse(
      updateWarehouseDto,
      warehouseId,
      tenantId,
    );
  }

  public async getPaginatedWarehouse(
    getWarehouseParamsDto: GetWarehouseParamsDto,
    tenantId: string,
  ) {
    return await this.warehouseRepository.getPaginatedWarehouse(
      getWarehouseParamsDto,
      tenantId,
    );
  }

  public async deleteWarehouse(warehouseId: string, tenantId: string) {
    return await this.warehouseRepository.deleteWarehouse(
      warehouseId,
      tenantId,
    );
  }

  public async getWarehouseOptions(tenantId: string) {
    return await this.warehouseRepository.getWarehouseOptions(tenantId);
  }

  public async getWarehouseDetails(warehouseId: string,tenantId: string){
    return await this.warehouseRepository.getWarehouseDetails(warehouseId,tenantId)
  }
}
