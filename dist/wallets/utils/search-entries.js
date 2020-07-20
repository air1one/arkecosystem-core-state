"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchEntries = void 0;
const core_kernel_1 = require("@arkecosystem/core-kernel");
const filter_rows_1 = __importDefault(require("./filter-rows"));
const limit_rows_1 = __importDefault(require("./limit-rows"));
const sort_entries_1 = require("./sort-entries");
const manipulateIteratee = (iteratee) => {
    switch (iteratee) {
        case "approval":
            return core_kernel_1.Utils.delegateCalculator.calculateApproval;
        case "forgedtotal":
            return core_kernel_1.Utils.delegateCalculator.calculateForgedTotal;
        case "votes":
            return "voteBalance";
        // TODO: check these are no longer used (presumably this function used to be used with transactions?)
        // case "vendorfield":
        //     return "vendorField";
        // case "expirationvalue":
        //     return "expirationValue";
        // case "expirationtype":
        //     return "expirationType";
        default:
            return iteratee;
    }
};
const calculateOrder = (params, defaultOrder) => {
    let orderBy;
    if (!params.orderBy) {
        orderBy = defaultOrder;
        return orderBy;
    }
    // @ts-ignore
    const orderByMapped = params.orderBy.split(":").map((p) => p.toLowerCase());
    if (orderByMapped.length !== 2 || ["desc", "asc"].includes(orderByMapped[1]) !== true) {
        orderBy = defaultOrder;
        return orderBy;
    }
    orderBy = [manipulateIteratee(orderByMapped[0]), orderByMapped[1]];
    return orderBy;
};
exports.searchEntries = (params, query, wallets, defaultOrder) => {
    if (params.addresses) {
        // Use the `in` filter instead of `exact` for the `address` field
        if (!params.address) {
            // @ts-ignore
            params.address = params.addresses;
            query.exact.shift();
            query.in = ["address"];
        }
        delete params.addresses;
    }
    const order = calculateOrder(params, defaultOrder);
    // @ts-ignore
    wallets = sort_entries_1.sortEntries(order, filter_rows_1.default(wallets, params, query));
    return {
        // @ts-ignore
        rows: limit_rows_1.default(wallets, params),
        count: wallets.length,
        countIsEstimate: false,
    };
};
//# sourceMappingURL=search-entries.js.map