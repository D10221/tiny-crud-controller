"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 * @param req
 */
const getter = req => req.body || {};
/**
 *
 */
function RejectKeys(keys, get = getter) {
    /** */
    return function rejectKeys(req, _res, next) {
        for (const key of keys) {
            if (Object.keys(get(req)).indexOf(key) !== -1) {
                return next(new Error(`Key: ${key}: Not Allowed, readonly`));
            }
        }
        next();
    };
}
exports.default = RejectKeys;
//# sourceMappingURL=reject-keys.js.map