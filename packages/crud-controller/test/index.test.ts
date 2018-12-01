import { json } from "body-parser";
import express, { RequestHandler } from "express";
import { join } from "path";
import uuid from "uuid";
import CrudController, { ensureBody, ensureID, validate } from "../src";
import AsyncMap from "@australis/tiny-crud-controller-store-asyncmap";
/**
 *
 */
describe(require(join(__dirname, "../package.json")).name, () => {
  it("May Work", () => {
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
      ensureBody<any, string>(["displayName", "name", "notes"]),
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
          req.body.userid = (req as any).user.id;
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
  });

  it("gets many", async () => {
    const crud = CrudController(new AsyncMap());
    const x = await testJsonHandler(crud.get())({
      // request
      params: {},
    });
    expect(x).toBe("[]");
  });

  it("gets one", async () => {
    const map = new AsyncMap();
    const crud = CrudController(map);
    const x = await testJsonHandler(crud.get())({
      // request
      params: { id: "abc" },
    });
    expect(x).toBe("null");
    map.map.set("abc", {} as any);
    expect(
      await testJsonHandler(crud.get())({
        // request
        params: { id: "abc" },
      }),
    ).toBe('{"id":"abc"}');
  });

  it("updates", async () => {
    const map = new AsyncMap();
    map.map.set("abc", {} as any);
    const crud = CrudController(map);
    expect(
      await testJsonHandler(crud.post())({
        // request
        body: { id: "abc", name: "x" },
      }),
    ).toBe('{"id":"abc","name":"x"}');
  });

  it("adds", async () => {
    const map = new AsyncMap();
    const crud = CrudController(map);
    expect(
      await testJsonHandler(crud.put())({
        // request
        body: { id: "abc", name: "x" },
      }),
    ).toBe('{"id":"abc","name":"x"}');
  });
  /**
   * Warning: testing AsyncMap instead of controller?
   */
  it("adds NOT", async () => {
    const map = new AsyncMap();
    map.map.set("abc", {});
    const crud = CrudController(map);
    const x: any = await testJsonHandler(crud.put())({
      // request
      body: { id: "abc", name: "x" },
    }).catch(e => e);
    expect(x).toBeInstanceOf(Error);
  });

  it("removes", async () => {
    const map = new AsyncMap();
    map.map.set("abc", {});
    const crud = CrudController(map);
    const x: any = await testJsonHandler(
      crud.dlete(req => [req.body.id, undefined], Boolean),
    )({
      // request
      body: { id: "abc" },
    }).catch(e => e);
    expect(x).toBe("true");
  });

  /**
   * Warning: testing AsyncMap instead of controller?
   */
  it("removes NOT", async () => {
    const map = new AsyncMap();
    const crud = CrudController(map);
    const x: any = await testJsonHandler(
      crud.dlete(req => [req.body.id, undefined], Boolean),
    )({
      // request
      body: { id: "abc" },
    }).catch(e => e);
    expect(x).toBeInstanceOf(Error);
  });

  const testJsonHandler = (handler: RequestHandler) => (req: any) =>
    new Promise<any>((resolve, reject) => {
      const res: any = {
        json: (x: any) => resolve(JSON.stringify(x)),
        status: (_statusCode?: any) => (x: any) => resolve(x),
        send: (x: any) => resolve(x),
      };

      const next = (e?: any) => {
        if (e) {
          reject(e);
        } else {
          resolve(null);
        }
      };
      handler(req, res, next);
    });
});
