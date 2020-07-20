"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerFactories = exports.registerIndexers = void 0;
const core_kernel_1 = require("@arkecosystem/core-kernel");
const wallet_1 = require("../wallet");
const indexers_1 = require("./indexers");
exports.registerIndexers = (app) => {
    app.bind(core_kernel_1.Container.Identifiers.WalletRepositoryIndexerIndex).toConstantValue({
        name: core_kernel_1.Contracts.State.WalletIndexes.Addresses,
        indexer: indexers_1.addressesIndexer,
    });
    app.bind(core_kernel_1.Container.Identifiers.WalletRepositoryIndexerIndex).toConstantValue({
        name: core_kernel_1.Contracts.State.WalletIndexes.PublicKeys,
        indexer: indexers_1.publicKeysIndexer,
    });
    app.bind(core_kernel_1.Container.Identifiers.WalletRepositoryIndexerIndex).toConstantValue({
        name: core_kernel_1.Contracts.State.WalletIndexes.Usernames,
        indexer: indexers_1.usernamesIndexer,
    });
    app.bind(core_kernel_1.Container.Identifiers.WalletRepositoryIndexerIndex).toConstantValue({
        name: core_kernel_1.Contracts.State.WalletIndexes.Resignations,
        indexer: indexers_1.resignationsIndexer,
    });
    app.bind(core_kernel_1.Container.Identifiers.WalletRepositoryIndexerIndex).toConstantValue({
        name: core_kernel_1.Contracts.State.WalletIndexes.Locks,
        indexer: indexers_1.locksIndexer,
    });
    app.bind(core_kernel_1.Container.Identifiers.WalletRepositoryIndexerIndex).toConstantValue({
        name: core_kernel_1.Contracts.State.WalletIndexes.Ipfs,
        indexer: indexers_1.ipfsIndexer,
    });
};
exports.registerFactories = (app) => {
    if (!app.isBound(core_kernel_1.Container.Identifiers.WalletFactory)) {
        app.bind(core_kernel_1.Container.Identifiers.WalletFactory).toFactory((context) => (address) => new wallet_1.Wallet(address, new core_kernel_1.Services.Attributes.AttributeMap(context.container.get(core_kernel_1.Container.Identifiers.WalletAttributes))));
    }
};
//# sourceMappingURL=wallet-indexes.js.map