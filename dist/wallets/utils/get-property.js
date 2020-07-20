"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProperty = void 0;
const core_kernel_1 = require("@arkecosystem/core-kernel");
const wallet_1 = require("../wallet");
// todo: review implementation - quite a mess at the moment
exports.getProperty = (wallet, prop) => {
    for (const [key, value] of Object.entries(wallet)) {
        if (key === prop) {
            return value;
        }
        core_kernel_1.Utils.assert.defined(value);
        if (typeof value === "object") {
            const result = exports.getProperty(value, prop);
            if (result !== undefined) {
                return result;
            }
        }
    }
    if (wallet instanceof wallet_1.Wallet) {
        return exports.getProperty(wallet.getAttributes(), prop);
    }
    return undefined;
};
//# sourceMappingURL=get-property.js.map