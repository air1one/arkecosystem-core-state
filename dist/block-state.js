"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockState = void 0;
const core_kernel_1 = require("@arkecosystem/core-kernel");
const core_transactions_1 = require("@arkecosystem/core-transactions");
const crypto_1 = require("@arkecosystem/crypto");
// todo: review the implementation and make use of ioc
let BlockState = class BlockState {
    async applyBlock(block) {
        if (block.data.height === 1) {
            this.initGenesisForgerWallet(block.data.generatorPublicKey);
        }
        const forgerWallet = this.walletRepository.findByPublicKey(block.data.generatorPublicKey);
        /**
         * TODO: side-effect of findByPublicKey is that it creates a wallet if one isn't found - is that correct?
         * If so, this code can be deleted.
         */
        // if (!forgerWallet) {
        //     const msg = `Failed to lookup forger '${block.data.generatorPublicKey}' of block '${block.data.id}'.`;
        //     this.app.terminate(msg);
        // }
        const appliedTransactions = [];
        try {
            for (const transaction of block.transactions) {
                await this.applyTransaction(transaction);
                appliedTransactions.push(transaction);
            }
            this.applyBlockToForger(forgerWallet, block.data);
        }
        catch (error) {
            this.logger.error(error.stack);
            this.logger.error("Failed to apply all transactions in block - reverting previous transactions");
            for (const transaction of appliedTransactions.reverse()) {
                await this.revertTransaction(transaction);
            }
            throw error;
        }
    }
    async revertBlock(block) {
        const forgerWallet = this.walletRepository.findByPublicKey(block.data.generatorPublicKey);
        /**
         * TODO: side-effect of findByPublicKey is that it creates a wallet if one isn't found - is that correct?
         * If so, this code can be deleted.
         */
        // if (!forgerWallet) {
        //     const msg = `Failed to lookup forger '${block.data.generatorPublicKey}' of block '${block.data.id}'.`;
        //     this.app.terminate(msg);
        // }
        const revertedTransactions = [];
        try {
            for (const transaction of block.transactions.slice().reverse()) {
                await this.revertTransaction(transaction);
                revertedTransactions.push(transaction);
            }
            this.revertBlockFromForger(forgerWallet, block.data);
        }
        catch (error) {
            this.logger.error(error.stack);
            this.logger.error("Failed to revert all transactions in block - applying previous transactions");
            for (const transaction of revertedTransactions.reverse()) {
                await this.applyTransaction(transaction);
            }
            throw error;
        }
    }
    async applyTransaction(transaction) {
        var _a;
        const transactionHandler = await this.handlerRegistry.getActivatedHandlerForData(transaction.data);
        let lockWallet;
        let lockTransaction;
        if (transaction.type === crypto_1.Enums.TransactionType.HtlcClaim &&
            transaction.typeGroup === crypto_1.Enums.TransactionTypeGroup.Core) {
            core_kernel_1.Utils.assert.defined((_a = transaction.data.asset) === null || _a === void 0 ? void 0 : _a.claim);
            const lockId = transaction.data.asset.claim.lockTransactionId;
            lockWallet = this.walletRepository.findByIndex(core_kernel_1.Contracts.State.WalletIndexes.Locks, lockId);
            lockTransaction = lockWallet.getAttribute("htlc.locks", {})[lockId];
        }
        await transactionHandler.apply(transaction);
        core_kernel_1.Utils.assert.defined(transaction.data.senderPublicKey);
        const sender = this.walletRepository.findByPublicKey(transaction.data.senderPublicKey);
        let recipient;
        if (transaction.data.recipientId) {
            core_kernel_1.Utils.assert.defined(transaction.data.recipientId);
            recipient = this.walletRepository.findByAddress(transaction.data.recipientId);
        }
        // @ts-ignore - Apply vote balance updates
        this.applyVoteBalances(sender, recipient, transaction.data, lockWallet, lockTransaction);
    }
    async revertTransaction(transaction) {
        var _a;
        const { data } = transaction;
        const transactionHandler = await this.handlerRegistry.getActivatedHandlerForData(transaction.data);
        core_kernel_1.Utils.assert.defined(data.senderPublicKey);
        const sender = this.walletRepository.findByPublicKey(data.senderPublicKey);
        let recipient;
        if (transaction.data.recipientId) {
            core_kernel_1.Utils.assert.defined(transaction.data.recipientId);
            recipient = this.walletRepository.findByAddress(transaction.data.recipientId);
        }
        await transactionHandler.revert(transaction);
        let lockWallet;
        let lockTransaction;
        if (transaction.type === crypto_1.Enums.TransactionType.HtlcClaim &&
            transaction.typeGroup === crypto_1.Enums.TransactionTypeGroup.Core) {
            core_kernel_1.Utils.assert.defined((_a = transaction.data.asset) === null || _a === void 0 ? void 0 : _a.claim);
            const lockId = transaction.data.asset.claim.lockTransactionId;
            lockWallet = this.walletRepository.findByIndex(core_kernel_1.Contracts.State.WalletIndexes.Locks, lockId);
            lockTransaction = lockWallet.getAttribute("htlc.locks", {})[lockId];
        }
        // @ts-ignore - Revert vote balance updates
        this.revertVoteBalances(sender, recipient, data, lockWallet, lockTransaction);
    }
    increaseWalletDelegateVoteBalance(wallet, amount) {
        // ? packages/core-transactions/src/handlers/one/vote.ts:L120 blindly sets "vote" attribute
        // ? is it guaranteed that delegate wallet exists, so delegateWallet.getAttribute("delegate.voteBalance") is safe?
        if (wallet.hasVoted()) {
            const delegatePulicKey = wallet.getAttribute("vote");
            const delegateWallet = this.walletRepository.findByPublicKey(delegatePulicKey);
            const oldDelegateVoteBalance = delegateWallet.getAttribute("delegate.voteBalance");
            const newDelegateVoteBalance = oldDelegateVoteBalance.plus(amount);
            delegateWallet.setAttribute("delegate.voteBalance", newDelegateVoteBalance);
        }
    }
    decreaseWalletDelegateVoteBalance(wallet, amount) {
        if (wallet.hasVoted()) {
            const delegatePulicKey = wallet.getAttribute("vote");
            const delegateWallet = this.walletRepository.findByPublicKey(delegatePulicKey);
            const oldDelegateVoteBalance = delegateWallet.getAttribute("delegate.voteBalance");
            const newDelegateVoteBalance = oldDelegateVoteBalance.minus(amount);
            delegateWallet.setAttribute("delegate.voteBalance", newDelegateVoteBalance);
        }
    }
    // WALLETS
    applyVoteBalances(sender, recipient, transaction, lockWallet, lockTransaction) {
        return this.updateVoteBalances(sender, recipient, transaction, lockWallet, lockTransaction, false);
    }
    revertVoteBalances(sender, recipient, transaction, lockWallet, lockTransaction) {
        return this.updateVoteBalances(sender, recipient, transaction, lockWallet, lockTransaction, true);
    }
    applyBlockToForger(forgerWallet, blockData) {
        const delegateAttribute = forgerWallet.getAttribute("delegate");
        delegateAttribute.producedBlocks++;
        delegateAttribute.forgedFees = delegateAttribute.forgedFees.plus(blockData.totalFee);
        delegateAttribute.forgedRewards = delegateAttribute.forgedRewards.plus(blockData.reward);
        delegateAttribute.lastBlock = blockData;
        const balanceIncrease = blockData.reward.plus(blockData.totalFee);
        this.increaseWalletDelegateVoteBalance(forgerWallet, balanceIncrease);
        forgerWallet.balance = forgerWallet.balance.plus(balanceIncrease);
    }
    revertBlockFromForger(forgerWallet, blockData) {
        const delegateAttribute = forgerWallet.getAttribute("delegate");
        delegateAttribute.producedBlocks--;
        delegateAttribute.forgedFees = delegateAttribute.forgedFees.minus(blockData.totalFee);
        delegateAttribute.forgedRewards = delegateAttribute.forgedRewards.minus(blockData.reward);
        delegateAttribute.lastBlock = undefined;
        const balanceDecrease = blockData.reward.plus(blockData.totalFee);
        this.decreaseWalletDelegateVoteBalance(forgerWallet, balanceDecrease);
        forgerWallet.balance = forgerWallet.balance.minus(balanceDecrease);
    }
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
    updateVoteBalances(sender, recipient, transaction, lockWallet, lockTransaction, revert) {
        var _a, _b, _c;
        if (transaction.type === crypto_1.Enums.TransactionType.Vote &&
            transaction.typeGroup === crypto_1.Enums.TransactionTypeGroup.Core) {
            core_kernel_1.Utils.assert.defined((_a = transaction.asset) === null || _a === void 0 ? void 0 : _a.votes);
            const vote = transaction.asset.votes[0];
            const delegate = this.walletRepository.findByPublicKey(vote.substr(1));
            let voteBalance = delegate.getAttribute("delegate.voteBalance", crypto_1.Utils.BigNumber.ZERO);
            if (vote.startsWith("+")) {
                voteBalance = revert
                    ? voteBalance.minus(sender.balance.minus(transaction.fee))
                    : voteBalance.plus(sender.balance);
            }
            else {
                voteBalance = revert
                    ? voteBalance.plus(sender.balance)
                    : voteBalance.minus(sender.balance.plus(transaction.fee));
            }
            delegate.setAttribute("delegate.voteBalance", voteBalance);
        }
        else {
            // Update vote balance of the sender's delegate
            if (sender.hasVoted()) {
                const delegate = this.walletRepository.findByPublicKey(sender.getAttribute("vote"));
                let amount = transaction.amount;
                if (transaction.type === crypto_1.Enums.TransactionType.MultiPayment &&
                    transaction.typeGroup === crypto_1.Enums.TransactionTypeGroup.Core) {
                    core_kernel_1.Utils.assert.defined((_b = transaction.asset) === null || _b === void 0 ? void 0 : _b.payments);
                    amount = transaction.asset.payments.reduce((prev, curr) => prev.plus(curr.amount), crypto_1.Utils.BigNumber.ZERO);
                }
                const total = amount.plus(transaction.fee);
                const voteBalance = delegate.getAttribute("delegate.voteBalance", crypto_1.Utils.BigNumber.ZERO);
                let newVoteBalance;
                if (transaction.type === crypto_1.Enums.TransactionType.HtlcLock &&
                    transaction.typeGroup === crypto_1.Enums.TransactionTypeGroup.Core) {
                    // HTLC Lock keeps the locked amount as the sender's delegate vote balance
                    newVoteBalance = revert ? voteBalance.plus(transaction.fee) : voteBalance.minus(transaction.fee);
                }
                else if (transaction.type === crypto_1.Enums.TransactionType.HtlcClaim &&
                    transaction.typeGroup === crypto_1.Enums.TransactionTypeGroup.Core) {
                    // HTLC Claim transfers the locked amount to the lock recipient's (= claim sender) delegate vote balance
                    newVoteBalance = revert
                        ? voteBalance.plus(transaction.fee).minus(lockTransaction.amount)
                        : voteBalance.minus(transaction.fee).plus(lockTransaction.amount);
                }
                else {
                    // General case : sender delegate vote balance reduced by amount + fees (or increased if revert)
                    newVoteBalance = revert ? voteBalance.plus(total) : voteBalance.minus(total);
                }
                delegate.setAttribute("delegate.voteBalance", newVoteBalance);
            }
            if (transaction.type === crypto_1.Enums.TransactionType.HtlcClaim &&
                transaction.typeGroup === crypto_1.Enums.TransactionTypeGroup.Core &&
                lockWallet.hasAttribute("vote")) {
                // HTLC Claim transfers the locked amount to the lock recipient's (= claim sender) delegate vote balance
                const lockWalletDelegate = this.walletRepository.findByPublicKey(lockWallet.getAttribute("vote"));
                const lockWalletDelegateVoteBalance = lockWalletDelegate.getAttribute("delegate.voteBalance", crypto_1.Utils.BigNumber.ZERO);
                lockWalletDelegate.setAttribute("delegate.voteBalance", revert
                    ? lockWalletDelegateVoteBalance.plus(lockTransaction.amount)
                    : lockWalletDelegateVoteBalance.minus(lockTransaction.amount));
            }
            if (transaction.type === crypto_1.Enums.TransactionType.MultiPayment &&
                transaction.typeGroup === crypto_1.Enums.TransactionTypeGroup.Core) {
                core_kernel_1.Utils.assert.defined((_c = transaction.asset) === null || _c === void 0 ? void 0 : _c.payments);
                // go through all payments and update recipients delegates vote balance
                for (const { recipientId, amount } of transaction.asset.payments) {
                    const recipientWallet = this.walletRepository.findByAddress(recipientId);
                    if (recipientWallet.hasVoted()) {
                        const vote = recipientWallet.getAttribute("vote");
                        const delegate = this.walletRepository.findByPublicKey(vote);
                        const voteBalance = delegate.getAttribute("delegate.voteBalance", crypto_1.Utils.BigNumber.ZERO);
                        delegate.setAttribute("delegate.voteBalance", revert ? voteBalance.minus(amount) : voteBalance.plus(amount));
                    }
                }
            }
            // Update vote balance of recipient's delegate
            if (recipient &&
                recipient.hasVoted() &&
                (transaction.type !== crypto_1.Enums.TransactionType.HtlcLock ||
                    transaction.typeGroup !== crypto_1.Enums.TransactionTypeGroup.Core)) {
                const delegate = this.walletRepository.findByPublicKey(recipient.getAttribute("vote"));
                const voteBalance = delegate.getAttribute("delegate.voteBalance", crypto_1.Utils.BigNumber.ZERO);
                delegate.setAttribute("delegate.voteBalance", revert ? voteBalance.minus(transaction.amount) : voteBalance.plus(transaction.amount));
            }
        }
    }
    initGenesisForgerWallet(forgerPublicKey) {
        if (this.walletRepository.hasByPublicKey(forgerPublicKey)) {
            return;
        }
        const forgerAddress = crypto_1.Identities.Address.fromPublicKey(forgerPublicKey);
        const forgerWallet = this.walletRepository.createWallet(forgerAddress);
        forgerWallet.publicKey = forgerPublicKey;
        this.walletRepository.index(forgerWallet);
    }
};
__decorate([
    core_kernel_1.Container.inject(core_kernel_1.Container.Identifiers.WalletRepository),
    __metadata("design:type", Object)
], BlockState.prototype, "walletRepository", void 0);
__decorate([
    core_kernel_1.Container.inject(core_kernel_1.Container.Identifiers.TransactionHandlerRegistry),
    __metadata("design:type", core_transactions_1.Handlers.Registry)
], BlockState.prototype, "handlerRegistry", void 0);
__decorate([
    core_kernel_1.Container.inject(core_kernel_1.Container.Identifiers.LogService),
    __metadata("design:type", Object)
], BlockState.prototype, "logger", void 0);
BlockState = __decorate([
    core_kernel_1.Container.injectable()
], BlockState);
exports.BlockState = BlockState;
//# sourceMappingURL=block-state.js.map