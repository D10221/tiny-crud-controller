import { AsyncMap } from "./types";

export default <TStore extends AsyncMap<T>, T extends {}>(store: TStore) => {
    const out: any[] = [];
    store.forEach((value, key)=>{
        out.push({
            key,
            ...value as {}
        })
    });
    return out;
}