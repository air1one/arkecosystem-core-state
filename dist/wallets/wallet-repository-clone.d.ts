import { Contracts } from "@arkecosystem/core-kernel";
import { WalletRepository } from "./wallet-repository";
export declare class WalletRepositoryClone extends WalletRepository {
    private readonly blockchainWalletRepository;
    initialize(): void;
    index(wallet: Contracts.State.Wallet): void;
}
