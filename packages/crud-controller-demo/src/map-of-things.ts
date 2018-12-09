import { Router } from "express";
import CrudController, {
  ensureBody,
  ensureID,
  validate,
} from "@australis/tiny-crud-controller";
import AsyncMap from "@australis/tiny-store-asyncmap";
import { Thing } from "./types";
import { randomBytes } from "crypto";

export default () => {
  const { add, find, findMany, findOne, remove, update } = CrudController(
    new AsyncMap(),
  );
  const router = Router();
  /** READ/GET */
  router.get(`/find/:id?`, findOne()((_id, data) => data));
  router.get(`/list`, findMany()((_id, data) => data));
  router.get(`/:id?`, find()((_id, data) => data));

  /** ADD/PUT*/
  router.put(`/:id?`, [
    /*extra-middleware*/
    ensureBody<Thing>(["name"]),
    ensureID(() => randomBytes(16).toString("hex")),
    validate(req => {
      const validation: string[] = [];
      if (!req.body.id) {
        validation.push("missing id");
      }
      return Promise.resolve(validation);
    }),
    add()(id => id),
  ]);

  /** UPDATE/POST */
  router.post(`/:id?`, [
    ensureBody(),
    ensureID(), // reject missing id
    update()((_id, data) => data),
  ]);

  /** DELETE/REMOVE */
  router.delete(`/:id?`, [
    /*extra-middleware*/
    ensureID(), // reject no id
    remove()(() => "ok"),
  ]);

  return router;
};
