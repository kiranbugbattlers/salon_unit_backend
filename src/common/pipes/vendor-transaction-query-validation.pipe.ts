import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class VendorTransactionQueryValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'query') {
      return value;
    }

    // Handle sortOrder validation
    if (value.sortOrder) {
      const sortOrder = value.sortOrder.toString().trim().toUpperCase();
      if (!['ASC', 'DESC'].includes(sortOrder)) {
        throw new BadRequestException('sortOrder must be either ASC or DESC');
      }
      value.sortOrder = sortOrder;
    } else {
      value.sortOrder = 'DESC';
    }

    // Handle sortBy validation
    if (value.sortBy) {
      const sortBy = value.sortBy.toString().trim();
      const validSortFields = ['createdAt', 'amount', 'type', 'category'];
      if (!validSortFields.includes(sortBy)) {
        throw new BadRequestException('sortBy must be one of: createdAt, amount, type, category');
      }
      value.sortBy = sortBy;
    } else {
      value.sortBy = 'createdAt';
    }

    // Handle page validation
    if (value.page) {
      const page = parseInt(value.page, 10);
      if (isNaN(page) || page < 1) {
        value.page = 1;
      } else {
        value.page = page;
      }
    } else {
      value.page = 1;
    }

    // Handle limit validation
    if (value.limit) {
      const limit = parseInt(value.limit, 10);
      if (isNaN(limit) || limit < 1 || limit > 100) {
        value.limit = 20;
      } else {
        value.limit = limit;
      }
    } else {
      value.limit = 20;
    }

    return value;
  }
}
