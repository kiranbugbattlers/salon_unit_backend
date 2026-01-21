import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly algorithm = 'aes-256-gcm';
  private readonly encryptionKey: Buffer;
  private readonly ivLength = 16;
  private readonly authTagLength = 16;

  constructor(private readonly configService: ConfigService) {
    // Get encryption key from environment variable
    const key = this.configService.get<string>('ENCRYPTION_KEY');

    if (!key) {
      this.logger.warn(
        '⚠️ ENCRYPTION_KEY not set in environment! Using default key. ' +
        'CHANGE THIS IN PRODUCTION!',
      );
      // Default key for development (32 bytes = 256 bits)
      this.encryptionKey = Buffer.from('12345678901234567890123456789012', 'utf8');
    } else {
      // Ensure key is exactly 32 bytes
      this.encryptionKey = crypto.scryptSync(key, 'salt', 32);
    }
  }

  /**
   * Encrypt sensitive data (e.g., bank account numbers)
   * Returns: base64 encoded string in format: iv:authTag:encryptedData
   */
  encrypt(plainText: string): string {
    try {
      // Generate random IV
      const iv = crypto.randomBytes(this.ivLength);

      // Create cipher
      const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);

      // Encrypt data
      let encrypted = cipher.update(plainText, 'utf8', 'base64');
      encrypted += cipher.final('base64');

      // Get auth tag
      const authTag = cipher.getAuthTag();

      // Combine IV, auth tag, and encrypted data
      const result = `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;

      return result;
    } catch (error) {
      this.logger.error(`Encryption failed: ${error.message}`, error.stack);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt sensitive data
   * Accepts: base64 encoded string in format: iv:authTag:encryptedData
   */
  decrypt(encryptedText: string): string {
    try {
      // Split the encrypted text
      const parts = encryptedText.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }

      const iv = Buffer.from(parts[0], 'base64');
      const authTag = Buffer.from(parts[1], 'base64');
      const encrypted = parts[2];

      // Create decipher
      const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv);
      decipher.setAuthTag(authTag);

      // Decrypt data
      let decrypted = decipher.update(encrypted, 'base64', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      this.logger.error(`Decryption failed: ${error.message}`, error.stack);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Return clear account number for display (no masking)
   */
  maskAccountNumber(accountNumber: string): string {
    return accountNumber || '';
  }

  /**
   * Hash sensitive data (one-way, for comparison purposes)
   */
  hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Generate a secure random token
   */
  generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }
}
