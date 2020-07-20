import { Contracts } from "@arkecosystem/core-kernel";
export declare type OrderBy = (any | string)[];
export declare const sortEntries: (params: OrderBy, wallets: Contracts.State.Wallet[]) => Contracts.State.Wallet[];
