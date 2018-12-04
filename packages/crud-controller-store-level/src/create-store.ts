import { StoreRecord } from "./types";
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
  createReadStream(o?: any): NodeJS.ReadableStream;
  get(key: string): Promise<any>;
  put(key: string, value: any): Promise<any>;
  del(key: string): Promise<any>;
}
const isNull = (x: any): boolean => x === null || x === undefined;
const isFunction = (x: any) => typeof x === "function";

type Schema = {
  required?: boolean | undefined;
  unique?: boolean | undefined;
  defaultValue?: any | (() => any) | undefined;
};
/**
 *
 */
export default async <T extends { [key: string]: any } = {}>(
  db: LevelLike,
  partitionName: string,
  //Wrong type
  schemap?: Record<keyof T, Schema>,
) => {
  const { encode, decode, isMatch } = _encoder(partitionName);

  const { serialize, deserialize } = _serializer;

  const findOne = (id: string): Promise<T> =>
    db.get(encode(id)).then((value: Buffer) => deserialize(value));

  const findMany = () =>
    new Promise<StoreRecord<T>[]>((resolve, reject) => {
      try {
        const stream = db.createReadStream();
        let result: ([string, any])[] = [];
        stream.on("data", ({ key, value }) => {
          if (isMatch(key)) {
            result.push([decode(key), deserialize(value)]);
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

  const schemas = Object.keys(schemap||{})
    .filter(key => Boolean(schemap[key]))
    .map(key => ({ key, ...schemap[key] }));

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

  let uniques = await uniqueIndex();

  return {
    /** tiny-contorller-store-member */
    add: async (id: string, data: T) => {
      if (await findOne(id).catch(catchNotFound(false)))
        return Promise.reject(new Error(`Duplicate key: ${id}`));

      for (const schema of schemas) {
        if (schema.required && isNull(data[schema.key])) {
          const value = isFunction(schema.defaultValue)
            ? schema.defaultValue()
            : schema.defaultValue;
          if (isNull(value)) {
            return Promise.reject(new Error(`${schema.key} (Required)`));
          }
          data[schema.key] = value;
        }
      }

      const found = uniques.find(x => x.values.indexOf(data[x.key]) != -1);
      if (found) {
        return Promise.reject(new Error(`${found.key} 'Must be unique'`));
      }

      for (const u of schemas.filter(schema => schema.unique)) {
        const x = uniques.find(x => x.key === u.key);
        if (x) x.values.push(data[u.key]);
      }

      return db.put(encode(id), serialize(data));
    },
    /** tiny-controller-store-member */
    update: async (id: string, data: Partial<T>) => {
      const found = await findOne(id).catch(catchNotFound(null));
      if (!found) return Promise.reject(new Error(`Not Found key: ${id}`));
      return db.put(encode(id), serialize(Object.assign(found, data)));
    },
    findOne,
    // ...
    findMany,
    /** tiny-contorller-store-member */
    async remove(id?: string): Promise<any> {
      await findOne(id); //throws
      return db.del(encode(id));
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
      }),
  };
};
