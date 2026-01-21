import { BusinessOwnerService } from './business-owner.service';
import { BusinessOwnerOnboardingStep1Dto, BusinessOwnerOnboardingStep2Dto, BusinessOwnerOnboardingStep3Dto, BusinessOwnerOnboardingStep4Dto, BusinessOwnerOnboardingStepResponseDto, BusinessOwnerOnboardingCompletionResponseDto, BusinessOwnerOnboardingStatusResponseDto, BusinessOwnerProfileResponseDto, BusinessOwnerProfileUpdateDto, BusinessInfoResponseDto, UpdateBusinessInfoDto, BusinessServicesResponseDto, UpdateBusinessServicesDto, BusinessMediaUploadResponseDto, BusinessMediaListResponseDto, BusinessMediaDeleteResponseDto, BusinessOwnerServicesGroupedByCategoryResponseDto, CreateServicePackageDto, UpdateServicePackageDto, ServicePackageResponseWrapperDto, ServicePackageDeleteResponseDto, DeleteBusinessServicesDto, DeleteBusinessServicesResponseDto, UpdateDeliverySettingsDto, BusinessDocumentResponseDto, BusinessDocumentListResponseDto } from './dto';
import { BusinessSettings } from '../database/entities';
import { DocumentType } from '../common/enums/business-document.enum';
export declare class BusinessOwnerController {
    private businessOwnerService;
    constructor(businessOwnerService: BusinessOwnerService);
    getProfile(req: any): Promise<BusinessOwnerProfileResponseDto>;
    updateProfile(updateData: BusinessOwnerProfileUpdateDto, req: any): Promise<BusinessOwnerProfileResponseDto>;
    getOnboardingStatus(req: any): Promise<BusinessOwnerOnboardingStatusResponseDto>;
    completeStep1(step1Data: BusinessOwnerOnboardingStep1Dto, req: any): Promise<BusinessOwnerOnboardingStepResponseDto>;
    completeStep2(step2Data: BusinessOwnerOnboardingStep2Dto, files: any[], req: any): Promise<BusinessOwnerOnboardingStepResponseDto>;
    completeStep3(step3Data: BusinessOwnerOnboardingStep3Dto, req: any): Promise<BusinessOwnerOnboardingStepResponseDto>;
    completeStep4(step4Data: BusinessOwnerOnboardingStep4Dto, req: any): Promise<BusinessOwnerOnboardingCompletionResponseDto>;
    uploadProfilePicture(file: any, req: any): Promise<{
        profilePic: string;
        profilePicCdnUrl: string;
        profilePicS3Key: string;
    }>;
    deleteProfilePicture(req: any): Promise<{
        message: string;
    }>;
    uploadBusinessMedia(files: any[], req: any): Promise<BusinessMediaUploadResponseDto>;
    getBusinessMedia(req: any): Promise<BusinessMediaListResponseDto>;
    getBusinessMediaById(mediaId: string, req: any): Promise<BusinessMediaListResponseDto>;
    updateBusinessMedia(mediaId: string, updateData: any, req: any): Promise<BusinessMediaListResponseDto>;
    deleteBusinessMedia(mediaId: string, req: any): Promise<BusinessMediaDeleteResponseDto>;
    getBusinessInfo(req: any): Promise<BusinessInfoResponseDto>;
    updateBusinessInfo(updateData: UpdateBusinessInfoDto, req: any): Promise<BusinessInfoResponseDto>;
    getBusinessServices(req: any): Promise<BusinessServicesResponseDto>;
    updateBusinessServices(updateData: UpdateBusinessServicesDto, req: any): Promise<BusinessServicesResponseDto>;
    deleteBusinessServices(deleteData: DeleteBusinessServicesDto, req: any): Promise<DeleteBusinessServicesResponseDto>;
    getBusinessServicesGroupedByCategory(req: any, page?: number, limit?: number, isActive?: boolean): Promise<BusinessOwnerServicesGroupedByCategoryResponseDto>;
    createServicePackage(createDto: CreateServicePackageDto, req: any): Promise<ServicePackageResponseWrapperDto>;
    updateServicePackage(packageId: string, updateDto: UpdateServicePackageDto, req: any): Promise<ServicePackageResponseWrapperDto>;
    deleteServicePackage(packageId: string, req: any): Promise<ServicePackageDeleteResponseDto>;
    toggleServicePackageActive(packageId: string, req: any): Promise<ServicePackageResponseWrapperDto>;
    getDeliverySettings(req: any): Promise<BusinessSettings>;
    updateDeliverySettings(req: any, updateDto: UpdateDeliverySettingsDto): Promise<BusinessSettings>;
    getBusinessDocuments(req: any): Promise<BusinessDocumentListResponseDto>;
    uploadBusinessDocument(file: any, documentType: DocumentType, req: any): Promise<BusinessDocumentResponseDto>;
}
