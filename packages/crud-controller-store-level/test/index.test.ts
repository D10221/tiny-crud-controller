import { existsSync, unlinkSync } from "fs";
import path from "path";
import levelStore, { jsonDb, memDb } from "../src";
import BasicTable from "../src/basic-table";
import { Store } from "../src/types";

interface Thing extends Object {
  name: string;
}

const dbPath = path.resolve(process.cwd(), "test-store.json");
if (existsSync(dbPath)) {
  unlinkSync(dbPath);
}
const db = jsonDb(dbPath);
const mdb = memDb(dbPath);

let store: Store<Thing>;
beforeAll(async () => {
  store = await levelStore<Thing>(db, "things");
});

describe(require("../package.json").name, () => {
  it("finds many", async () => {
    expect(await store.findMany()).toMatchObject([]);
  });

  it("throws not found", async () => {
    expect(await store.findOne("a").catch((error: any) => error.name)).toMatch(
      "NotFound",
    );
  });

  it("adds new, etc ...", async () => {
    await store.clear();
    expect(await store.add("a", { name: "aaa" })).toBe(undefined);
    // ...
    expect(await store.clear()).toBe(1);
    expect(await store.add("a", { name: "aaa" })).toBe(undefined);
    expect(await store.findOne("a")).toMatchObject({ name: "aaa" });
    expect(await store.remove("a")).toBe(undefined);
    expect(await store.findOne("a").catch(error => error.name)).toMatch(
      "NotFound",
    );
  });

  it("more stores", async () => {
    const store2 = await levelStore(jsonDb(dbPath), "moreThings");
    expect(await store.add("a", { name: "aaa" })).toBe(undefined);
    expect(await store2.add("a", { name: "aaa" })).toBe(undefined);
    expect(await store.add("a1", { name: "aaa1" })).toBe(undefined);
    expect(await store2.add("a1", { name: "aaa1" })).toBe(undefined);
    {
      const db = require(dbPath);
      expect(db[Object.keys(db)[0]]["things/a"]).toBe('{"name":"aaa"}');
      expect(db[Object.keys(db)[0]]["moreThings/a"]).toBe('{"name":"aaa"}');
    }
  });
});
//
describe("basic table", () => {
  it("?", async () => {
    const bt = BasicTable(store);
    await bt.add("x", { name: "x" });
    const x = await bt.findOne("x");
    //
    expect((x.createdAt as Date).getDate()).toBe(new Date().getDate());
    expect(x.id).toBe("x");
  });
});
//
describe("validate", () => {
  it("?", async () => {
    // 1089ms with memdown
    jest.setTimeout(60000);
    const s = await levelStore<Thing>(mdb, "things2", [
      { key: "name", required: true, unique: true },
    ]);
    for (let i = 0; i < 10000; i++) {
      await s.add(`indexed${i}`, { name: `x${i}` });
    }
    expect(await s.add("y", { name: null }).catch(err => err.message)).toBe(
      "name (Required)",
    );
    expect(
      await s.add("y1", { name: undefined }).catch(err => err.message),
    ).toBe("name (Required)");
    
    expect(await s.add("xxxx", { name: "x0" }).catch(error => error.message)).toBe(
      "name 'Must be unique'",
    );
  });
});
