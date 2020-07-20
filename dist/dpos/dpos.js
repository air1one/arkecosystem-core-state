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
exports.DposState = void 0;
const core_kernel_1 = require("@arkecosystem/core-kernel");
const crypto_1 = require("@arkecosystem/crypto");
let DposState = class DposState {
    constructor() {
        this.roundInfo = null;
        this.activeDelegates = [];
        this.roundDelegates = [];
    }
    getRoundInfo() {
        core_kernel_1.Utils.assert.defined(this.roundInfo);
        return this.roundInfo;
    }
    getAllDelegates() {
        return this.walletRepository.allByUsername();
    }
    getActiveDelegates() {
        return this.activeDelegates;
    }
    getRoundDelegates() {
        return this.roundDelegates;
    }
    // Only called during integrity verification on boot.
    buildVoteBalances() {
        for (const voter of this.walletRepository.allByPublicKey()) {
            if (voter.hasVoted()) {
                const delegate = this.walletRepository.findByPublicKey(voter.getAttribute("vote"));
                const voteBalance = delegate.getAttribute("delegate.voteBalance");
                const lockedBalance = voter.getAttribute("htlc.lockedBalance", crypto_1.Utils.BigNumber.ZERO);
                delegate.setAttribute("delegate.voteBalance", voteBalance.plus(voter.balance).plus(lockedBalance));
            }
        }
    }
    buildDelegateRanking() {
        this.activeDelegates = [];
        for (const delegate of this.walletRepository.allByUsername()) {
            if (delegate.hasAttribute("delegate.resigned")) {
                delegate.forgetAttribute("delegate.rank");
            }
            else {
                this.activeDelegates.push(delegate);
            }
        }
        this.activeDelegates.sort((a, b) => {
            const voteBalanceA = a.getAttribute("delegate.voteBalance");
            const voteBalanceB = b.getAttribute("delegate.voteBalance");
            const diff = voteBalanceB.comparedTo(voteBalanceA);
            if (diff === 0) {
                core_kernel_1.Utils.assert.defined(a.publicKey);
                core_kernel_1.Utils.assert.defined(b.publicKey);
                if (a.publicKey === b.publicKey) {
                    const username = a.getAttribute("delegate.username");
                    throw new Error(`The balance and public key of both delegates are identical! ` +
                        `Delegate "${username}" appears twice in the list.`);
                }
                return a.publicKey.localeCompare(b.publicKey, "en");
            }
            return diff;
        });
        for (let i = 0; i < this.activeDelegates.length; i++) {
            this.activeDelegates[i].setAttribute("delegate.rank", i + 1);
        }
    }
    setDelegatesRound(roundInfo) {
        if (this.activeDelegates.length < roundInfo.maxDelegates) {
            throw new Error(`Expected to find ${roundInfo.maxDelegates} delegates but only found ${this.activeDelegates.length}.` +
                `This indicates an issue with the genesis block & delegates.`);
        }
        this.roundInfo = roundInfo;
        this.roundDelegates = [];
        for (let i = 0; i < roundInfo.maxDelegates; i++) {
            this.activeDelegates[i].setAttribute("delegate.round", roundInfo.round);
            this.roundDelegates.push(this.activeDelegates[i]);
        }
        this.logger.debug(`Loaded ${roundInfo.maxDelegates} active ` + core_kernel_1.Utils.pluralize("delegate", roundInfo.maxDelegates));
    }
};
__decorate([
    core_kernel_1.Container.inject(core_kernel_1.Container.Identifiers.LogService),
    __metadata("design:type", Object)
], DposState.prototype, "logger", void 0);
__decorate([
    core_kernel_1.Container.inject(core_kernel_1.Container.Identifiers.WalletRepository),
    core_kernel_1.Container.tagged("state", "blockchain") // TODO: see todo in block-state
    ,
    __metadata("design:type", Object)
], DposState.prototype, "walletRepository", void 0);
DposState = __decorate([
    core_kernel_1.Container.injectable()
], DposState);
exports.DposState = DposState;
//# sourceMappingURL=dpos.js.map