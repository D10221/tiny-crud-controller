import { StoreRecord } from "./types";
// /**
//  * value serializer
//  */
// const _serializer = {
//   serialize: JSON.stringify,
//   deserialize(value: Buffer | string) {
//     if (value === null || value === undefined) {
//       return null;
//     }
//     if (value instanceof Buffer) {
//       return JSON.parse(value.toString("utf-8"));
//     }
//     if (typeof value === "string") {
//       return JSON.parse(value);
//     }
//     throw new Error("Not Implemented");
//   },
// };
/**
 * Key encoder
 */
const _encoder = (name: string) => {
  const regex = new RegExp(`^${name}\/.*`, "i");
  return {
    isMatch(key: Buffer | string) {
      if (typeof key === "string") return regex.test(key);
      return regex.test(key.toString());
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
/** */
const catchNotFound = (returns: any = null) => (error: Error) => {
  return error && error.name === "NotFoundError"
    ? returns
    : Promise.reject(error);
};
interface LevelLike {
  createReadStream(o?: {
    gt?: any,
    lt?: any,
    /** @default true */
    keys?: boolean,
    /** @default true */
    values?: boolean,
    /** @default -1 */
    limit?: number,
    reverse?: boolean,

  }): NodeJS.ReadableStream;
  get(key: string): Promise<any>;
  put(key: string, value: any): Promise<any>;
  del(key: string): Promise<any>;
}
const isNull = (x: any): boolean => x === null || x === undefined;
const isFunction = (x: any) => typeof x === "function";

type Schema<T> = {
  key: keyof T;
  required?: boolean | undefined;
  unique?: boolean | undefined;
  default?: any | undefined;
};
interface Indexer<T> {
  [key: string]: T;
}
/**
 *
 */
export default async <T extends Indexer<any> = {}>(
  db: LevelLike,
  partitionName: string,
  schemas: Schema<T>[] = [],
) => {
  const { encode, decode, isMatch } = _encoder(partitionName);

  // const { serialize, deserialize } = _serializer;

  const getKeys = () =>
    new Promise<string[]>((resolve, reject) => {
      try {
        const stream = db.createReadStream({ values: false });
        let result: string[] = [];
        stream.on("data", (key) => {
          if (isMatch(key)) {
            result.push(decode(key));
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

  const findOne = (id: string): Promise<T> =>
    db.get(encode(id)).then((value: any) => (value));

  const findMany = () =>
    new Promise<StoreRecord<T>[]>((resolve, reject) => {
      try {
        const stream = db.createReadStream();
        let result: StoreRecord<T>[] = [];
        stream.on("data", ({ key, value }) => {
          if (isMatch(key)) {
            result.push([decode(key), value]);
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

  // todo:is this faster than saving indexes ?
  const uniqueIndex = () =>
    Promise.all(
      schemas
        .filter(schema => schema.unique)
        .map(({ key }) =>
          findMany()
            .then(x => x.map(([_id, value]) => value[key]))
            .then(values => ({ key, values })),
        ),
    );

  const uniques = await uniqueIndex();
  let $keys = await getKeys();

  const addKey = (id: string) => <X>(x: X): X => {
    $keys.push(id);
    return x;
  }

  const removeKey = (id: string) => <X>(x: X): X => {
    $keys = $keys.filter(k => k !== id);
    return x;
  }

  const clearKeys = () => <X>(x: X): X => {
    $keys = [];
    return x;
  }

  return {
    /** tiny-contorller-store-member */
    add: async (id: string, data: T) => {
      // if (await findOne(id).catch(catchNotFound(false)))
      if ($keys.indexOf(id) !== -1)
        return Promise.reject(new Error(`Duplicate key: ${id}`));

      for (const schema of schemas) {
        if (schema.required && isNull(data[schema.key])) {
          const value = isFunction(schema.default)
            ? schema.default()
            : schema.default;
          if (isNull(value)) {
            return Promise.reject(new Error(`${schema.key} (Required)`));
          }
          data[schema.key] = value;
        }
      }
      // todo: is this faster than saving indexes ?       
      const found = uniques.find(x => x.values.indexOf(data[x.key]) != -1);
      if (found) {
        return Promise.reject(new Error(`${found.key} 'Must be unique'`));
      }
      for (const u of schemas.filter(schema => schema.unique)) {
        const x = uniques.find(x => x.key === u.key);
        if (x) x.values.push(data[u.key]);
      }
      // 
      return db.put(encode(id), data).then(addKey(id));
    },
    /** tiny-controller-store-member */
    update: async (id: string, data: Partial<T>) => {
      const found = await findOne(id).catch(catchNotFound(null));
      if (!found) return Promise.reject(new Error(`Not Found key: ${id}`));
      return db.put(encode(id), (Object.assign(found, data)));
    },
    findOne,
    // ...
    findMany,
    /** tiny-contorller-store-member */
    async remove(id?: string): Promise<any> {
      await findOne(id); //throws
      return db.del(encode(id)).then(removeKey(id));
    },    
    clear: () =>
      new Promise<any>((resolve, reject) => {
        try {
          const stream = db.createReadStream();
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
      }).then(clearKeys()),     
  };
};
