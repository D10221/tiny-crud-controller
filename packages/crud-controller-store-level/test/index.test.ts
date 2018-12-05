import { existsSync, unlinkSync } from "fs";
import path from "path";
import levelStore, { memDb, jsonDb } from "../src";
import BasicTable from "../src/basic-table";
import { Store } from "../src/types";

interface Thing extends Object {
  name: string;
}

const dbPath = path.resolve(process.cwd(), "test-store.json");
if (existsSync(dbPath)) {
  unlinkSync(dbPath);
}


let db: any;
let store: Store<Thing>;
beforeEach(async () => {
  if (store) {
    await db.close();
    db = null;
  }
  db = memDb()
  store = await levelStore<Thing>(db, "things");
});

describe(require("../package.json").name, () => {
});
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
  const store2 = await levelStore(db, "moreThings");
  expect(await store.add("a", { name: "aaa" })).toBe(undefined);
  expect(await store2.add("a", { name: "aaa" })).toBe(undefined);
  expect(await store.add("a1", { name: "aaa1" })).toBe(undefined);
  expect(await store2.add("a1", { name: "aaa1" })).toBe(undefined);
});

it("persisted", async () => {
  const _s = (await levelStore(jsonDb(dbPath), "moreThings2"));
  const value = { name: "aaa" };
  expect(await _s.add("a", value)).toBe(undefined);
  const dbFile = require(dbPath);
  expect(dbFile["things/a"]).toBe(undefined);
  expect(dbFile["moreThings/a"]).toBe(undefined);
  expect(dbFile["moreThings2/a"]).toBe(JSON.stringify(value));
})
//
it("extends", async () => {
  const bt = BasicTable(store);
  await bt.add("x", { name: "x" });
  const x = await bt.findOne("x");
  //
  expect((x.createdAt as Date).getDate()).toBe(new Date().getDate());
  expect(x.id).toBe("x");
});

it("validates", async () => {
  // 1089ms with memdown
  jest.setTimeout(60000);
  const s = await levelStore<Thing>(jsonDb("testme-store.json"), "things2", [
    { key: "name", required: true, unique: true },
  ]);
  // 40.202s with jsonDown
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

it("10000", async () => {
  // 1089ms with memdown
  jest.setTimeout(60000);
  const s = await levelStore<Thing>(db, "things3");
  console.time("add:x10000");
  for (let i = 0; i < 10000; i++) {
    await s.add(`indexed${i}`, { name: `x${i}` });
  }
  console.timeEnd("add:x10000");
  console.time("get:x9999");
  expect((await s.findOne("indexed9")).name).toBe("x9");
  console.timeEnd("get:x9999");
  console.time("find:x10000");
  expect((await s.findMany()).length).toBe(10000);
  console.timeEnd("find:x10000");
});

