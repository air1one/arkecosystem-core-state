import { Container, Contracts, Providers } from "@arkecosystem/core-kernel";
import { Interfaces } from "@arkecosystem/crypto";
import { DposPreviousRoundState } from "./dpos";
export declare const dposPreviousRoundStateProvider: (context: Container.interfaces.Context) => (blocks: Interfaces.IBlock[], roundInfo: Contracts.Shared.RoundInfo) => Promise<Contracts.State.DposPreviousRoundState>;
export declare class ServiceProvider extends Providers.ServiceProvider {
    register(): Promise<void>;
    boot(): Promise<void>;
    bootWhen(serviceProvider?: string): Promise<boolean>;
    private registerActions;
}
