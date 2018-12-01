"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 */
function default_1(validate) {
    /**
     *
     */
    return async (req, _res, next) => {
        try {
            const validation = await validate(req);
            if (validation && validation.length > 0) {
                return next(new Error(validation.join(", ")));
            }
            return next();
        }
        catch (error) {
            return next(error);
        }
    };
}
exports.default = default_1;
//# sourceMappingURL=validate.js.map