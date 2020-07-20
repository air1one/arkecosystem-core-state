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
exports.WalletRepositoryClone = void 0;
const core_kernel_1 = require("@arkecosystem/core-kernel");
const wallet_repository_1 = require("./wallet-repository");
let WalletRepositoryClone = class WalletRepositoryClone extends wallet_repository_1.WalletRepository {
    initialize() {
        for (const index of this.blockchainWalletRepository.getIndexNames()) {
            this.indexes[index] = this.blockchainWalletRepository.getIndex(index).clone();
        }
    }
    index(wallet) {
        super.index(wallet.clone());
    }
};
__decorate([
    core_kernel_1.Container.inject(core_kernel_1.Container.Identifiers.WalletRepository),
    core_kernel_1.Container.tagged("state", "blockchain"),
    __metadata("design:type", Object)
], WalletRepositoryClone.prototype, "blockchainWalletRepository", void 0);
__decorate([
    core_kernel_1.Container.postConstruct(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WalletRepositoryClone.prototype, "initialize", null);
WalletRepositoryClone = __decorate([
    core_kernel_1.Container.injectable()
], WalletRepositoryClone);
exports.WalletRepositoryClone = WalletRepositoryClone;
//# sourceMappingURL=wallet-repository-clone.js.map