import { Injectable } from '@nestjs/common';
import { CreateSupplierDto, GetSupplierParamsDto, UpdateSupplierDto } from 'src/common/dto/supplier.dto';
import { SupplierRepository } from 'src/repositories/supplier.repository';

@Injectable()
export class SuppliersService {
    constructor(
        private readonly supplierRepository: SupplierRepository
    ){}

    public async createSupplier(createSupplierDto: CreateSupplierDto,tenantId: string){
        return await this.supplierRepository.createSupplier(createSupplierDto,tenantId)
    }

    public async paginatedSupplier(getSupplierParamDto: GetSupplierParamsDto,tenantId: string){
        return await this.supplierRepository.paginatedSupplier(getSupplierParamDto,tenantId)
    }

    public async getSuppliersOptions(tenantId: string){
        return await this.supplierRepository.getSuppliersOptions(tenantId)
    }

    public async updateSupplier(updateSupplierDto: UpdateSupplierDto,supplierId: string,tenantId: string){
        return await this.supplierRepository.updateSupplier(updateSupplierDto,supplierId,tenantId)
    }

    public async deleteSupplier(supplierId: string,tenantId: string){
        return await this.supplierRepository.deleteSupplier(supplierId,tenantId)
    }
}
