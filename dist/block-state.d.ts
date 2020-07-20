import { Contracts, Utils as AppUtils } from "@arkecosystem/core-kernel";
import { Interfaces } from "@arkecosystem/crypto";
export declare class BlockState {
    private walletRepository;
    private handlerRegistry;
    private logger;
    applyBlock(block: Interfaces.IBlock): Promise<void>;
    revertBlock(block: Interfaces.IBlock): Promise<void>;
    applyTransaction(transaction: Interfaces.ITransaction): Promise<void>;
    revertTransaction(transaction: Interfaces.ITransaction): Promise<void>;
    increaseWalletDelegateVoteBalance(wallet: Contracts.State.Wallet, amount: AppUtils.BigNumber): void;
    decreaseWalletDelegateVoteBalance(wallet: Contracts.State.Wallet, amount: AppUtils.BigNumber): void;
    private applyVoteBalances;
    private revertVoteBalances;
    private applyBlockToForger;
    private revertBlockFromForger;
    /**
     * Updates the vote balances of the respective delegates of sender and recipient.
     * If the transaction is not a vote...
     *    1. fee + amount is removed from the sender's delegate vote balance
     *    2. amount is added to the recipient's delegate vote balance
     *
     * in case of a vote...
     *    1. the full sender balance is added to the sender's delegate vote balance
     *
     * If revert is set to true, the operations are reversed (plus -> minus, minus -> plus).
     */
    private updateVoteBalances;
    private initGenesisForgerWallet;
}
