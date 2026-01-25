import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
export declare class VendorTransactionQueryValidationPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata): any;
}
