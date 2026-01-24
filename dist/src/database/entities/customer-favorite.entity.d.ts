import { Customer } from './customer.entity';
import { BusinessOwner } from './business-owner.entity';
export declare class CustomerFavorite {
    id: string;
    customerId: string;
    businessOwnerId: string;
    createdAt: Date;
    updatedAt: Date;
    customer: Customer;
    businessOwner: BusinessOwner;
}
