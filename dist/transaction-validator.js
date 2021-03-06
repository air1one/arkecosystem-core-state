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
exports.TransactionValidator = void 0;
const core_kernel_1 = require("@arkecosystem/core-kernel");
const core_transactions_1 = require("@arkecosystem/core-transactions");
const crypto_1 = require("@arkecosystem/crypto");
const assert_1 = require("assert");
let TransactionValidator = class TransactionValidator {
    async validate(transaction) {
        const deserialized = crypto_1.Transactions.TransactionFactory.fromBytes(transaction.serialized);
        assert_1.strictEqual(transaction.id, deserialized.id);
        const handler = await this.handlerRegistry.getActivatedHandlerForData(transaction.data);
        await handler.apply(transaction);
    }
};
__decorate([
    core_kernel_1.Container.inject(core_kernel_1.Container.Identifiers.TransactionHandlerRegistry),
    core_kernel_1.Container.tagged("state", "clone"),
    __metadata("design:type", core_transactions_1.Handlers.Registry)
], TransactionValidator.prototype, "handlerRegistry", void 0);
TransactionValidator = __decorate([
    core_kernel_1.Container.injectable()
], TransactionValidator);
exports.TransactionValidator = TransactionValidator;
//# sourceMappingURL=transaction-validator.js.map