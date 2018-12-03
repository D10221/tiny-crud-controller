import AsyncMap from "@australis/tiny-crud-controller-store-asyncmap";
import { RequestHandler } from "express";
import { join } from "path";
import CrudController from "../src";
/**
 *
 */
describe(require(join(__dirname, "../package.json")).name, () => {

  it("gets many", async () => {
    const crud = CrudController(new AsyncMap());
    const x = await testJsonHandler(crud.find()())({
      // request
      params: {},
    });
    expect(x).toBe("[null,[]]");
  });

  it("gets one", async () => {
    const map = new AsyncMap();
    const crud = CrudController(map);
    const x = await testJsonHandler(crud.find()())({
      // request
      params: { id: "abc" },
    });
    expect(x).toBe('["abc",null]');
    map.map.set("abc", {} as any);
    expect(
      await testJsonHandler(crud.find()())({
        // request
        params: { id: "abc" },
      }),
    ).toBe('["abc",{}]');
  });

  it("updates", async () => {
    const map = new AsyncMap();
    map.map.set("abc", {} as any);
    const crud = CrudController(map);
    expect(
      await testJsonHandler(crud.update()())({
        // request
        body: { id: "abc", name: "x" },
      }),
    ).toBe('["abc",{"name":"x"}]');
  });

  it("adds", async () => {
    const map = new AsyncMap();
    const crud = CrudController(map);
    expect(
      await testJsonHandler(crud.add()())({
        // request
        body: { id: "abc", name: "x" },
      }),
    ).toBe('["abc",{"name":"x"}]');
  });
  /**
   * Warning: testing AsyncMap instead of controller?
   */
  it("adds NOT", async () => {
    const map = new AsyncMap();
    map.map.set("abc", {});
    const crud = CrudController(map);
    const x: any = await testJsonHandler(crud.add()())({
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
      crud.remove(req => [req.body.id, undefined])((id) => Boolean(id)),
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
      crud.remove(req => [req.body.id, undefined])((id) => Boolean(id)),
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
