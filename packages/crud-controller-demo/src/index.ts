import { json } from "body-parser";
import express, { RequestHandler } from "express";
import uuid from "uuid";
import {    
  CrudController,
  ensureBody,
  ensureID,
  validate,
} from "@australis/tiny-crud-controller";
import AsyncMap from "@australis/tiny-crud-controller-store-asyncmap";

/** */
interface Thing {
  /** generic */
  id: string;
  name: string;
  displayName: string;
  notes: string;
  /** generic */
  createdAt: number;
  /** generic */
  updatedAt: number;
  /** generic: owner/user id */
  userid: string;
}

const crud = CrudController(new AsyncMap());
const endpoint = "things";
const route = `/api/${endpoint}/:id?`;
// ...
const app = express();

/** READ/GET */
app.get(route, [/*extra-middleware*/ crud.get()]);

/** ADD/PUT*/
app.put(route, [
  /*extra-middleware*/
  json(),
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
app.post(route, [
  /*extra-middleware*/
  json(),
  ensureBody(),
  ensureID(), // reject missing id
  crud.post(),
]);

/** DELETE/REMOVE */
app.delete(route, [
  /*extra-middleware*/
  ensureBody(),
  ensureID(), // reject no id
  crud.dlete(),
]);

app.listen(5000, (err: any) => {
  if (err) {
      console.error(err);
      process.exit(-1);
  } else {
      console.log("listening %s", 5000);
  }
});
