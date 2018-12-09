import AsyncMap from "@australis/tiny-store-asyncmap";
import { RequestHandler } from "express";
import { join } from "path";
import CrudController from "../src";
/**
 *
 */
describe(require(join(__dirname, "../package.json")).name, () => {
  it("finds One", async () => {
    const map = new AsyncMap();
    map.add("1", { x: 1 });
    const crud = CrudController(map);
    const x = await fakeRequest(
      crud.findOne()(
        //transform out
        (_, data) => data,
      ),
    )({
      // request
      query: { id: "1" },
    });
    expect(x).toBe('{"x":1}');
  });
  it("finds Many", async () => {
    const map = new AsyncMap();
    map.add("1", { x: 1 });
    const crud = CrudController(map);
    const handler = crud
      .findMany
      // transform in
      ()(
      (_, data) => data, // transform out
    );
    const x = await fakeRequest(handler, (x: any) => x)({
      // request
    });
    expect(x).toMatchObject([{ x: 1 }]);
  });
  it("gets many from find", async () => {
    const crud = CrudController(new AsyncMap());
    const x = await fakeRequest(crud.find()())({
      // request
      params: {},
    });
    expect(x).toBe("[null,[]]");
  });

  it("gets one from find", async () => {
    const map = new AsyncMap();
    const crud = CrudController(map);
    const x = await fakeRequest(crud.find()())({
      // request
      params: { id: "abc" },
    });
    expect(x).toBe('["abc",null]');
    map.map.set("abc", {} as any);
    expect(
      await fakeRequest(crud.find()())({
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
      await fakeRequest(crud.update()())({
        // request
        body: { id: "abc", name: "x" },
      }),
    ).toBe('["abc",{"name":"x"}]');
  });

  it("adds", async () => {
    const map = new AsyncMap();
    const crud = CrudController(map);
    expect(
      await fakeRequest(crud.add()())({
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
    const x: any = await fakeRequest(crud.add()())({
      // request
      body: { id: "abc", name: "x" },
    }).catch(e => e);
    expect(x).toBeInstanceOf(Error);
  });

  it("removes", async () => {
    const map = new AsyncMap();
    map.map.set("abc", {});
    const crud = CrudController(map);
    const x: any = await fakeRequest(
      crud.remove(req => [req.body.id, undefined])(id => Boolean(id)),
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
    const store = new AsyncMap();
    const crud = CrudController(store);
    const handler = crud.remove(req => [req.body.id, undefined])(id =>
      Boolean(id),
    );
    const x: any = await fakeRequest(handler)({
      // request
      body: { id: "abc" },
    }).catch(e => e);
    expect(x).toBeInstanceOf(Error);
  });
  it("pass parameters", async () => {
    const store: any = {
      findOne(id: any, ...args: any[]){
        return Promise.resolve([id, ...args])
      }
    };
    const crud = CrudController(store);
    const handler = crud.find()((_, data) => data);
    const x = await fakeRequest(handler, (x:any)=> x)({      
      params: { id: 1, x: 2, y:3 },
    }).catch(e => e);
    expect(x).toMatchObject([1, { x: 2, y:3 }])
  });

  it("receives params", async () => {
    const { default: fromAny } = await import("../src/from-any");
    expect(fromAny({} as any, {} as any)).toMatchObject([undefined, {}]);
    expect(
      fromAny(
        {
          //req
          params: { x: 1, id: 1 },
          query: { x: 2, id: 2 },
          body: { x: 3, id: 3 },
        } as any,
        {
          // res
          locals: { x: 4, id: 4 },
        } as any,
      ),
    ).toMatchObject([1, { x: 4 }]);
    expect(
      fromAny(
        {
          query: { x: 2, id: 2 },
          body: { x: 3, id: 3 },
        } as any, //req
        {} as any, // res
      ),
    ).toMatchObject([2, { x: 3 }]);
  });
});

const fakeRequest = (
  handler: RequestHandler,
  stringify = JSON.stringify.bind(JSON),
) => (req: any) =>
  new Promise<any>((resolve, reject) => {
    const res: any = {
      json: (x: any) => resolve(stringify(x)),
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
