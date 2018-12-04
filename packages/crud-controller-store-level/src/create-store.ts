import { StoreRecord, KeyEncoder, Serializer } from "./types";
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
/** */
const catchNotFound = (returns: any = null) => (error: Error) => {
    return error && error.name === "NotFoundError"
        ? returns
        : Promise.reject(error);
}
/**
 *
 */
export default <T extends {} = {}>(db: any, partitionName: string, keyEncoder?: KeyEncoder, serializer?: Serializer) => {

    const { encode, decode, isMatch } = keyEncoder || _encoder(partitionName);

    const { serialize, deserialize } = serializer || _serializer;

    const findOne = <X>(id: string): Promise<X> =>
        db.get(encode(id)).then((value: Buffer) => deserialize(value));

    const findMany = <X>() => new Promise<StoreRecord<X>[]>((resolve, reject) => {
        try {
            const stream = db.createReadStream() as NodeJS.ReadableStream;
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

    return {
        /** tiny-contorller-store-member */
        add: async (id: string, data: T) => {
            if (await findOne<T>(id).catch(catchNotFound(false)))
                return Promise.reject(new Error(`Duplicate key: ${id}`));
            return db.put(encode(id), serialize(data)
            );
        },
        /** tiny-controller-store-member */
        update: async (id: string, data: Partial<T>) => {
            const found = await findOne<T>(id);
            if (!found) return Promise.reject(new Error(`Not Found key: ${id}`));
            return db.put(
                encode(id),
                serialize(Object.assign(found, data)),
            );
        },
        findOne: (id: string): Promise<T> => findOne<T>(id),
        // ...
        findMany: (): Promise<StoreRecord<T>[]> => findMany<T>(),
        /** tiny-contorller-store-member */
        async remove(id?: string): Promise<any> {
            await findOne(id); //throws 
            return db.del(encode(id));
        },
        clear: () =>
            new Promise<any>((resolve, reject) => {
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
