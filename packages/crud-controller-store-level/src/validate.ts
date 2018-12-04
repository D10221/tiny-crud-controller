import { Store } from "./types";

const isNull = (x: any): boolean => x === null || x === undefined;
const isFunction = (x: any) => typeof x === "function";

type Schema = {
  required?: boolean | undefined;
  unique?: boolean | undefined;
  defaultValue?: any | (() => any) | undefined;
};

// Types Hack!
export default async <T extends { [key: string]: any }>(
  store: Store<T>,
  schemap: Record<keyof T, Schema>,
): Promise<Store<T>> => {
  const schemas = Object.keys(schemap)
    .filter(key => Boolean(schemap[key]))
    .map(key => ({ key, ...schemap[key] }));

  const uniqueIndex = () =>
    Promise.all(
      schemas
        .filter(schema => schema.unique)
        .map(({ key }) =>
          store
            .findMany()
            .then(x => x.map(([_id, value]) => value[key]))
            .then(values => ({ key, values })),
        ),
    );

  let uniques = await uniqueIndex();

  // Types Hack!
  return {
    // in
    add: (id: string, data: T & { [key: string]: any }) => {
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

      return store.add(id, data);
    },
    update: (id: string, data: Partial<T>) => store.update(id, data),
    // out
    findMany: store.findMany,
    findOne: store.findOne,
    // same
    clear: store.clear,
    remove: store.remove,
  };
};
