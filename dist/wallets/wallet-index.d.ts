import { Contracts } from "@arkecosystem/core-kernel";
export declare class WalletIndex implements Contracts.State.WalletIndex {
    readonly indexer: Contracts.State.WalletIndexer;
    private walletIndex;
    constructor(indexer: Contracts.State.WalletIndexer);
    entries(): ReadonlyArray<[string, Contracts.State.Wallet]>;
    keys(): string[];
    values(): ReadonlyArray<Contracts.State.Wallet>;
    index(wallet: Contracts.State.Wallet): void;
    has(key: string): boolean;
    get(key: string): Contracts.State.Wallet;
    set(key: string, wallet: Contracts.State.Wallet): void;
    forget(key: string): void;
    clear(): void;
    clone(): Contracts.State.WalletIndex;
}
