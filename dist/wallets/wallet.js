"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wallet = void 0;
const crypto_1 = require("@arkecosystem/crypto");
const utils_1 = require("@arkecosystem/utils");
/**
 * @remarks
 * The Wallet should be (for the most part) treated as a DTO!
 * Other entites and services should be responsible for managing it's state and mutations.
 *
 * @export
 * @class Wallet
 */
class Wallet {
    /**
     * @param {string} address
     * @memberof Wallet
     */
    constructor(address, attributes) {
        this.address = address;
        this.attributes = attributes;
        /**
         * @type {Utils.BigNumber}
         * @memberof Wallet
         */
        this.balance = crypto_1.Utils.BigNumber.ZERO;
        /**
         * @type {Utils.BigNumber}
         * @memberof Wallet
         */
        this.nonce = crypto_1.Utils.BigNumber.ZERO;
    }
    /**
     * @returns
     * @memberof Wallet
     */
    getAttributes() {
        return this.attributes.all();
    }
    /**
     * @template T
     * @param {string} key
     * @param {T} [defaultValue]
     * @returns {T}
     * @memberof Wallet
     */
    getAttribute(key, defaultValue) {
        return this.attributes.get(key, defaultValue);
    }
    /**
     * @template T
     * @param {string} key
     * @param {T} value
     * @returns {boolean}
     * @memberof Wallet
     */
    setAttribute(key, value) {
        return this.attributes.set(key, value);
    }
    /**
     * @param {string} key
     * @returns {boolean}
     * @memberof Wallet
     */
    forgetAttribute(key) {
        return this.attributes.forget(key);
    }
    /**
     * @param {string} key
     * @returns {boolean}
     * @memberof Wallet
     */
    hasAttribute(key) {
        return this.attributes.has(key);
    }
    /**
     * @returns {boolean}
     * @memberof Wallet
     */
    isDelegate() {
        return this.hasAttribute("delegate");
    }
    /**
     * @returns {boolean}
     * @memberof Wallet
     */
    hasVoted() {
        return this.hasAttribute("vote");
    }
    /**
     * @returns {boolean}
     * @memberof Wallet
     */
    hasSecondSignature() {
        return this.hasAttribute("secondPublicKey");
    }
    /**
     * @returns {boolean}
     * @memberof Wallet
     */
    hasMultiSignature() {
        return this.hasAttribute("multiSignature");
    }
    /**
     * @returns {Contracts.State.Wallet}
     * @memberof Wallet
     */
    clone() {
        return utils_1.cloneDeep(this);
    }
}
exports.Wallet = Wallet;
//# sourceMappingURL=wallet.js.map