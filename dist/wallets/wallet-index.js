"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletIndex = void 0;
class WalletIndex {
    constructor(indexer) {
        this.indexer = indexer;
        this.walletIndex = {};
    }
    entries() {
        return Object.entries(this.walletIndex);
    }
    keys() {
        return Object.keys(this.walletIndex);
    }
    values() {
        return Object.values(this.walletIndex);
    }
    index(wallet) {
        this.indexer(this, wallet);
    }
    has(key) {
        return !!this.walletIndex[key];
    }
    get(key) {
        return this.walletIndex[key];
    }
    set(key, wallet) {
        this.walletIndex[key] = wallet;
    }
    forget(key) {
        delete this.walletIndex[key];
    }
    clear() {
        this.walletIndex = {};
    }
    clone() {
        const walletIndex = new WalletIndex(this.indexer);
        for (const [key, value] of Object.entries(this.walletIndex)) {
            walletIndex.set(key, value.clone());
        }
        return walletIndex;
    }
}
exports.WalletIndex = WalletIndex;
//# sourceMappingURL=wallet-index.js.map