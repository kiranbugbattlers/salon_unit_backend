export declare class DecimalCalculator {
    static add(a: number | string, b: number | string): number;
    static subtract(a: number | string, b: number | string): number;
    static multiply(a: number | string, b: number | string): number;
    static divide(a: number | string, b: number | string): number;
    static percentageOf(amount: number | string, percent: number | string): number;
    static round(value: number | string): number;
    static isPositive(value: number | string): boolean;
    static isNegative(value: number | string): boolean;
    static isZero(value: number | string): boolean;
    static compare(a: number | string, b: number | string): number;
    static abs(value: number | string): number;
    static sum(values: (number | string)[]): number;
    static formatCurrency(value: number | string): string;
    static toPaise(inr: number | string): number;
    static fromPaise(paise: number | string): number;
}
