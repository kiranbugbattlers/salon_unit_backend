import { ConfigService } from '@nestjs/config';
export declare class EncryptionService {
    private readonly configService;
    private readonly logger;
    private readonly algorithm;
    private readonly encryptionKey;
    private readonly ivLength;
    private readonly authTagLength;
    constructor(configService: ConfigService);
    encrypt(plainText: string): string;
    decrypt(encryptedText: string): string;
    maskAccountNumber(accountNumber: string): string;
    hash(data: string): string;
    generateToken(length?: number): string;
}
