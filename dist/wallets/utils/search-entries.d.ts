import { Contracts } from "@arkecosystem/core-kernel";
export declare const searchEntries: <T extends Record<string, any>>(params: Contracts.Database.QueryParameters, query: Record<string, string[]>, wallets: readonly T[], defaultOrder: string[]) => Contracts.Search.ListResult<T>;
