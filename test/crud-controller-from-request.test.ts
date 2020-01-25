import { join } from "path";
import { crudController } from "../src";
import AsyncMap from "./asyncMap";
import fakeRequest from "./fakeRequest";
import { Request } from "express";
/**
 * Side Effect
 */
type Setup = (store: AsyncMap) => AsyncMap;

/**
 *
 * @param before sire effects before request, mimics previous middleware
 */
const request = (before: Setup) => {
  const map = new AsyncMap();
  return fakeRequest(before(map));
};
/** where to get the store from */
const getStoreFromRequest = (req: Request) => req.app.locals.store as AsyncMap;
/**
 *
 */
describe(require(join(__dirname, "../package.json")).name, () => {
  it("finds One", async () => {
    const crud = crudController(getStoreFromRequest);
    const x = await request(store => {
      // setup
      store.add("1", { x: 1 });
      return store;
    })(
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
    const crud = crudController(getStoreFromRequest);
    const handler = crud.findMany()(
      (_, data) => data, // transform out
    );
    const x = await request(store => {
      // setup request
      store.add("1", { x: 1 });
      return store;
    })(
      handler,
      (x: any) => x,
    )({
      // request
    });
    expect(x).toMatchObject([{ x: 1 }]);
  });
  it("gets many from find", async () => {
    const crud = crudController(getStoreFromRequest);
    const x = await request(store => store)(crud.find()())({
      // request
      params: {},
    });
    expect(x).toBe("[null,[]]");
  });

  it("gets one from find", async () => {
    const crud = crudController(getStoreFromRequest);
    const x = await request(store => {
      // setup request:
      return store;
    })(crud.find()())({
      // request
      params: { id: "abc" },
    });
    expect(x).toBe('["abc",null]');
    // ....
    expect(
      await request(store => {
        // setup request
        store.map.set("abc", {} as any);
        return store;
      })(crud.find()())({
        // request
        params: { id: "abc" },
      }),
    ).toBe('["abc",{}]');
  });

  it("updates", async () => {
    const crud = crudController(getStoreFromRequest);
    expect(
      await request(store => {
        // setup request
        store.map.set("abc", {} as any);
        return store;
      })(crud.update()())({
        // request
        body: { id: "abc", name: "x" },
      }),
    ).toBe('["abc",{"name":"x"}]');
  });

  it("adds", async () => {
    const crud = crudController(getStoreFromRequest);
    expect(
      await request(store => store)(crud.add()())({
        // request
        body: { id: "abc", name: "x" },
      }),
    ).toBe('["abc",{"name":"x"}]');
  });
  /**
   * Warning: testing AsyncMap instead of controller?
   */
  it("adds NOT", async () => {
    const crud = crudController(getStoreFromRequest);
    const x: any = await request(store => {
      store.map.set("abc", {});
      return store;
    })(crud.add()())({
      // request
      body: { id: "abc", name: "x" },
    }).catch(e => e);
    expect(x).toBeInstanceOf(Error);
  });

  it("removes", async () => {
    const crud = crudController(getStoreFromRequest);
    const x: any = await request(store => {
      // setup: 
      store.map.set("abc", {});
      return store;
    })(crud.remove(req => [req.body.id, undefined])(id => Boolean(id)))({
      // request
      body: { id: "abc" },
    }).catch(e => e);
    expect(x).toBe("true");
  });

  /**
   * Warning: testing AsyncMap instead of controller?
   */
  it("removes NOT", async () => {
    const crud = crudController(getStoreFromRequest);
    const handler = crud.remove(req => [req.body.id, undefined])(id =>
      Boolean(id),
    );
    const x: any = await request(store => store)(handler)({
      // request
      body: { id: "abc" },
    }).catch(e => e);
    expect(x).toBeInstanceOf(Error);
  });
  it("pass parameters", async () => {
    const store: any = {
      findOne(id: any, ...args: any[]) {
        return Promise.resolve([id, ...args]);
      },
    };
    const crud = crudController(_req => {
      return store;
    });
    const handler = crud.find()((_, data) => data);
    const x = await request(store => store)(
      handler,
      (x: any) => x,
    )({
      params: { id: "1", x: "2", y: "3" },
    }).catch(e => e);
    expect(x).toMatchObject(["1", { x: "2", y: "3" }]);
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
