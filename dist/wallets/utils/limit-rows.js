"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Return some rows by an offset and a limit.
 */
// todo: review the implementation
exports.default = (rows, params) => {
    if (params.offset || params.limit) {
        const offset = params.offset || 0;
        // @ts-ignore
        const limit = params.limit ? offset + params.limit : rows.length;
        // @ts-ignore
        return rows.slice(offset, limit);
    }
    return rows;
};
//# sourceMappingURL=limit-rows.js.map