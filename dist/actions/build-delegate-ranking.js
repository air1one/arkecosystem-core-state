"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildDelegateRankingAction = void 0;
const core_kernel_1 = require("@arkecosystem/core-kernel");
class BuildDelegateRankingAction extends core_kernel_1.Services.Triggers.Action {
    async execute(args) {
        const dposState = args.dposState;
        return dposState.buildDelegateRanking();
    }
}
exports.BuildDelegateRankingAction = BuildDelegateRankingAction;
//# sourceMappingURL=build-delegate-ranking.js.map