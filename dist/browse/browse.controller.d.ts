import { BrowseService } from './browse.service';
import { ServicePackageListResponseDto, ServicePackageResponseWrapperDto } from '../business-owner/dto';
export declare class BrowseController {
    private browseService;
    constructor(browseService: BrowseService);
    browseServicePackages(shopId: string, page?: number, limit?: number, isActive?: boolean): Promise<ServicePackageListResponseDto>;
    browseServicePackageById(packageId: string, shopId: string): Promise<ServicePackageResponseWrapperDto>;
}
