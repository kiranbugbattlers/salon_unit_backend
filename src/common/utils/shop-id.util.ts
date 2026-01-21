/**
 * Utility functions for generating unique Shop IDs
 */

/**
 * Generates a random 6-character alphanumeric string
 * Uses uppercase letters (A-Z) and digits (0-9)
 */
export function generateRandomShopCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';

  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}

/**
 * Generates a complete Shop ID with format "SH-<6CHAR>"
 * Example: "SH-A1B2C3"
 */
export function generateShopId(): string {
  const code = generateRandomShopCode();
  return `SH-${code}`;
}

/**
 * Validates Shop ID format
 * Must match pattern: SH-[A-Z0-9]{6}
 */
export function isValidShopId(shopId: string): boolean {
  const pattern = /^SH-[A-Z0-9]{6}$/;
  return pattern.test(shopId);
}