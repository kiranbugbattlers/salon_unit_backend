"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecimalCalculator = void 0;
const decimal_js_1 = __importDefault(require("decimal.js"));
decimal_js_1.default.set({
    precision: 20,
    rounding: decimal_js_1.default.ROUND_HALF_UP,
    toExpNeg: -9,
    toExpPos: 9,
    minE: -9,
    maxE: 9,
});
class DecimalCalculator {
    static add(a, b) {
        return new decimal_js_1.default(a).plus(b).toDecimalPlaces(2).toNumber();
    }
    static subtract(a, b) {
        return new decimal_js_1.default(a).minus(b).toDecimalPlaces(2).toNumber();
    }
    static multiply(a, b) {
        return new decimal_js_1.default(a).times(b).toDecimalPlaces(2).toNumber();
    }
    static divide(a, b) {
        if (new decimal_js_1.default(b).isZero()) {
            throw new Error('Division by zero');
        }
        return new decimal_js_1.default(a).dividedBy(b).toDecimalPlaces(2).toNumber();
    }
    static percentageOf(amount, percent) {
        return new decimal_js_1.default(amount)
            .times(percent)
            .dividedBy(100)
            .toDecimalPlaces(2)
            .toNumber();
    }
    static round(value) {
        return new decimal_js_1.default(value).toDecimalPlaces(2).toNumber();
    }
    static isPositive(value) {
        return new decimal_js_1.default(value).greaterThan(0);
    }
    static isNegative(value) {
        return new decimal_js_1.default(value).lessThan(0);
    }
    static isZero(value) {
        return new decimal_js_1.default(value).isZero();
    }
    static compare(a, b) {
        return new decimal_js_1.default(a).comparedTo(b);
    }
    static abs(value) {
        return new decimal_js_1.default(value).abs().toNumber();
    }
    static sum(values) {
        return values
            .reduce((acc, val) => new decimal_js_1.default(acc).plus(val), new decimal_js_1.default(0))
            .toDecimalPlaces(2)
            .toNumber();
    }
    static formatCurrency(value) {
        const num = new decimal_js_1.default(value).toDecimalPlaces(2).toNumber();
        return `₹${num.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    }
    static toPaise(inr) {
        return new decimal_js_1.default(inr).times(100).toDecimalPlaces(0).toNumber();
    }
    static fromPaise(paise) {
        return new decimal_js_1.default(paise).dividedBy(100).toDecimalPlaces(2).toNumber();
    }
}
exports.DecimalCalculator = DecimalCalculator;
//# sourceMappingURL=decimal-calculator.util.js.map