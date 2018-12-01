import { RequestHandler, Router } from "express";
import uuid from "uuid";
import CrudController, {
  ensureBody,
  ensureID,
  validate,
} from "@australis/tiny-crud-controller";
import Store from "@australis/tiny-crud-controller-store-mongo";
import { Thing } from "./types";
import { Mongoose } from "mongoose";

const route = `/:id?`;

export default (db: Mongoose) => {
  const store = Store(
    db.model(
      "things",
      new db.Schema(
        {
          id: db.Schema.Types.ObjectId,
          name: db.Schema.Types.String,
        },
        {
          timestamps: true,
        },
      ),
    ),
  );
  const crud = CrudController(store);

  const router = Router();
  /** READ/GET */
  router.get(route, [/*extra-middleware*/ crud.get()]);

  /** ADD/PUT*/
  router.put(route, [
    /*extra-middleware*/
    ensureBody<Thing, keyof Thing>(["name"]),
    ensureID(uuid),
    validate(req => {
      const validation: string[] = [];
      if (!req.body.id) {
        validation.push("missing id");
      }
      return Promise.resolve(validation);
    }),
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
