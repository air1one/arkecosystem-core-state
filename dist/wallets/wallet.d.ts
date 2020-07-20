import { Contracts, Services } from "@arkecosystem/core-kernel";
import { Utils } from "@arkecosystem/crypto";
/**
 * @remarks
 * The Wallet should be (for the most part) treated as a DTO!
 * Other entites and services should be responsible for managing it's state and mutations.
 *
 * @export
 * @class Wallet
 */
export declare class Wallet implements Contracts.State.Wallet {
    readonly address: string;
    protected readonly attributes: Services.Attributes.AttributeMap;
    /**
     * @type {(string | undefined)}
     * @memberof Wallet
     */
    publicKey: string | undefined;
    /**
     * @type {Utils.BigNumber}
     * @memberof Wallet
     */
    balance: Utils.BigNumber;
    /**
     * @type {Utils.BigNumber}
     * @memberof Wallet
     */
    nonce: Utils.BigNumber;
    /**
     * @param {string} address
     * @memberof Wallet
     */
    constructor(address: string, attributes: Services.Attributes.AttributeMap);
    /**
     * @returns
     * @memberof Wallet
     */
    getAttributes(): object;
    /**
     * @template T
     * @param {string} key
     * @param {T} [defaultValue]
     * @returns {T}
     * @memberof Wallet
     */
    getAttribute<T>(key: string, defaultValue?: T): T;
    /**
     * @template T
     * @param {string} key
     * @param {T} value
     * @returns {boolean}
     * @memberof Wallet
     */
    setAttribute<T = any>(key: string, value: T): boolean;
    /**
     * @param {string} key
     * @returns {boolean}
     * @memberof Wallet
     */
    forgetAttribute(key: string): boolean;
    /**
     * @param {string} key
     * @returns {boolean}
     * @memberof Wallet
     */
    hasAttribute(key: string): boolean;
    /**
     * @returns {boolean}
     * @memberof Wallet
     */
    isDelegate(): boolean;
    /**
     * @returns {boolean}
     * @memberof Wallet
     */
    hasVoted(): boolean;
    /**
     * @returns {boolean}
     * @memberof Wallet
     */
    hasSecondSignature(): boolean;
    /**
     * @returns {boolean}
     * @memberof Wallet
     */
    hasMultiSignature(): boolean;
    /**
     * @returns {Contracts.State.Wallet}
     * @memberof Wallet
     */
    clone(): Contracts.State.Wallet;
}
