"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionStore = void 0;
const core_kernel_1 = require("@arkecosystem/core-kernel");
// todo: review its implementation and finally integrate it as planned in v2
let TransactionStore = class TransactionStore extends core_kernel_1.Utils.CappedMap {
    push(value) {
        core_kernel_1.Utils.assert.defined(value.id);
        super.set(value.id, value);
    }
};
TransactionStore = __decorate([
    core_kernel_1.Container.injectable()
], TransactionStore);
exports.TransactionStore = TransactionStore;
//# sourceMappingURL=transactions.js.map