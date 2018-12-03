import { Router } from "express";
import uuid from "uuid";
import CrudController, {
  ensureBody,
  ensureID,
  validate,
} from "@australis/tiny-crud-controller";
import Store from "@australis/tiny-crud-controller-store-level";
import { Thing } from "./types";

const route = `/:id?`;

export default (db: any) => {
  
  const store = Store("things")(db, {
    map: {
      out: (key, value) => ({ id: key, ...value }),
      in: (x: any) => {
        // ... 
        return {
          ...x
        }
      }
    }
  });

  const crud = CrudController(store);

  const router = Router();
  /** READ/GET */
  router.get(route, crud.find()((_id, data) => data));

  /** ADD/PUT*/
  router.put(route, [
    /*extra-middleware*/
    ensureBody<Thing>(["name"]),
    ensureID(uuid),
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
    crud.remove()(() => "ok"),
  ]);

  return router;
};
