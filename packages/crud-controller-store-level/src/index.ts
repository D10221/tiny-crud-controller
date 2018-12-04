import levelup from "levelup";
import jsonDown from "jsondown";
import { join, isAbsolute } from "path";

export const newLevel = (location: string) =>
  levelup(
    jsonDown(isAbsolute(location) ? location : join(process.cwd(), location)),
  );
/**
 * value serializer
 */
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
};
/**
 * Key encoder
 */
const _encoder = (name: string) => {
  const regex = new RegExp(`^${name}\/.*`, "i");
  return {
    isMatch(key: Buffer | string) {
      if (typeof key === "string") return regex.test(key);
      return key.toString();
    },
    decode(key: string | Buffer) {
      if (typeof key === "string") return key.split(`${name}/`)[1];
      return key.toString().split(`${name}/`)[1];
    },
    encode(id: string) {
      return `${name}/${id}`;
    },
  };
};

export type Serializer = {
  serialize: (a: any) => string;
  deserialize: (value: string | Buffer) => any;
};

export type Encoder = {
  encode(s: string): string;
  decode(s: string): string;
  isMatch: (s: string | Buffer) => boolean;
};
/** */
const catchNotFound = (returns: any = null) => (error: Error) => {
  return error && error.name === "NotFoundError"
    ? returns
    : Promise.reject(error);
}
type MapIn = (x: any)=> any;
type MapOut = (key: any, value: any) => any;
/**
 * IN MAP
 */
export const timeStamper: MapIn = (x: { [key: string]: any }) => ({
  ...x,
  createdAt: x.createdAt || new Date(),
  updatedAt: x.updatedAt || new Date(),
});
/**
 * OUT MAP
 */
export const idMap = (key: any, value: any) => ({ key, ...(value || {}) });
/**
 *
 */
export default (partitionName: string, encoder?: Encoder) => {
  const { encode, decode, isMatch } = encoder || _encoder(partitionName);

  return (db: any = newLevel("store.json"), serializer?: Serializer) => {
    const { serialize, deserialize } = serializer || _serializer;

    const findOne = (id: string): any =>
      db.get(encode(id)).then((value: any) => deserialize(value));

    const findMany = (map: (id: string, value: any) => any) =>
      new Promise((resolve, reject) => {
        try {
          const stream = db.createReadStream() as NodeJS.ReadableStream;
          let result: any[] = [];
          stream.on("data", ({ key, value }) => {
            if (isMatch(key)) {
              result.push(map(decode(key), deserialize(value)));
            }
          });
          stream.on("error", error => {
            reject(error);
          });
          // stream.on("close", () => {});
          stream.on("end", () => {
            resolve(result);
          });
        } catch (error) {
          return reject(error);
        }
      });
    /**
     * validate: used to ? find unique values , Not Null etc
     */
    return (mapIn?: MapIn, mapOut?: MapOut, validate?: (data: {}, f: () => any) => any) => {   
      mapIn = mapIn || timeStamper;
      mapOut = mapOut || idMap;   
      /** */
      return {
        /** tiny-contorller-store-member */
        add: async (id: string, data: {}) => {
          if (await findOne(id).catch(catchNotFound(false)))
            return Promise.reject(new Error(`Duplicate key: ${id}`));
          if (validate) {
            await validate(data, () =>
              findMany((id, value) => ({ id, value })),
            );
          }
          return db.put(encode(id), serialize(mapIn(data))) as Promise<
            any
          >;
        },
        /** tiny-contorller-store-member */
        find: (id?: string) => {
          if (id) return findOne(id).then((value: any) => mapOut(id, value));
          else findMany(mapOut);
        },
        findOne: (id?: string) =>
          findOne(id).then((value: any) => mapOut(id, value)),
        findMany: () => findMany(mapOut),
        /** tiny-contorller-store-member */
        remove(id?: string) {
          return db.del(encode(id));
        },
        /** tiny-contorller-store-member */
        update: async (id: string, data: {}) => {
          const found = await findOne(id);
          if (!found) return Promise.reject(new Error(`Not Found key: ${id}`));
          if (validate) {
            await validate(data, () =>
              findMany((id, value) => ({ id, value })),
            );
          }
          return db.put(
            encode(id),
            serialize(mapIn({ ...found, ...data })),
          );
        },
        clear: () =>
          new Promise((resolve, reject) => {
            try {
              const stream = db.createReadStream() as NodeJS.ReadableStream;
              let result = 0;
              stream.on("data", async ({ key }) => {
                if (isMatch(key)) {
                  result = result + 1;
                  await db.del(key);
                }
              });
              stream.on("error", error => {
                reject(error);
              });
              // stream.on("close", () => {});
              stream.on("end", () => {
                resolve(result);
              });
            } catch (error) {
              return reject(error);
            }
          }),
      };
    };
  };
};
