import { existsSync, unlinkSync } from "fs";
import path from "path";
import levelStore, { jsonDb } from "../src";
import BasicTable from "../src/basic-table";

interface Thing extends Object {
  name: string;
}

const dbPath = path.resolve(process.cwd(), "test-store.json");
if (existsSync(dbPath)) {
  unlinkSync(dbPath);
}
const db = jsonDb(dbPath);

describe(require("../package.json").name, () => {
  it("finds many", async () => {
    const store = await levelStore<Thing>(db, "things");
    expect(await (store).findMany()).toMatchObject([]);
  });

  it("throws not found", async () => {
    const store = await levelStore<Thing>(db, "things");
    expect(await (store).findOne("a").catch((error: any) => error.name)).toMatch(
      "NotFound",
    );
  });

  it("adds new, etc ...", async () => {
    const store = await levelStore<Thing>(db, "things");
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
    const store = await levelStore<Thing>(db, "things");
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
    const bt = BasicTable(await levelStore<Thing>(jsonDb(dbPath), "things"));
    await bt.add("x", { name: "x" });
    const x = await bt.findOne("x");
    //
    expect((x.createdAt as Date).getDate()).toBe(new Date().getDate());
  });
});
//
describe("validate", () => {
  it("?", async () => {
    const s = await levelStore<Thing>(jsonDb(dbPath), "things2", { name: { required: true, unique: true }} as any);  
    await s.add("x2", { name: "x" });
    expect(await s.add("y", { name: null }).catch(err => err.message)).toBe(
      "name (Required)",
    );
    expect(
      await s.add("y1", { name: undefined }).catch(err => err.message),
    ).toBe("name (Required)");
    expect(
      await s.add("x3", { name: "x" }).catch(error => error.message),
    ).toBe("name 'Must be unique'");
  });
});
