import { Contracts } from "@arkecosystem/core-kernel";
import { Interfaces } from "@arkecosystem/crypto";
export declare class TransactionValidator implements Contracts.State.TransactionValidator {
    private readonly handlerRegistry;
    validate(transaction: Interfaces.ITransaction): Promise<void>;
}
