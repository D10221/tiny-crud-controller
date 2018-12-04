import { existsSync, unlinkSync } from "fs";
import path from "path";
import levelStore, { newLevel, idMap } from "../src";

const dbPath = path.resolve(process.cwd(), "test-store.json");
if (existsSync(dbPath)) {
  unlinkSync(dbPath);
}
const noMap = (x: any) => x;
const db = newLevel(dbPath);
const store = levelStore("things")(db)(noMap);

describe(require("../package.json").name, () => {

  it("finds many", async () => {
    expect(await store.find()).toMatchObject([]);
  });

  it("throws not found", async () => {
    expect(await store.find("a").catch((error: any) => error.name)).toMatch(
      "NotFound",
    );
  });
  
  it("adds new, etc ...", async () => {
    await store.clear();
    expect(await store.add("a", { name: "aaa" })).toBe(undefined);
    // ...
    expect(await store.clear()).toBe(1);
    expect(await store.add("a", { name: "aaa" })).toBe(undefined);
    expect(await store.find("a")).toMatchObject({ key: "a", name: "aaa" });
    expect(await store.remove("a")).toBe(undefined);
    expect(await store.find("a").catch((error: any) => error.name)).toMatch(
      "NotFound",
    );
  });
  
  it("more stores", async () => {
    const db2 = newLevel(dbPath);
    const store2 = levelStore("moreThings")(db2)(noMap);
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
