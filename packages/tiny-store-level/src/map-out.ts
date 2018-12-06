import { Store, StoreRecord } from "./types";
export default <T, R>(store: Store<T>, mapOut: (r: StoreRecord<T>) => R) => {
    const { add, clear, findMany, findOne, remove, update } = store;
    return {
        add,
        update,
        findMany: () => findMany().then(records => records.map(mapOut)),
        findOne: (id: string) => findOne(id).then(x => mapOut([id, x])),
        // same
        clear,
        remove
    }
}