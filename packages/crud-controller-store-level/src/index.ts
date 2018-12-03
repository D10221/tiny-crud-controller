
import levelup from "levelup";
import jsonDown from "jsondown";
import { join } from "path";

const deserialize = (value: Buffer | string) => {
  if (value === null || value === undefined) {
    return null;
  }
  if (value instanceof Buffer) {
    return JSON.parse(value.toString("utf-8"));
  }
  if (typeof value === "string") {
    return JSON.parse(value);
  }
  throw new Error("Not Implemented");
}
const serialize = (x: any) => JSON.stringify(x);
/**
 * './mydata.json'
 */
export default (name: string, db: any = null) => {

  db = levelup(jsonDown(join(process.cwd(), "store.json")));

  const regex = new RegExp(`^${name}\/.*`, "i");

  const isMatch = (key: Buffer | string) => {
    if (typeof key === "string")
      return regex.test(key)
    return key.toString();
  }

  const split = (key: string | Buffer) => {
    if (typeof key === "string") return key.split(`${name}/`)[1];
    return key.toString().split(`${name}/`)[1];
  }

  const find = (id?: string) => {
    if (id) {
      return db.get(`${name}/${id}`)
    } else {
      return new Promise((resolve, reject) => {
        try {
          const stream = (db.createReadStream() as NodeJS.ReadableStream);
          let result: any[] = [];
          stream.on("data", ({ key, value }) => {
            if (isMatch(key)) {
              result.push({
                key: split(key),
                ...deserialize(value)
              });
            }
          });
          stream.on("error", error => {
            reject(error);
          })
          // stream.on("close", () => {});
          stream.on("end", () => {
            resolve(result);
          })
        } catch (error) {
          return reject(error);
        }
      });
    }
  };

  return {
    add: async (id: string, data: {}) => {
      if (await find(id)) return Promise.reject(new Error(`Duplicate key: ${id}`));
      return db.put(`${name}/${id}`, serialize(data)) as Promise<any>
    },
    find,
    remove(id?: string) {
      return db.del(`${name}/${id}`);
    },
    update: async (id: string, data: {}) => {
      if (!await find(id)) return Promise.reject(new Error(`Not Found key: ${id}`));
      return db.put(`${name}/${id}`, data);
    },
  };
};
