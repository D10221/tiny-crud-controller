import { RequestHandler } from "express";
/**
   * ensure
   */
export default function ensureId(newid?: () => any): RequestHandler {
    return (req, _res, next) => {
        try {
            const { params, body } = req;
            if (!req.body) {
                return next(Object.assign(new Error("Bad Request, body required"), { ode: 400 }));
            }
            let id = (params || {}).id
            id = id || (body || {}).id;
            id = id || (newid && newid()) || undefined;
            if (!id) {
                return next(new Error("Id required!"));
            }
            /** */
            Object.assign(req.body, { id, });
            return next();
        } catch (error) {
            return next(error);
        }
    }
}