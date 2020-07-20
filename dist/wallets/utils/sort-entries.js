"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortEntries = void 0;
const core_kernel_1 = require("@arkecosystem/core-kernel");
const crypto_1 = require("@arkecosystem/crypto");
const get_property_1 = require("./get-property");
// todo: review the implementation
exports.sortEntries = (params, wallets) => {
    const [iteratee, order] = params;
    if (["balance", "voteBalance"].includes(iteratee)) {
        return Object.values(wallets).sort((a, b) => {
            const iterateeA = get_property_1.getProperty(a, iteratee) || crypto_1.Utils.BigNumber.ZERO;
            const iterateeB = get_property_1.getProperty(b, iteratee) || crypto_1.Utils.BigNumber.ZERO;
            return order === "asc" ? iterateeA.comparedTo(iterateeB) : iterateeB.comparedTo(iterateeA);
        });
    }
    return core_kernel_1.Utils.orderBy(wallets, 
    // todo: revisit the implementation of this method when wallet search changes are implemented
    // most likely even remove it once the wallet changes have been fully implemented
    (wallet) => {
        if (typeof iteratee === "function") {
            // @ts-ignore
            return iteratee(wallet);
        }
        if (core_kernel_1.Utils.has(wallet, iteratee)) {
            return core_kernel_1.Utils.get(wallet, iteratee);
        }
        const delegateAttribute = `attributes.delegate.${iteratee}`;
        if (core_kernel_1.Utils.has(wallet, delegateAttribute)) {
            /* istanbul ignore next */
            return core_kernel_1.Utils.get(wallet, delegateAttribute);
        }
        return core_kernel_1.Utils.get(wallet, `attributes.${iteratee}`);
    }, [order]);
};
//# sourceMappingURL=sort-entries.js.map