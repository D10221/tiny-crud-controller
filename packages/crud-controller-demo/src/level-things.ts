import { Router } from "express";
import CrudController, {
  ensureBody,
  ensureID,
  validate,
} from "@australis/tiny-crud-controller";
import Store, { mapOut } from "@australis/tiny-store-level";
import { Thing } from "./types";
import { randomBytes } from "crypto";

export default async (db: any) => {
  const store = mapOut(
    await Store<Thing>(db, "things", [
      { key: "name", notNull: true, unique: true },
    ]),
    r => ({ id: r[0], ...r[1] }), //include id in the 'thing'
  );

  const {add, find, findOne, findMany, update, remove } = CrudController(store);

  const router = Router();
  /** READ/GET */
  router.get(`/:id?`, find()((_id, data) => data));
  router.get(`/find/:id`, findOne()((_id, data) => data));
  router.get(`/list`, findMany()((_id, data) => data));
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
    remove()(),
  ]);

  return router;
};
