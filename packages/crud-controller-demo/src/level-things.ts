import { Router } from "express";
import CrudController, {
  ensureBody,
  ensureID,
  validate,
} from "@australis/tiny-crud-controller";
import Store, { mapOut } from "@australis/tiny-store-level";
import { Thing } from "./types";
import { randomBytes } from "crypto";

const route = `/:id?`;

export default async (db: any) => {

  const store = mapOut(
    await Store<Thing>(db, "things", [
      { key: "name", notNull: true, unique: true }
    ]),
    r => ({ id: r[0], ...r[1] }) //include id in the 'thing'
  );

  const crud = CrudController(store);

  const router = Router();
  /** READ/GET */
  router.get(route, crud.find()((_id, data) => data));

  /** ADD/PUT*/
  router.put(route, [
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
    crud.add()(id => id),
  ]);

  /** UPDATE/POST */
  router.post(route, [
    ensureBody(),
    ensureID(), // reject missing id
    crud.update()((_id, data) => data),
  ]);

  /** DELETE/REMOVE */
  router.delete(route, [
    /*extra-middleware*/
    ensureID(), // reject no id
    crud.remove()(),
  ]);

  return router;
};
