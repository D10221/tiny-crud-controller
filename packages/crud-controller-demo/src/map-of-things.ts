import { RequestHandler, Router } from "express";
import uuid from "uuid";
import {
  CrudController,
  ensureBody,
  ensureID,
  validate,
} from "@australis/tiny-crud-controller";
import AsyncMap from "@australis/tiny-crud-controller-store-asyncmap";
import { Thing } from "./types";

const crud = CrudController(new AsyncMap());
const route = `/:id?`;

export default () => {
  const router = Router();
  /** READ/GET */
  router.get(route, [/*extra-middleware*/ crud.get()]);

  /** ADD/PUT*/
  router.put(route, [
    /*extra-middleware*/
    ensureBody<Thing, keyof Thing>(["displayName", "name", "notes"]),
    ensureID(uuid),
    validate(req => {
      const validation: string[] = [];
      if (!req.body.id) {
        validation.push("missing id");
      }
      return Promise.resolve(validation);
    }),
    ((req, _res, next) => {
      // include user
      try {
        req.body.userid = (req as any).user && (req as any).user.id;
        return next();
      } catch (error) {
        return next(error);
      }
    }) as RequestHandler,
    crud.put(),
  ]);

  /** UPDATE/POST */
  router.post(route, [
    ensureBody(),
    ensureID(), // reject missing id
    crud.post(),
  ]);

  /** DELETE/REMOVE */
  router.delete(route, [
    /*extra-middleware*/
    ensureID(), // reject no id
    crud.dlete(),
  ]);

  return router;
};
