"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchParameterConverter = void 0;
const core_kernel_1 = require("@arkecosystem/core-kernel");
// TODO: rework
class SearchParameterConverter {
    constructor(databaseModel) {
        this.databaseModel = databaseModel;
    }
    convert(params, orderBy, paginate) {
        const searchParameters = {
            orderBy: [],
            paginate: undefined,
            parameters: [],
        };
        if (!params || !Object.keys(params).length) {
            return searchParameters;
        }
        // paginate and orderBy can be embedded in the other search params.
        if (!paginate && (params.hasOwnProperty("limit") || params.hasOwnProperty("offset"))) {
            this.parsePaginate(searchParameters, params);
        }
        else {
            this.parsePaginate(searchParameters, paginate);
        }
        if (!orderBy && params.hasOwnProperty("orderBy")) {
            this.parseOrderBy(searchParameters, params.orderBy);
        }
        else {
            this.parseOrderBy(searchParameters, orderBy);
        }
        this.parseSearchParameters(searchParameters, params);
        return searchParameters;
    }
    parsePaginate(searchParameters, paginate) {
        if (paginate) {
            searchParameters.paginate = {
                limit: Number.isInteger(paginate.limit) ? paginate.limit : 100,
                offset: Number.isInteger(paginate.offset) && +paginate.offset > 0 ? paginate.offset : 0,
            };
        }
    }
    parseOrderBy(searchParameters, orderBy) {
        if (orderBy && typeof orderBy === "string") {
            const fieldDirection = orderBy.split(":").map((o) => o.toLowerCase());
            if (fieldDirection.length === 2 && (fieldDirection[1] === "asc" || fieldDirection[1] === "desc")) {
                core_kernel_1.Utils.assert.defined(searchParameters.orderBy);
                searchParameters.orderBy.push({
                    field: core_kernel_1.Utils.snakeCase(fieldDirection[0]),
                    // @ts-ignore
                    direction: core_kernel_1.Utils.toUpper(fieldDirection[1]),
                });
            }
        }
    }
    parseSearchParameters(searchParameters, params) {
        const searchableFields = this.databaseModel.getSearchableFields();
        const mapByFieldName = searchableFields.reduce((p, c) => {
            const map = {};
            map[c.fieldName] = c;
            return Object.assign(map, p);
        }, {});
        /*
            orderBy, limit and offset are parsed earlier.
            page, pagination are added automatically by hapi-pagination
         */
        const fieldNames = Object.keys(params).filter((value) => !["orderBy", "limit", "offset", "page", "pagination"].includes(value));
        for (const fieldName of fieldNames) {
            const fieldDescriptor = mapByFieldName[fieldName];
            /* null op means that the business repo doesn't know how to categorize what to do w/ with this field so
                let the repo layer decide how it will handle querying this field
                i.e Transactions repo, when parameters contains 'ownerId', some extra logic is done.
                 */
            if (!fieldDescriptor) {
                searchParameters.parameters.push({
                    field: fieldName,
                    operator: core_kernel_1.Contracts.Database.SearchOperator.OP_CUSTOM,
                    value: params[fieldName],
                });
                continue;
            }
            if (fieldDescriptor.supportedOperators.includes(core_kernel_1.Contracts.Database.SearchOperator.OP_LIKE)) {
                searchParameters.parameters.push({
                    field: fieldName,
                    operator: core_kernel_1.Contracts.Database.SearchOperator.OP_LIKE,
                    value: `%${params[fieldName]}%`,
                });
                continue;
            }
            // 'between'
            if (fieldDescriptor.supportedOperators.includes(core_kernel_1.Contracts.Database.SearchOperator.OP_GTE) ||
                fieldDescriptor.supportedOperators.includes(core_kernel_1.Contracts.Database.SearchOperator.OP_LTE)) {
                // check if we have 'to' & 'from', if not, default to OP_EQ
                if (!params[fieldName].hasOwnProperty("from") && !params[fieldName].hasOwnProperty("to")) {
                    searchParameters.parameters.push({
                        field: fieldName,
                        operator: core_kernel_1.Contracts.Database.SearchOperator.OP_EQ,
                        value: params[fieldName],
                    });
                    continue;
                }
                else {
                    if (params[fieldName].hasOwnProperty("from")) {
                        searchParameters.parameters.push({
                            field: fieldName,
                            operator: core_kernel_1.Contracts.Database.SearchOperator.OP_GTE,
                            value: params[fieldName].from,
                        });
                    }
                    if (params[fieldName].hasOwnProperty("to")) {
                        searchParameters.parameters.push({
                            field: fieldName,
                            operator: core_kernel_1.Contracts.Database.SearchOperator.OP_LTE,
                            value: params[fieldName].to,
                        });
                    }
                    continue;
                }
            }
            // If we support 'IN', then the value must be an array(of values)
            if (fieldDescriptor.supportedOperators.includes(core_kernel_1.Contracts.Database.SearchOperator.OP_IN) &&
                Array.isArray(params[fieldName])) {
                searchParameters.parameters.push({
                    field: fieldName,
                    operator: core_kernel_1.Contracts.Database.SearchOperator.OP_IN,
                    value: params[fieldName],
                });
                continue;
            }
            // if the field supports EQ, then ignore any others.
            if (fieldDescriptor.supportedOperators.includes(core_kernel_1.Contracts.Database.SearchOperator.OP_EQ)) {
                searchParameters.parameters.push({
                    field: fieldName,
                    operator: core_kernel_1.Contracts.Database.SearchOperator.OP_EQ,
                    value: params[fieldName],
                });
                continue;
            }
            // if the field supports CONTAINS (@>), then ignore any others.
            if (fieldDescriptor.supportedOperators.includes(core_kernel_1.Contracts.Database.SearchOperator.OP_CONTAINS)) {
                searchParameters.parameters.push({
                    field: fieldName,
                    operator: core_kernel_1.Contracts.Database.SearchOperator.OP_CONTAINS,
                    value: params[fieldName],
                });
                continue;
            }
        }
    }
}
exports.SearchParameterConverter = SearchParameterConverter;
//# sourceMappingURL=search-parameter-converter.js.map