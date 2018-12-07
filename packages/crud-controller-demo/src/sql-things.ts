// import { RequestHandler, Router } from "express";
// import uuid from "uuid";
// import CrudController, {
//   ensureBody,
//   ensureID,
//   validate,
// } from "@australis/tiny-crud-controller";
// import Store from "@australis/tiny-store-mssql";
// import { Thing } from "./types";

// const script = `/* Things */
// if not exists(select name from sys.tables where name = 'things')
// create table things (
//     id varchar(1024) NOT NULL UNIQUE default NEWID(),
//     name varchar(max) NOT NULL,
//     enabled bit not null default 0,
//     createdAt DATETIME NOT NULL default GETDATE(),
//     updatedAt DATETIME NOT NULL default GETDATE()
// );`;
// const store = Store("things", script);
// const crud = CrudController(store);
// const route = `/:id?`;

// export default async () => {
//   await store.init();
//   const router = Router();
//   /** READ/GET */
//   router.get(route, [/*extra-middleware*/ crud.find()((_, data) => data)]);

//   /** ADD/PUT*/
//   router.put(route, [
//     /*extra-middleware*/
//     ensureBody<Thing>(["name"]),
//     ensureID(uuid),
//     validate(req => {
//       const validation: string[] = [];
//       if (!req.body.id) {
//         validation.push("missing id");
//       }
//       return Promise.resolve(validation);
//     }),
//     crud.add()((id, data) => ({ id, ...data })),
//   ]);

//   /** UPDATE/POST */
//   router.post(route, [
//     ensureBody(),
//     ensureID(), // reject missing id
//     crud.update()((_id, data) => data),
//   ]);

//   /** DELETE/REMOVE */
//   router.delete(route, [
//     /*extra-middleware*/
//     ensureID(), // reject no id
//     crud.remove()(() => "ok"),
//   ]);

//   return router;
// };
