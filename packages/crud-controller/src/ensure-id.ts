import { RequestHandler } from "express";
/**
   * ensure
   */
export default function ensureId(newid?: () => any): RequestHandler {
    return (req, _res, next) => {
        try {
            const { params, body, query } = req;     
            let id = (query && query.id) || (params && params.id) || (body && body.id) || newid && newid();      
            if (!id) {
                return next(new Error("Id required!"));
            }
            /** */
            Object.assign(req.body||{}, { id, });
            return next();
        } catch (error) {
            return next(error);
        }
    }
}