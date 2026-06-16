import { Injectable } from '@nestjs/common';
import { CreateCustomerDto, GetCustomerQueryDto, UpdateCustomerDto } from 'src/common/dto/customer.dto';
import { CustomerRepository } from 'src/repositories/customer.repository';

@Injectable()
export class CustomersService {
    constructor(
        private readonly customerRespository: CustomerRepository
    ){}

    public async createCustomer(createCustomerDto: CreateCustomerDto,tenantId: string){
        return await this.customerRespository.createCustomer(createCustomerDto,tenantId)
    }

    public async getPaginatedCustomers(getCustomerQueryDto: GetCustomerQueryDto,tenantId: string){
        return await this.customerRespository.getPaginatedCustomer(getCustomerQueryDto,tenantId)
    }

    public async updateCustomer(updateCustomerDto: UpdateCustomerDto,customerId: string,tenantId: string){
        return await this.customerRespository.updateCustomer(updateCustomerDto,customerId,tenantId)
    }

    public async deleteCustomer(customerId: string,tenantId: string){
        return await this.customerRespository.deletedCustomer(customerId,tenantId)
    }

    public async getCustomerOptions(tenantId: string){
        return await this.customerRespository.getCustomerOptions(tenantId)
    }
}
