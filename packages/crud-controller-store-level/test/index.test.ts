import { existsSync, unlinkSync } from "fs";
import path from "path";
import levelStore, { MemDb, JsonDb, LevelDB, basicTable } from "../src";
import BasicTable from "../src/basic-table";
import { Store } from "../src/types";
import rimraf from "rimraf";
import { SchemaError } from "../src/schema-error";

interface Thing extends Object {
  name: string;
}

const jsonDbPath = path.resolve(process.cwd(), "json-test-store.json");

let memDB: any;
let memStore: Store<Thing>;

if (existsSync(jsonDbPath)) {
  unlinkSync(jsonDbPath);
}
let jsonDB: any = JsonDb(jsonDbPath);
let leveldb: any;
const leveldbpath = "./testdb";
beforeAll(() => {
  rimraf.sync(leveldbpath);
  leveldb = LevelDB(leveldbpath);
});
beforeEach(async () => {
  if (memDB) {
    await memDB.close();
    memDB = null;
  }
  memDB = MemDb()
  memStore = await levelStore<Thing>(memDB, "things");
});

describe(require("../package.json").name, () => {
});
it("finds many", async () => {
  expect(await memStore.findMany()).toMatchObject([]);
});

it("throws not found", async () => {
  expect(await memStore.findOne("a").catch((error: any) => error.name)).toMatch(
    "NotFound",
  );
});

it("adds new, etc ...", async () => {
  await memStore.clear();
  expect(await memStore.add("a", { name: "aaa" })).toBe(undefined);
  // ...
  expect(await memStore.clear()).toBe(1);
  expect(await memStore.add("a", { name: "aaa" })).toBe(undefined);
  expect(await memStore.findOne("a")).toMatchObject({ name: "aaa" });
  expect(await memStore.remove("a")).toBe(undefined);
  expect(await memStore.findOne("a").catch(error => error.name)).toMatch(
    "NotFound",
  );
});

it("more stores", async () => {
  const store2 = await levelStore(memDB, "moreThings");
  expect(await memStore.add("a", { name: "aaa" })).toBe(undefined);
  expect(await store2.add("a", { name: "aaa" })).toBe(undefined);
  expect(await memStore.add("a1", { name: "aaa1" })).toBe(undefined);
  expect(await store2.add("a1", { name: "aaa1" })).toBe(undefined);
});

it("persisted/json-db", async () => {
  const store = (await levelStore(jsonDB, "moreThings2"));
  const value = { name: "aaa" };
  expect(await store.add("a", value)).toBe(undefined);
  // await jsonDB.close();  
  const dbFile = require(jsonDbPath);
  expect(dbFile["things/a"]).toBe(undefined);
  expect(dbFile["moreThings/a"]).toBe(undefined);
  expect(dbFile["moreThings2/a"]).toBe(JSON.stringify(value));
})
//
it("extends", async () => {
  const bt = BasicTable(memStore);
  await bt.add("x", { name: "x" });
  const x = await bt.findOne("x");
  //
  expect((x.createdAt as Date).getDate()).toBe(new Date().getDate());
  expect(x.id).toBe("x");
});

it("validates: 1000/jsons", async () => {
  // 1089ms with memdown
  // jest.setTimeout(60000);
  const s = await levelStore<Thing>(jsonDB, "things2", [
    { key: "name", required: true, unique: true },
  ]);
  // 10000 records with 40.202s with jsonDown
  for (let i = 0; i < 1000; i++) {
    await s.add(`indexed${i}`, { name: `x${i}` });
  }
  expect(await s.add("y", { name: null }).catch(err => err))
    .toBeInstanceOf(SchemaError);

  expect(
    await s.add("y1", { name: undefined }).catch(err => err),
  ).toBeInstanceOf(SchemaError);

  expect(await s.add("xxxx", { name: "x0" }).catch(error => error)).toBeInstanceOf(SchemaError);
});

it("10000's", async () => {
  // 1089ms with memdown
  // jest.setTimeout(60000);
  const store = basicTable(await levelStore<Thing>(leveldb, "things3"));
  console.time("add:1");
  await store.add("1", { name: "1" });
  console.timeEnd("add:1");
  console.time("add:x10000");
  for (let i = 0; i < 10000; i++) {
    await store.add(`indexed${i}`, { name: `x${i}` });
  }
  console.timeEnd("add:x10000");
  console.time("get:x9999");
  expect((await store.findOne("indexed9")).name).toBe("x9");
  console.timeEnd("get:x9999");
  console.time("find:x10000");
  expect((await store.findMany()).length).toBe(10001);
  console.timeEnd("find:x10000");
});

it("Honors schema", async () => {
  const store = await levelStore<Thing>(jsonDB, "things4", [
    { key: "name", required: true, unique: true },
  ]);
  expect(await store.add("a", { x: "aaa" } as any).catch(e => e))
    .toBeInstanceOf(SchemaError)
})

it("Honors schema/type", async () => {
  const store = await levelStore<Thing>(jsonDB, "things4", [
    { key: "name", required: true, unique: true, type: "string" },
  ]);
  const e = await store.add("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", { name: 1 as any }).catch(e => e);
  expect(e)
    .toBeInstanceOf(SchemaError);

  expect(e.message)
    .toContain("instead of number")
})

