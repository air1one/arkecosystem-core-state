import { Contracts } from "@arkecosystem/core-kernel";
import { Interfaces } from "@arkecosystem/crypto";
export declare class DposPreviousRoundState implements Contracts.State.DposPreviousRoundState {
    private readonly app;
    private readonly blockState;
    private readonly dposState;
    revert(blocks: Interfaces.IBlock[], roundInfo: Contracts.Shared.RoundInfo): Promise<void>;
    getAllDelegates(): readonly Contracts.State.Wallet[];
    getRoundDelegates(): readonly Contracts.State.Wallet[];
}
