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
exports.DposPreviousRoundState = void 0;
const core_kernel_1 = require("@arkecosystem/core-kernel");
let DposPreviousRoundState = class DposPreviousRoundState {
    async revert(blocks, roundInfo) {
        for (const block of blocks.slice().reverse()) {
            if (block.data.height === 1) {
                break;
            }
            await this.blockState.revertBlock(block);
        }
        await this.app
            .get(core_kernel_1.Container.Identifiers.TriggerService)
            .call("buildDelegateRanking", { dposState: this.dposState });
        this.dposState.setDelegatesRound(roundInfo);
    }
    getAllDelegates() {
        return this.dposState.getAllDelegates();
    }
    getRoundDelegates() {
        return this.dposState.getRoundDelegates();
    }
};
__decorate([
    core_kernel_1.Container.inject(core_kernel_1.Container.Identifiers.Application),
    __metadata("design:type", Object)
], DposPreviousRoundState.prototype, "app", void 0);
__decorate([
    core_kernel_1.Container.inject(core_kernel_1.Container.Identifiers.BlockState),
    core_kernel_1.Container.tagged("state", "clone"),
    __metadata("design:type", Object)
], DposPreviousRoundState.prototype, "blockState", void 0);
__decorate([
    core_kernel_1.Container.inject(core_kernel_1.Container.Identifiers.DposState),
    core_kernel_1.Container.tagged("state", "clone"),
    __metadata("design:type", Object)
], DposPreviousRoundState.prototype, "dposState", void 0);
DposPreviousRoundState = __decorate([
    core_kernel_1.Container.injectable()
], DposPreviousRoundState);
exports.DposPreviousRoundState = DposPreviousRoundState;
//# sourceMappingURL=dpos-previous-round.js.map