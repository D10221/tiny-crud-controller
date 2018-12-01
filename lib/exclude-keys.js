"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 * @param data
 * @param keys
 */
function excludeKeys(...keys) {
    return (data) => Object.keys(data)
        .filter(key => keys.indexOf(key) === -1)
        .reduce((out, next) => {
        out[next] = data[next];
        return out;
    }, {});
}
exports.default = excludeKeys;
//# sourceMappingURL=exclude-keys.js.map