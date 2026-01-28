import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class NoValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // Simply return the value without any validation
    return value;
  }
}
