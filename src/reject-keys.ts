import { RequestHandler, Request } from "express";
export type Getter = (req: Request) => {};
/**
 *
 * @param req
 */
const getter: Getter = req => req.body || {};
/**
 *
 */
export default function RejectKeys(
  keys: string[],
  get: Getter = getter
): RequestHandler {
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
