import { Contracts } from "@arkecosystem/core-kernel";
import { WalletRepository } from "./wallet-repository";
export declare class WalletRepositoryCopyOnWrite extends WalletRepository {
    private readonly blockchainWalletRepository;
    findByAddress(address: string): Contracts.State.Wallet;
    hasByIndex(index: string, key: string): boolean;
    allByUsername(): ReadonlyArray<Contracts.State.Wallet>;
}
