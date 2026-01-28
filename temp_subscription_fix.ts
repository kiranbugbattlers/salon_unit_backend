// Temporary file to hold the corrected subscription service logic
const businessOwnerQuery = `    // Find business owner by user ID with relations
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId },
      relations: ['onboarding', 'documents'],
    });`;

const validationLogic = `    if (!businessOwner.isApproved) {
      throw new ForbiddenException('Only approved businesses can subscribe to plans');
    }

    // Check if business has completed onboarding
    if (!businessOwner.onboarding?.isCompleted) {
      throw new ForbiddenException('Please complete onboarding first before subscribing');
    }

    // Check if all required documents are uploaded
    const requiredDocuments = ['pan', 'aadhar', 'business_license'];
    const uploadedDocuments = businessOwner.documents || [];
    const uploadedTypes = uploadedDocuments.map(doc => doc.documentType);
    const missingDocuments = requiredDocuments.filter(type => !uploadedTypes.includes(type));

    if (missingDocuments.length > 0) {
      throw new ForbiddenException(\`Please upload all required documents before subscribing: \${missingDocuments.join(', ')}\`);
    }`;

console.log('Query fix:', businessOwnerQuery);
console.log('Validation logic:', validationLogic);
