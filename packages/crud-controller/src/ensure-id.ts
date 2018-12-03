import { RequestHandler } from "express";
const _validate = (id: any) => Boolean(id);
/**
 * ensure
 */
export default function ensureId(
  newid?: () => any,
  validate?: (id: any) => boolean,
): RequestHandler {
  return (req, _res, next) => {
    validate = validate || _validate;
    try {
      const { params, body, query } = req;
      let id =
        (query && query.id) ||
        (params && params.id) ||
        (body && body.id) ||
        (newid && newid());
      if (!validate(id)) {
        return next(new Error("Id required!"));
      }
      /** */
      Object.assign(req.body || {}, { id });
      return next();
    } catch (error) {
      return next(error);
    }
  };
}
