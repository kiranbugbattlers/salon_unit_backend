import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessOwner } from '../../database/entities/business-owner.entity';
import { DocumentType } from '../../common/enums/business-document.enum';
import { SubscriptionStatus } from '../../common/enums/subscription-status.enum';

@Injectable()
export class BusinessFlowGuard implements CanActivate {
  constructor(
    @InjectRepository(BusinessOwner)
    private businessOwnerRepository: Repository<BusinessOwner>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId) {
      throw new ForbiddenException('User not authenticated');
    }

    // Find business owner with all required relations
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId: user.userId },
      relations: ['onboarding', 'documents', 'businessSubscriptions'],
    });

    if (!businessOwner) {
      throw new ForbiddenException('Business owner not found');
    }

    // Check if onboarding is completed
    if (!businessOwner.onboarding?.isCompleted) {
      throw new ForbiddenException('Please complete onboarding first');
    }

    // Check if all required documents are uploaded
    const requiredDocuments = [DocumentType.PAN, DocumentType.AADHAR, DocumentType.BUSINESS_LICENSE];
    const uploadedDocuments = businessOwner.documents || [];
    const uploadedTypes = uploadedDocuments.map(doc => doc.documentType);
    const allDocumentsUploaded = requiredDocuments.every(type => uploadedTypes.includes(type));

    if (!allDocumentsUploaded) {
      throw new ForbiddenException('Please upload all required documents');
    }

    // Check if business is approved
    if (!businessOwner.isApproved) {
      throw new ForbiddenException('Your business is not approved yet');
    }

    // Check if business has active subscription
    const activeSubscription = businessOwner.businessSubscriptions?.find(sub => sub.status === SubscriptionStatus.ACTIVE);
    if (!activeSubscription) {
      throw new ForbiddenException('Please subscribe to a plan to access dashboard');
    }

    return true;
  }
}
