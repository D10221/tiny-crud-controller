import { Router } from "express";
import CrudController, {
  ensureBody,
  ensureID,
  validate,
} from "@australis/tiny-crud-controller";
import Store from "@australis/tiny-store-mongo";
import { Thing } from "./types";
import { Mongoose } from "mongoose";

const route = `/:id?`;

export default (db: Mongoose) => {
  const store = Store(
    db.model(
      "thing",
      new db.Schema(
        {
          _id: db.Schema.Types.ObjectId,
          name: {
            type: db.Schema.Types.String,
            unique: true,
          },
        },
        {
          collection: "things",
          timestamps: true,
        },
      ),
    ),
  );
  const crud = CrudController(store);

  const router = Router();
  /** READ/GET */
  router.get(route, crud.find()((...args) => args[1]));

  /** ADD/PUT*/
  router.put(route, [
    /*extra-middleware*/
    ensureBody<Thing>(["name"]),
    //
    ensureID(
      () => {
        return new db.Types.ObjectId().toHexString();
      },
      id => {
        return id && /^[a-f0-9]{24}$/.test(id);
      },
    ),
    validate(req => {
      const validation: string[] = [];
      if (!req.body.id) {
        validation.push("missing id");
      }
      return Promise.resolve(validation);
    }),
    crud.add()((id, data) => ({ id, ...data })),
  ]);

  /** UPDATE/POST */
  router.post(route, [
    ensureBody(),
    ensureID(), // reject missing id
    crud.update()((id, data) => data),
  ]);

  /** DELETE/REMOVE */
  router.delete(route, [
    /*extra-middleware*/
    ensureID(), // reject no id
    crud.remove()(() => "ok"),
  ]);

  return router;
};
