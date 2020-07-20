import { Contracts } from "@arkecosystem/core-kernel";
export declare class DposState implements Contracts.State.DposState {
    private logger;
    private walletRepository;
    private roundInfo;
    private activeDelegates;
    private roundDelegates;
    getRoundInfo(): Contracts.Shared.RoundInfo;
    getAllDelegates(): readonly Contracts.State.Wallet[];
    getActiveDelegates(): readonly Contracts.State.Wallet[];
    getRoundDelegates(): readonly Contracts.State.Wallet[];
    buildVoteBalances(): void;
    buildDelegateRanking(): void;
    setDelegatesRound(roundInfo: Contracts.Shared.RoundInfo): void;
}
