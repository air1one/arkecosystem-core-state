import { Contracts } from "@arkecosystem/core-kernel";
export declare class SearchParameterConverter implements Contracts.Database.SearchParameterConverter {
    private databaseModel;
    constructor(databaseModel: any);
    convert(params: Contracts.Database.QueryParameters, orderBy?: any, paginate?: any): Contracts.Database.SearchParameters;
    private parsePaginate;
    private parseOrderBy;
    private parseSearchParameters;
}
