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
exports.StateBuilder = void 0;
const core_database_1 = require("@arkecosystem/core-database");
const core_kernel_1 = require("@arkecosystem/core-kernel");
const crypto_1 = require("@arkecosystem/crypto");
// todo: review the implementation
let StateBuilder = class StateBuilder {
    async run() {
        this.events = this.app.get(core_kernel_1.Container.Identifiers.EventDispatcherService);
        const registeredHandlers = this.app
            .getTagged(core_kernel_1.Container.Identifiers.TransactionHandlerRegistry, "state", "blockchain")
            .getRegisteredHandlers();
        const steps = registeredHandlers.length + 3;
        try {
            this.logger.info(`State Generation - Step 1 of ${steps}: Block Rewards`);
            await this.buildBlockRewards();
            this.logger.info(`State Generation - Step 2 of ${steps}: Fees & Nonces`);
            await this.buildSentTransactions();
            const capitalize = (key) => key[0].toUpperCase() + key.slice(1);
            for (let i = 0; i < registeredHandlers.length; i++) {
                const handler = registeredHandlers[i];
                const ctorKey = handler.getConstructor().key;
                const version = handler.getConstructor().version;
                core_kernel_1.Utils.assert.defined(ctorKey);
                this.logger.info(`State Generation - Step ${3 + i} of ${steps}: ${capitalize(ctorKey)} v${version}`);
                await handler.bootstrap();
            }
            this.logger.info(`State Generation - Step ${steps} of ${steps}: Vote Balances & Delegate Ranking`);
            this.dposState.buildVoteBalances();
            this.dposState.buildDelegateRanking();
            this.logger.info(`Number of registered delegates: ${Object.keys(this.walletRepository.allByUsername()).length}`);
            this.verifyWalletsConsistency();
            this.events.dispatch(core_kernel_1.Enums.StateEvent.BuilderFinished);
        }
        catch (ex) {
            this.logger.error(ex.stack);
        }
    }
    async buildBlockRewards() {
        const blocks = await this.blockRepository.getBlockRewards();
        for (const block of blocks) {
            const wallet = this.walletRepository.findByPublicKey(block.generatorPublicKey);
            wallet.balance = wallet.balance.plus(block.rewards);
        }
    }
    async buildSentTransactions() {
        const transactions = await this.transactionRepository.getSentTransactions();
        for (const transaction of transactions) {
            const wallet = this.walletRepository.findByPublicKey(transaction.senderPublicKey);
            wallet.nonce = crypto_1.Utils.BigNumber.make(transaction.nonce);
            wallet.balance = wallet.balance.minus(transaction.amount).minus(transaction.fee);
        }
    }
    verifyWalletsConsistency() {
        const logNegativeBalance = (wallet, type, balance) => this.logger.warning(`Wallet ${wallet.address} has a negative ${type} of '${balance}'`);
        const genesisPublicKeys = crypto_1.Managers.configManager
            .get("genesisBlock.transactions")
            .reduce((acc, curr) => Object.assign(acc, { [curr.senderPublicKey]: true }), {});
        for (const wallet of this.walletRepository.allByAddress()) {
            if (wallet.balance.isLessThan(0) &&
                (wallet.publicKey === undefined || !genesisPublicKeys[wallet.publicKey])) {
                // Senders of whitelisted transactions that result in a negative balance,
                // also need to be special treated during bootstrap. Therefore, specific
                // senderPublicKey/nonce pairs are allowed to be negative.
                // Example:
                //          https://explorer.ark.io/transaction/608c7aeba0895da4517496590896eb325a0b5d367e1b186b1c07d7651a568b9e
                //          Results in a negative balance (-2 ARK) from height 93478 to 187315
                const negativeBalanceExceptions = this.configRepository.get("crypto.exceptions.negativeBalances", {});
                const whitelistedNegativeBalances = wallet.publicKey
                    ? negativeBalanceExceptions[wallet.publicKey]
                    : undefined;
                if (!whitelistedNegativeBalances) {
                    logNegativeBalance(wallet, "balance", wallet.balance);
                    throw new Error("Non-genesis wallet with negative balance.");
                }
                const allowedNegativeBalance = wallet.balance.isEqualTo(whitelistedNegativeBalances[wallet.nonce.toString()]);
                if (!allowedNegativeBalance) {
                    logNegativeBalance(wallet, "balance", wallet.balance);
                    throw new Error("Non-genesis wallet with negative balance.");
                }
            }
            if (wallet.hasAttribute("delegate.voteBalance")) {
                const voteBalance = wallet.getAttribute("delegate.voteBalance");
                if (voteBalance.isLessThan(0)) {
                    logNegativeBalance(wallet, "vote balance", voteBalance);
                    throw new Error("Wallet with negative vote balance.");
                }
            }
        }
    }
};
__decorate([
    core_kernel_1.Container.inject(core_kernel_1.Container.Identifiers.Application),
    __metadata("design:type", core_kernel_1.Application)
], StateBuilder.prototype, "app", void 0);
__decorate([
    core_kernel_1.Container.inject(core_kernel_1.Container.Identifiers.DatabaseBlockRepository),
    __metadata("design:type", core_database_1.Repositories.BlockRepository)
], StateBuilder.prototype, "blockRepository", void 0);
__decorate([
    core_kernel_1.Container.inject(core_kernel_1.Container.Identifiers.DatabaseTransactionRepository),
    __metadata("design:type", core_database_1.Repositories.TransactionRepository)
], StateBuilder.prototype, "transactionRepository", void 0);
__decorate([
    core_kernel_1.Container.inject(core_kernel_1.Container.Identifiers.WalletRepository),
    core_kernel_1.Container.tagged("state", "blockchain"),
    __metadata("design:type", Object)
], StateBuilder.prototype, "walletRepository", void 0);
__decorate([
    core_kernel_1.Container.inject(core_kernel_1.Container.Identifiers.DposState),
    core_kernel_1.Container.tagged("state", "blockchain"),
    __metadata("design:type", Object)
], StateBuilder.prototype, "dposState", void 0);
__decorate([
    core_kernel_1.Container.inject(core_kernel_1.Container.Identifiers.EventDispatcherService),
    __metadata("design:type", Object)
], StateBuilder.prototype, "events", void 0);
__decorate([
    core_kernel_1.Container.inject(core_kernel_1.Container.Identifiers.LogService),
    __metadata("design:type", Object)
], StateBuilder.prototype, "logger", void 0);
__decorate([
    core_kernel_1.Container.inject(core_kernel_1.Container.Identifiers.ConfigRepository),
    __metadata("design:type", core_kernel_1.Services.Config.ConfigRepository)
], StateBuilder.prototype, "configRepository", void 0);
StateBuilder = __decorate([
    core_kernel_1.Container.injectable()
], StateBuilder);
exports.StateBuilder = StateBuilder;
//# sourceMappingURL=state-builder.js.map