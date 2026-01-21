import { ServicesService } from './services.service';
import { ServicesQueryDto, ServicesResponseDto } from './dto';
export declare class ServicesController {
    private readonly servicesService;
    constructor(servicesService: ServicesService);
    getServices(query: ServicesQueryDto, req?: any): Promise<ServicesResponseDto>;
}
