import { RequestHandler } from "express";
import { Validate } from "./types";
/**
 * 
 */
export default function (validate: Validate): RequestHandler {
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
        } catch (error) {
            return next(error);
        }
    }
}