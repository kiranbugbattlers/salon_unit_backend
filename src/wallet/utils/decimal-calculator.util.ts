/**
 * Decimal Calculator Utility
 *
 * Uses precise decimal arithmetic for financial calculations
 * Prevents floating point precision errors
 *
 * Note: Install decimal.js first: npm install decimal.js
 */

import Decimal from 'decimal.js';

// Configure Decimal.js for currency (2 decimal places, round half-up)
Decimal.set({
  precision: 20,
  rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -9,
  toExpPos: 9,
  minE: -9,
  maxE: 9,
});

export class DecimalCalculator {
  /**
   * Add two numbers precisely
   */
  static add(a: number | string, b: number | string): number {
    return new Decimal(a).plus(b).toDecimalPlaces(2).toNumber();
  }

  /**
   * Subtract two numbers precisely
   */
  static subtract(a: number | string, b: number | string): number {
    return new Decimal(a).minus(b).toDecimalPlaces(2).toNumber();
  }

  /**
   * Multiply two numbers precisely
   */
  static multiply(a: number | string, b: number | string): number {
    return new Decimal(a).times(b).toDecimalPlaces(2).toNumber();
  }

  /**
   * Divide two numbers precisely
   */
  static divide(a: number | string, b: number | string): number {
    if (new Decimal(b).isZero()) {
      throw new Error('Division by zero');
    }
    return new Decimal(a).dividedBy(b).toDecimalPlaces(2).toNumber();
  }

  /**
   * Calculate percentage of a number
   * Example: percentageOf(1000, 2.5) = 25.00
   */
  static percentageOf(amount: number | string, percent: number | string): number {
    return new Decimal(amount)
      .times(percent)
      .dividedBy(100)
      .toDecimalPlaces(2)
      .toNumber();
  }

  /**
   * Round to 2 decimal places (currency)
   */
  static round(value: number | string): number {
    return new Decimal(value).toDecimalPlaces(2).toNumber();
  }

  /**
   * Check if value is positive
   */
  static isPositive(value: number | string): boolean {
    return new Decimal(value).greaterThan(0);
  }

  /**
   * Check if value is negative
   */
  static isNegative(value: number | string): boolean {
    return new Decimal(value).lessThan(0);
  }

  /**
   * Check if value is zero
   */
  static isZero(value: number | string): boolean {
    return new Decimal(value).isZero();
  }

  /**
   * Compare two values
   * Returns: 1 if a > b, -1 if a < b, 0 if equal
   */
  static compare(a: number | string, b: number | string): number {
    return new Decimal(a).comparedTo(b);
  }

  /**
   * Get absolute value
   */
  static abs(value: number | string): number {
    return new Decimal(value).abs().toNumber();
  }

  /**
   * Calculate sum of array of numbers
   */
  static sum(values: (number | string)[]): number {
    return values
      .reduce((acc, val) => new Decimal(acc).plus(val), new Decimal(0))
      .toDecimalPlaces(2)
      .toNumber();
  }

  /**
   * Format number as currency (INR)
   */
  static formatCurrency(value: number | string): string {
    const num = new Decimal(value).toDecimalPlaces(2).toNumber();
    return `₹${num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  /**
   * Convert to paise (for Razorpay - INR * 100)
   */
  static toPaise(inr: number | string): number {
    return new Decimal(inr).times(100).toDecimalPlaces(0).toNumber();
  }

  /**
   * Convert from paise to INR
   */
  static fromPaise(paise: number | string): number {
    return new Decimal(paise).dividedBy(100).toDecimalPlaces(2).toNumber();
  }
}
