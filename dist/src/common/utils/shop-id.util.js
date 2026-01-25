"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomShopCode = generateRandomShopCode;
exports.generateShopId = generateShopId;
exports.isValidShopId = isValidShopId;
function generateRandomShopCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}
function generateShopId() {
    const code = generateRandomShopCode();
    return `SH-${code}`;
}
function isValidShopId(shopId) {
    const pattern = /^SH-[A-Z0-9]{6}$/;
    return pattern.test(shopId);
}
//# sourceMappingURL=shop-id.util.js.map