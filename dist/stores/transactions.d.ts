import { Utils } from "@arkecosystem/core-kernel";
import { Interfaces } from "@arkecosystem/crypto";
export declare class TransactionStore extends Utils.CappedMap<string, Interfaces.ITransactionData> {
    push(value: Interfaces.ITransactionData): void;
}
