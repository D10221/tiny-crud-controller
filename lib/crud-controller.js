"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const from_body_1 = __importDefault(require("./from-body"));
const all_1 = __importDefault(require("./all"));
const from_params_1 = __importDefault(require("./from-params"));
/**
 * TODO: paged
 */
function CrudController(store) {
    //
    const noClean = (x) => x;
    /**
     * READ/GET/LIST
     */
    const get = (payload = from_params_1.default, clean = noClean) => async (req, res, next) => {
        try {
            const [key] = payload(req, res);
            let data;
            if (key) {
                data = clean((await store.get(key)) || {});
            }
            else {
                data = ((await all_1.default(store)) || []).map(clean);
            }
            return res.json(data);
        }
        catch (error) {
            return next(error);
        }
    };
    /**
     * DELETE/REMOVE
     */
    const dlete = (clean = noClean) => async (req, res, next) => {
        try {
            clean = clean || noClean;
            const { id } = req.body;
            const data = await store.set(id, null);
            return res.json(clean(data));
        }
        catch (error) {
            return next(error);
        }
    };
    /**
     * Create, Add, Insert , NEW , PUT
     */
    const put = (payload = from_body_1.default, clean = noClean) => async (req, res, next) => {
        try {
            payload = payload || from_body_1.default;
            clean = clean || noClean;
            const [key, data] = payload(req, res);
            await store.set(key, data);
            const ret = await store.get(key);
            return res.json(clean(ret));
        }
        catch (error) {
            return next(error);
        }
    };
    /**
     * SET, Modify, update, POST
     */
    const post = (payload = from_body_1.default, clean = noClean) => async (req, res, next) => {
        try {
            payload = payload || from_body_1.default;
            clean = clean || noClean;
            const data = await store.set(...payload(req, res));
            return res.json(clean(data));
        }
        catch (error) {
            return next(error);
        }
    };
    return {
        put,
        get,
        dlete,
        post,
    };
}
exports.default = CrudController;
//# sourceMappingURL=crud-controller.js.map