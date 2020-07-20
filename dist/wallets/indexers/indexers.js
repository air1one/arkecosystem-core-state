"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ipfsIndexer = exports.locksIndexer = exports.resignationsIndexer = exports.usernamesIndexer = exports.publicKeysIndexer = exports.addressesIndexer = void 0;
exports.addressesIndexer = (index, wallet) => {
    if (wallet.address) {
        index.set(wallet.address, wallet);
    }
};
exports.publicKeysIndexer = (index, wallet) => {
    if (wallet.publicKey) {
        index.set(wallet.publicKey, wallet);
    }
};
exports.usernamesIndexer = (index, wallet) => {
    if (wallet.isDelegate()) {
        index.set(wallet.getAttribute("delegate.username"), wallet);
    }
};
exports.resignationsIndexer = (index, wallet) => {
    if (wallet.isDelegate() && wallet.hasAttribute("delegate.resigned")) {
        index.set(wallet.getAttribute("delegate.username"), wallet);
    }
};
exports.locksIndexer = (index, wallet) => {
    if (wallet.hasAttribute("htlc.locks")) {
        const locks = wallet.getAttribute("htlc.locks");
        for (const lockId of Object.keys(locks)) {
            index.set(lockId, wallet);
        }
    }
};
exports.ipfsIndexer = (index, wallet) => {
    if (wallet.hasAttribute("ipfs.hashes")) {
        const hashes = wallet.getAttribute("ipfs.hashes");
        for (const hash of Object.keys(hashes)) {
            index.set(hash, wallet);
        }
    }
};
//# sourceMappingURL=indexers.js.map