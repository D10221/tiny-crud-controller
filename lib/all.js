"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (store) => {
    const out = [];
    store.forEach((value, key) => {
        out.push({
            key,
            ...value
        });
    });
    return out;
};
//# sourceMappingURL=all.js.map