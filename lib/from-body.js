"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function fromBody(req, _) {
    const { id, data } = req.body || { id: undefined, data: undefined };
    return [id, data];
}
exports.default = fromBody;
//# sourceMappingURL=from-body.js.map