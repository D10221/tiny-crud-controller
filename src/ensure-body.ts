import { RequestHandler } from "express";
/**
   * ensure
   */
export default function ensureBody<Shape, TK extends keyof Shape & string>(expectedKeys?: TK[]): RequestHandler {
    return (req, _res, next) => {
        try {
            if (!req.body) {
                return next(Object.assign(new Error("Bad Request, body required"), { ode: 400 }));
            }
            if (Array.isArray(expectedKeys) && expectedKeys.length > 0) {
                const missing: string[] = [];
                for (const key of expectedKeys) {
                    if (Object.keys(req.body).indexOf(key) === -1) {
                        missing.push(key);
                    }
                }
                if (missing && missing.length > 0) {
                    return next(new Error("Expected: " + missing.join(", ")));
                }
            }
            return next();
        } catch (error) {
            return next(error);
        }
    }
}