"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceProvider = exports.dposPreviousRoundStateProvider = void 0;
const core_kernel_1 = require("@arkecosystem/core-kernel");
const actions_1 = require("./actions");
const block_state_1 = require("./block-state");
const dpos_1 = require("./dpos");
const state_builder_1 = require("./state-builder");
const blocks_1 = require("./stores/blocks");
const state_1 = require("./stores/state");
const transactions_1 = require("./stores/transactions");
const transaction_validator_1 = require("./transaction-validator");
const wallets_1 = require("./wallets");
const indexers_1 = require("./wallets/indexers");
exports.dposPreviousRoundStateProvider = (context) => {
    return async (blocks, roundInfo) => {
        const previousRound = context.container.resolve(dpos_1.DposPreviousRoundState);
        await previousRound.revert(blocks, roundInfo);
        return previousRound;
    };
};
class ServiceProvider extends core_kernel_1.Providers.ServiceProvider {
    async register() {
        indexers_1.registerFactories(this.app);
        indexers_1.registerIndexers(this.app);
        this.app
            .bind(core_kernel_1.Container.Identifiers.WalletRepository)
            .to(wallets_1.WalletRepository)
            .inSingletonScope()
            .when(core_kernel_1.Container.Selectors.anyAncestorOrTargetTaggedFirst("state", "blockchain"));
        this.app
            .bind(core_kernel_1.Container.Identifiers.WalletRepository)
            .to(wallets_1.WalletRepositoryClone)
            .inRequestScope()
            .when(core_kernel_1.Container.Selectors.anyAncestorOrTargetTaggedFirst("state", "clone"));
        this.app
            .bind(core_kernel_1.Container.Identifiers.WalletRepository)
            .to(wallets_1.WalletRepositoryCopyOnWrite)
            .inRequestScope()
            .when(core_kernel_1.Container.Selectors.anyAncestorOrTargetTaggedFirst("state", "copy-on-write"));
        this.app.bind(core_kernel_1.Container.Identifiers.DposState).to(dpos_1.DposState);
        this.app.bind(core_kernel_1.Container.Identifiers.BlockState).to(block_state_1.BlockState);
        this.app.bind(core_kernel_1.Container.Identifiers.StateBlockStore).toConstantValue(new blocks_1.BlockStore(1000));
        this.app.bind(core_kernel_1.Container.Identifiers.StateTransactionStore).toConstantValue(new transactions_1.TransactionStore(1000));
        this.app.bind(core_kernel_1.Container.Identifiers.StateStore).to(state_1.StateStore).inSingletonScope();
        this.app
            .bind(core_kernel_1.Container.Identifiers.DposPreviousRoundStateProvider)
            .toProvider(exports.dposPreviousRoundStateProvider);
        this.app.bind(core_kernel_1.Container.Identifiers.TransactionValidator).to(transaction_validator_1.TransactionValidator);
        this.app
            .bind(core_kernel_1.Container.Identifiers.TransactionValidatorFactory)
            .toAutoFactory(core_kernel_1.Container.Identifiers.TransactionValidator);
        this.registerActions();
    }
    async boot() {
        await this.app.resolve(state_builder_1.StateBuilder).run();
    }
    async bootWhen(serviceProvider) {
        return serviceProvider === "@arkecosystem/core-database";
    }
    registerActions() {
        this.app
            .get(core_kernel_1.Container.Identifiers.TriggerService)
            .bind("buildDelegateRanking", new actions_1.BuildDelegateRankingAction());
    }
}
exports.ServiceProvider = ServiceProvider;
//# sourceMappingURL=service-provider.js.map