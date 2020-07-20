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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockStore = void 0;
const core_kernel_1 = require("@arkecosystem/core-kernel");
const assert_1 = __importDefault(require("assert"));
// todo: review its implementation and finally integrate it as planned in v2
let BlockStore = class BlockStore {
    constructor(maxSize) {
        this.byId = new core_kernel_1.Utils.CappedMap(maxSize);
        this.byHeight = new core_kernel_1.Utils.CappedMap(maxSize);
    }
    get(key) {
        return typeof key === "string" ? this.byId.get(key) : this.byHeight.get(key);
    }
    set(value) {
        const lastBlock = this.last();
        if (value.data.height !== 1) {
            core_kernel_1.Utils.assert.defined(lastBlock);
        }
        assert_1.default.strictEqual(value.data.height, lastBlock ? lastBlock.data.height + 1 : 1);
        core_kernel_1.Utils.assert.defined(value.data.id);
        this.byId.set(value.data.id, value.data);
        this.byHeight.set(value.data.height, value.data);
        this.lastBlock = value;
    }
    has(value) {
        core_kernel_1.Utils.assert.defined(value.id);
        return this.byId.has(value.id) || this.byHeight.has(value.height);
    }
    delete(value) {
        core_kernel_1.Utils.assert.defined(value.id);
        this.byId.delete(value.id);
        this.byHeight.delete(value.height);
    }
    clear() {
        this.byId.clear();
        this.byHeight.clear();
    }
    resize(maxSize) {
        this.byId.resize(maxSize);
        this.byHeight.resize(maxSize);
    }
    last() {
        return this.lastBlock;
    }
    values() {
        return this.byId.values();
    }
    count() {
        return this.byId.count();
    }
    getIds() {
        return this.byId.keys();
    }
    getHeights() {
        return this.byHeight.keys();
    }
};
BlockStore = __decorate([
    core_kernel_1.Container.injectable(),
    __metadata("design:paramtypes", [Number])
], BlockStore);
exports.BlockStore = BlockStore;
//# sourceMappingURL=blocks.js.map