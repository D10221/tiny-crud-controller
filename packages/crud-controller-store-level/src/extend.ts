import { Store, StoreRecord } from "./types";
// Types Hack!
export default <IN, R, OUT>(store: Store<IN>, storeAs: (x: Partial<IN>) => R, out: (r: StoreRecord<R>) => OUT)=> {
    // Types Hack!
    const { add, clear, findMany, findOne, remove, update } = store as any as Store<R>;    
    return {
        // in
        add: (id: string, data: IN) => add(id, storeAs(data)),
        update: (id: string, data: Partial<IN>) => update(id, storeAs(data)),
        // out
        findMany: () => findMany().then(records => records.map(out)),
        findOne: (id: string) => findOne(id).then(r => out([id, r])),
        // same
        clear,
        remove
    }
}