import { Contracts } from "@arkecosystem/core-kernel";
declare const _default: <T = any>(wallets: readonly T[], params: Contracts.Database.QueryParameters, filters: Record<string, string[]>) => T[];
/**
 * Filter an Array of Objects based on the given parameters.
 * @param  {Array} rows
 * @param  {Object} params
 * @param  {Object} filters
 * @return {Array}
 */
export default _default;
