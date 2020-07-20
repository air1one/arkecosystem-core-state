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
exports.WalletRepository = void 0;
const core_kernel_1 = require("@arkecosystem/core-kernel");
const crypto_1 = require("@arkecosystem/crypto");
const errors_1 = require("./errors");
const search_entries_1 = require("./utils/search-entries");
const wallet_index_1 = require("./wallet-index");
// todo: review the implementation
let WalletRepository = class WalletRepository {
    constructor() {
        this.indexes = {};
    }
    initialize() {
        for (const { name, indexer } of this.indexerIndexes) {
            if (this.indexes[name]) {
                throw new errors_1.WalletIndexAlreadyRegisteredError(name);
            }
            this.indexes[name] = new wallet_index_1.WalletIndex(indexer);
        }
    }
    createWallet(address) {
        return this.createWalletFactory(address);
    }
    getIndex(name) {
        if (!this.indexes[name]) {
            throw new errors_1.WalletIndexNotFoundError(name);
        }
        return this.indexes[name];
    }
    getIndexNames() {
        return Object.keys(this.indexes);
    }
    allByAddress() {
        return this.getIndex(core_kernel_1.Contracts.State.WalletIndexes.Addresses).values();
    }
    allByPublicKey() {
        return this.getIndex(core_kernel_1.Contracts.State.WalletIndexes.PublicKeys).values();
    }
    allByUsername() {
        return this.getIndex(core_kernel_1.Contracts.State.WalletIndexes.Usernames).values();
    }
    findByAddress(address) {
        const index = this.getIndex(core_kernel_1.Contracts.State.WalletIndexes.Addresses);
        if (address && !index.has(address)) {
            index.set(address, this.createWallet(address));
        }
        const wallet = index.get(address);
        core_kernel_1.Utils.assert.defined(wallet);
        return wallet;
    }
    findByPublicKey(publicKey) {
        const index = this.getIndex(core_kernel_1.Contracts.State.WalletIndexes.PublicKeys);
        if (publicKey && !index.has(publicKey)) {
            const wallet = this.findByAddress(crypto_1.Identities.Address.fromPublicKey(publicKey));
            wallet.publicKey = publicKey;
            index.set(publicKey, wallet);
        }
        const wallet = index.get(publicKey);
        core_kernel_1.Utils.assert.defined(wallet);
        return wallet;
    }
    findByUsername(username) {
        return this.findByIndex(core_kernel_1.Contracts.State.WalletIndexes.Usernames, username);
    }
    findByIndex(index, key) {
        if (!this.hasByIndex(index, key)) {
            throw new Error(`Wallet ${key} doesn't exist in index ${index}`);
        }
        return this.getIndex(index).get(key);
    }
    findByIndexes(indexes, key) {
        for (const index of indexes) {
            if (this.hasByIndex(index, key)) {
                return this.findByIndex(index, key);
            }
        }
        throw new Error(`Wallet ${key} doesn't exist in indexes ${indexes.join(", ")}`);
    }
    has(key) {
        return Object.values(this.indexes).some((index) => index.has(key));
    }
    hasByAddress(address) {
        return this.hasByIndex(core_kernel_1.Contracts.State.WalletIndexes.Addresses, address);
    }
    hasByPublicKey(publicKey) {
        return this.hasByIndex(core_kernel_1.Contracts.State.WalletIndexes.PublicKeys, publicKey);
    }
    hasByUsername(username) {
        return this.hasByIndex(core_kernel_1.Contracts.State.WalletIndexes.Usernames, username);
    }
    hasByIndex(indexName, key) {
        return this.getIndex(indexName).has(key);
    }
    getNonce(publicKey) {
        if (this.hasByPublicKey(publicKey)) {
            return this.findByPublicKey(publicKey).nonce;
        }
        return crypto_1.Utils.BigNumber.ZERO;
    }
    forgetByAddress(address) {
        this.forgetByIndex(core_kernel_1.Contracts.State.WalletIndexes.Addresses, address);
    }
    forgetByPublicKey(publicKey) {
        this.forgetByIndex(core_kernel_1.Contracts.State.WalletIndexes.PublicKeys, publicKey);
    }
    forgetByUsername(username) {
        this.forgetByIndex(core_kernel_1.Contracts.State.WalletIndexes.Usernames, username);
    }
    forgetByIndex(indexName, key) {
        const forgottenWallet = this.getIndex(indexName).get(key);
        for (const index of Object.values(this.indexes)) {
            for (const [name, wallet] of index.entries()) {
                if (wallet.publicKey === (forgottenWallet === null || forgottenWallet === void 0 ? void 0 : forgottenWallet.publicKey)) {
                    index.forget(name);
                }
            }
        }
        // TODO: check whether this line is still needed?
        this.getIndex(indexName).forget(key);
    }
    index(wallets) {
        if (!Array.isArray(wallets)) {
            this.indexWallet(wallets);
        }
        else {
            for (const wallet of wallets) {
                this.indexWallet(wallet);
            }
        }
    }
    reset() {
        for (const walletIndex of Object.values(this.indexes)) {
            walletIndex.clear();
        }
    }
    search(scope, params = {}) {
        let searchContext;
        switch (scope) {
            case core_kernel_1.Contracts.State.SearchScope.Wallets: {
                searchContext = this.searchWallets(params);
                break;
            }
            case core_kernel_1.Contracts.State.SearchScope.Delegates: {
                searchContext = this.searchDelegates(params);
                break;
            }
            case core_kernel_1.Contracts.State.SearchScope.Locks: {
                searchContext = this.searchLocks(params);
                break;
            }
            case core_kernel_1.Contracts.State.SearchScope.Entities: {
                searchContext = this.searchEntities(params);
                break;
            }
        }
        return search_entries_1.searchEntries(params, searchContext.query, searchContext.entries, searchContext.defaultOrder);
    }
    findByScope(scope, id) {
        switch (scope) {
            case core_kernel_1.Contracts.State.SearchScope.Wallets: {
                const indexes = [
                    core_kernel_1.Contracts.State.WalletIndexes.Usernames,
                    core_kernel_1.Contracts.State.WalletIndexes.Addresses,
                    core_kernel_1.Contracts.State.WalletIndexes.PublicKeys,
                ];
                return this.findByIndexes(indexes, id);
            }
            case core_kernel_1.Contracts.State.SearchScope.Delegates: {
                const indexes = [
                    core_kernel_1.Contracts.State.WalletIndexes.Usernames,
                    core_kernel_1.Contracts.State.WalletIndexes.Addresses,
                    core_kernel_1.Contracts.State.WalletIndexes.PublicKeys,
                ];
                const wallet = this.findByIndexes(indexes, id);
                if (wallet && wallet.isDelegate() === false) {
                    throw new Error(`Wallet ${id} isn't delegate`);
                }
                return wallet;
            }
            default:
                throw new Error(`Unknown scope ${scope.toString()}`);
        }
    }
    count(scope) {
        return this.search(scope, {}).count;
    }
    top(scope, params = {}) {
        return this.search(scope, { ...params, ...{ orderBy: "balance:desc" } });
    }
    indexWallet(wallet) {
        for (const walletIndex of Object.values(this.indexes)) {
            walletIndex.index(wallet);
        }
    }
    searchWallets(params) {
        const query = {
            exact: ["address", "publicKey", "secondPublicKey", "username", "vote"],
            between: ["balance", "voteBalance", "lockedBalance"],
        };
        if (params.addresses) {
            // Use the `in` filter instead of `exact` for the `address` field
            if (!params.address) {
                // @ts-ignore
                params.address = params.addresses;
                query.exact.shift();
                query.in = ["address"];
            }
            delete params.addresses;
        }
        return {
            query,
            entries: this.allByAddress(),
            defaultOrder: ["balance", "desc"],
        };
    }
    searchDelegates(params) {
        const query = {
            exact: ["address", "publicKey"],
            like: ["username"],
            between: ["approval", "forgedFees", "forgedRewards", "forgedTotal", "producedBlocks", "voteBalance"],
        };
        if (params.usernames) {
            if (!params.username) {
                params.username = params.usernames;
                query.like.shift();
                query.in = ["username"];
            }
            delete params.usernames;
        }
        let entries;
        switch (params.type) {
            case "resigned": {
                entries = this.getIndex(core_kernel_1.Contracts.State.WalletIndexes.Resignations).values();
                break;
            }
            case "never-forged": {
                entries = this.allByUsername().filter((delegate) => {
                    return delegate.getAttribute("delegate.producedBlocks") === 0;
                });
                break;
            }
            default: {
                entries = this.allByUsername();
                break;
            }
        }
        const manipulators = {
            approval: core_kernel_1.Utils.delegateCalculator.calculateApproval,
            forgedTotal: core_kernel_1.Utils.delegateCalculator.calculateForgedTotal,
        };
        if (core_kernel_1.Utils.hasSomeProperty(params, Object.keys(manipulators))) {
            entries = entries.map((delegate) => {
                for (const [prop, method] of Object.entries(manipulators)) {
                    if (params.hasOwnProperty(prop)) {
                        delegate.setAttribute(`delegate.${prop}`, method(delegate));
                    }
                }
                return delegate;
            });
        }
        return {
            query,
            entries,
            defaultOrder: ["rank", "asc"],
        };
    }
    searchLocks(params) {
        const query = {
            exact: [
                "expirationType",
                "isExpired",
                "lockId",
                "recipientId",
                "secretHash",
                "senderPublicKey",
                "vendorField",
            ],
            between: ["expirationValue", "amount", "timestamp"],
        };
        if (params.amount !== undefined) {
            params.amount = "" + params.amount;
        }
        const entries = this.getIndex(core_kernel_1.Contracts.State.WalletIndexes.Locks)
            .entries()
            .reduce((acc, [lockId, wallet]) => {
            const locks = wallet.getAttribute("htlc.locks");
            if (locks && locks[lockId]) {
                const lock = locks[lockId];
                core_kernel_1.Utils.assert.defined(lock.recipientId);
                core_kernel_1.Utils.assert.defined(wallet.publicKey);
                acc.push({
                    lockId,
                    amount: lock.amount,
                    secretHash: lock.secretHash,
                    senderPublicKey: wallet.publicKey,
                    recipientId: lock.recipientId,
                    timestamp: lock.timestamp,
                    expirationType: lock.expiration.type,
                    expirationValue: lock.expiration.value,
                    isExpired: core_kernel_1.Utils.expirationCalculator.calculateLockExpirationStatus(this.stateStore.getLastBlock(), lock.expiration),
                    vendorField: lock.vendorField,
                });
            }
            return acc;
        }, []);
        return {
            query,
            entries,
            defaultOrder: ["lockId", "asc"],
        };
    }
    searchEntities(params) {
        const query = {
            exact: ["id", "isResigned", "publicKey", "type", "subType"],
            like: ["name"],
        };
        const entries = this.getIndex("entities")
            .entries()
            .reduce((acc, [id, wallet]) => {
            const entities = wallet.getAttribute("entities", {});
            if (entities && entities[id]) {
                const entity = entities[id];
                acc.push({
                    id,
                    publicKey: wallet.publicKey,
                    address: wallet.address,
                    ...entity,
                    isResigned: !!entity.resigned,
                });
            }
            return acc;
        }, []);
        return {
            query,
            entries,
            defaultOrder: ["name", "asc"],
        };
    }
};
__decorate([
    core_kernel_1.Container.multiInject(core_kernel_1.Container.Identifiers.WalletRepositoryIndexerIndex),
    __metadata("design:type", Array)
], WalletRepository.prototype, "indexerIndexes", void 0);
__decorate([
    core_kernel_1.Container.inject(core_kernel_1.Container.Identifiers.WalletFactory),
    __metadata("design:type", Function)
], WalletRepository.prototype, "createWalletFactory", void 0);
__decorate([
    core_kernel_1.Container.inject(core_kernel_1.Container.Identifiers.StateStore),
    __metadata("design:type", Object)
], WalletRepository.prototype, "stateStore", void 0);
__decorate([
    core_kernel_1.Container.postConstruct(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WalletRepository.prototype, "initialize", null);
WalletRepository = __decorate([
    core_kernel_1.Container.injectable()
], WalletRepository);
exports.WalletRepository = WalletRepository;
//# sourceMappingURL=wallet-repository.js.map