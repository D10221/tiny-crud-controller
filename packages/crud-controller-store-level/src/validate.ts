import { Store } from "./types";

const isNull = (x: any): boolean => x === null || x === undefined;
const isFunction = (x: any) => typeof x === "function";

type C = "required" | "unique";

type Schema<T> = {
    key: keyof T,
    constrain: C[],
    defaultValue?: any
};

// Types Hack!
export default <T>(store: Store<T>, schemas: Schema<T>[]): Store<T> => {
    // Types Hack!    
    return {
        // in
        add: async (id: string, data: T & { [key: string]: any }) => {
            for (const schema of schemas) {
                if (Array.isArray(schema.constrain)) {
                    if (schema.constrain.indexOf("required") !== -1) {
                        if (isNull(data[schema.key])) {
                            const value = isFunction(schema.defaultValue) ? schema.defaultValue() : schema.defaultValue;
                            if (isNull(value)) {
                                return Promise.reject(new Error(`${schema.key} (Required)`));
                            }
                            data[schema.key] = value;
                        }
                    }
                    //TODO
                    if (schema.constrain.indexOf("unique")) {
                        const values = await store.findMany().then(records => records.map((r) => r[1][schema.key]));
                        if (values.indexOf(data[schema.key]) !== -1) {
                            return Promise.reject(new Error(`${schema.key} 'Must be unique'`));
                        }
                    }
                }
            }
            return store.add(id, data)
        },
        update: (id: string, data: Partial<T>) => store.update(id, data),
        // out
        findMany: store.findMany,
        findOne: store.findOne,
        // same
        clear: store.clear,
        remove: store.remove
    };
}