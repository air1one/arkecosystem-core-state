"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const get_property_1 = require("./get-property");
/**
 * Filter an Array of Objects based on the given parameters.
 * @param  {Array} rows
 * @param  {Object} params
 * @param  {Object} filters
 * @return {Array}
 */
exports.default = (wallets, params, filters) => {
    return wallets.filter((wallet) => {
        if (filters.hasOwnProperty("exact")) {
            for (const elem of filters.exact) {
                if (params[elem] !== undefined && get_property_1.getProperty(wallet, elem) !== params[elem]) {
                    return false;
                }
            }
        }
        if (filters.hasOwnProperty("like")) {
            for (const elem of filters.like) {
                if (params[elem] && !get_property_1.getProperty(wallet, elem).includes(params[elem])) {
                    return false;
                }
            }
        }
        if (filters.hasOwnProperty("between")) {
            for (const elem of filters.between) {
                if (!params[elem]) {
                    continue;
                }
                if (!params[elem].hasOwnProperty("from") &&
                    !params[elem].hasOwnProperty("to") &&
                    get_property_1.getProperty(wallet, elem) !== params[elem]) {
                    return false;
                }
                if (params[elem].hasOwnProperty("from") || params[elem].hasOwnProperty("to")) {
                    let isMoreThan = true;
                    let isLessThan = true;
                    if (params[elem].hasOwnProperty("from")) {
                        // @ts-ignore
                        isMoreThan = get_property_1.getProperty(wallet, elem) >= params[elem].from;
                    }
                    if (params[elem].hasOwnProperty("to")) {
                        // @ts-ignore
                        isLessThan = get_property_1.getProperty(wallet, elem) <= params[elem].to;
                    }
                    return isMoreThan && isLessThan;
                }
            }
        }
        if (filters.hasOwnProperty("in")) {
            for (const elem of filters.in) {
                if (params[elem] && Array.isArray(params[elem])) {
                    // @ts-ignore
                    return params[elem].indexOf(get_property_1.getProperty(wallet, elem)) > -1;
                }
                return false;
            }
        }
        if (filters.hasOwnProperty("every")) {
            for (const elem of filters.every) {
                if (params[elem] && get_property_1.getProperty(wallet, elem)) {
                    if (Array.isArray(wallet[elem])) {
                        if (Array.isArray(params[elem])) {
                            // @ts-ignore
                            return params[elem].every((a) => wallet[elem].includes(a));
                        }
                        else {
                            throw new Error('Filtering by "every" requires an Array');
                        }
                    }
                    else {
                        throw new Error("Property must be an array");
                    }
                }
            }
        }
        // NOTE: it was used to filter by `votes`, but that field was rejected and
        // replaced by `vote`. This filter is kept here just in case
        if (filters.hasOwnProperty("any")) {
            for (const elem of filters.any) {
                if (params[elem] && get_property_1.getProperty(wallet, elem)) {
                    if (Array.isArray(params[elem])) {
                        // @ts-ignore
                        if (wallet[elem].every((a) => params[elem].indexOf(a) === -1)) {
                            return false;
                        }
                    }
                    else {
                        throw new Error('Filtering by "any" requires an Array');
                    }
                }
            }
        }
        return true;
    });
};
//# sourceMappingURL=filter-rows.js.map