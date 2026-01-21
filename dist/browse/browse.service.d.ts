import { Repository } from 'typeorm';
import { BusinessOwner, ServicePackage } from '../database/entities';
import { ServicePackageResponseDto, ServicePackageListResponseDto } from '../business-owner/dto';
export declare class BrowseService {
    private businessOwnerRepository;
    private servicePackageRepository;
    constructor(businessOwnerRepository: Repository<BusinessOwner>, servicePackageRepository: Repository<ServicePackage>);
    browseServicePackages(shopId: string, page?: number, limit?: number, isActive?: boolean): Promise<ServicePackageListResponseDto>;
    browseServicePackageById(shopId: string, packageId: string): Promise<ServicePackageResponseDto>;
    private mapToServicePackageResponseDto;
}
