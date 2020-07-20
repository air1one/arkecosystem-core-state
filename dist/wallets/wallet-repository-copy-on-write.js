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
exports.WalletRepositoryCopyOnWrite = void 0;
const core_kernel_1 = require("@arkecosystem/core-kernel");
const wallet_repository_1 = require("./wallet-repository");
// ! This isn't copy-on-write, but copy-on-read and with many asterisks.
// ! It only covers current pool use-cases.
// ! It should be replaced with proper implementation eventually.
let WalletRepositoryCopyOnWrite = class WalletRepositoryCopyOnWrite extends wallet_repository_1.WalletRepository {
    findByAddress(address) {
        if (address && !this.hasByAddress(address)) {
            const walletClone = this.blockchainWalletRepository.findByAddress(address).clone();
            this.index(walletClone);
        }
        return this.findByIndex(core_kernel_1.Contracts.State.WalletIndexes.Addresses, address);
    }
    hasByIndex(index, key) {
        if (super.hasByIndex(index, key)) {
            return true;
        }
        if (this.blockchainWalletRepository.hasByIndex(index, key) === false) {
            return false;
        }
        const walletClone = this.blockchainWalletRepository.findByIndex(index, key).clone();
        this.index(walletClone);
        return true;
    }
    allByUsername() {
        for (const wallet of this.blockchainWalletRepository.allByUsername()) {
            if (super.hasByAddress(wallet.address) === false) {
                this.index(wallet.clone());
            }
        }
        return super.allByUsername();
    }
};
__decorate([
    core_kernel_1.Container.inject(core_kernel_1.Container.Identifiers.WalletRepository),
    core_kernel_1.Container.tagged("state", "blockchain"),
    __metadata("design:type", Object)
], WalletRepositoryCopyOnWrite.prototype, "blockchainWalletRepository", void 0);
WalletRepositoryCopyOnWrite = __decorate([
    core_kernel_1.Container.injectable()
], WalletRepositoryCopyOnWrite);
exports.WalletRepositoryCopyOnWrite = WalletRepositoryCopyOnWrite;
//# sourceMappingURL=wallet-repository-copy-on-write.js.map