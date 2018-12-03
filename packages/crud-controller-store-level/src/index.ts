
import levelup from "levelup";
import jsonDown from "jsondown";
import { join, isAbsolute } from "path";

export const newLevel = (location: string) => levelup(jsonDown(isAbsolute(location) ? location : join(process.cwd(), location)));

const _serializer = {
  serialize: JSON.stringify,
  deserialize(value: Buffer | string) {
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
  },
}
/** */
const encoder = (name: string) => {
  const regex = new RegExp(`^${name}\/.*`, "i");
  return {
    isMatch(key: Buffer | string) {
      if (typeof key === "string")
        return regex.test(key)
      return key.toString();
    }
    ,
    decode(key: string | Buffer) {
      if (typeof key === "string") return key.split(`${name}/`)[1];
      return key.toString().split(`${name}/`)[1];
    }
    ,
    encode(id: string) {
      return `${name}/${id}`
    }
  }
}

export type Serializer = {
  serialize: (a: any) => string,
  deserialize: (value: string | Buffer) => any
};

export type Encoder = {
  encode(s: string): string,
  decode(s: string): string,
  isMatch: (s: string | Buffer) => boolean;
}
export interface Options {
  serializer?: Serializer,
  encoder?: Encoder,
  map?: {
    out?: (key: string, value: any) => any,
    in?: (x: any) => any
  }
}
/** */
const catchNotFound = (returns: any = null) => (error: Error) => {
  return error && error.name === "NotFoundError" ? returns : Promise.reject(error)
}
/**
 * './mydata.json'
 */
export default (name: string) => {

  return (db: any = null, options?: Options) => {

    db = db || newLevel("store.json");

    const { serialize, deserialize } = options && options.serializer || _serializer;
    const { encode, decode, isMatch } = (options && options.encoder) || encoder(name);
    const mapOut = options && options.map && options.map.out || ((key, value) => ({ key, ...(value || {}) }));
    const mapIn = options && options.map && options.map.in || ((x: any) => x);
    const find = async (id?: string) => {
      if (id) {
        return db.get(encode(id)).then((value: any) => mapOut(id, deserialize(value)));
      } else {
        return new Promise((resolve, reject) => {
          try {
            const stream = (db.createReadStream() as NodeJS.ReadableStream);
            let result: any[] = [];
            stream.on("data", ({ key, value }) => {
              if (isMatch(key)) {
                result.push(mapOut(decode(key), deserialize(value)));
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
    /** */
    return {
      add: async (id: string, data: {}) => {
        if (await find(id).catch(catchNotFound(false))) return Promise.reject(new Error(`Duplicate key: ${id}`));
        return db.put(encode(id), serialize(mapIn(data))) as Promise<any>
      },
      find,
      remove(id?: string) {
        return db.del(encode(id));
      },
      update: async (id: string, data: {}) => {
        if (!await find(id)) return Promise.reject(new Error(`Not Found key: ${id}`));
        return db.put(encode(id), serialize(mapIn(data)));
      },
      clear: () => new Promise((resolve, reject) => {
        try {
          const stream = (db.createReadStream() as NodeJS.ReadableStream);
          let result = 0;
          stream.on("data", async ({ key }) => {
            if (isMatch(key)) {
              result = result + 1
              await db.del(key);
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
      })
    };
  }
};
