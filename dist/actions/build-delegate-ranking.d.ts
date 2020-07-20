import { Services } from "@arkecosystem/core-kernel";
import { ActionArguments } from "@arkecosystem/core-kernel/src/types";
export declare class BuildDelegateRankingAction extends Services.Triggers.Action {
    execute(args: ActionArguments): Promise<void>;
}
