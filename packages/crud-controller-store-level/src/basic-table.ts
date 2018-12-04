import extend from "./extend";
import { Store, StoreRecord } from "./types";
//
const toDate = (x: DateType): DateType => {
    if (x instanceof Date) return x;
    if (typeof x === "number") return new Date(x);
    if (typeof x === "string") return new Date(x);
    return x;
}
//
const datesOut = <T extends TimeStamped>(x: T) => Object.assign(x, {
    createdAt: toDate(x.createdAt),
    updatedAt: toDate(x.updatedAt),
})
/**
 * OUT MAP, add id to returning result
 */
const idMap = <T>(r: StoreRecord<T>): T & { id?: string | undefined } => Object.assign(r[1], { id: r[0] });
/** */
type DateType = Date | string | number | undefined;
/** */
interface TimeStamped { createdAt?: DateType, updatedAt: DateType };
/**
 * IN MAP, adds timestamps to incoming things
 */
const timeStamper = <T extends { [key: string]: any }>(x: T): T & TimeStamped => Object.assign(x, {
    createdAt: x.createdAt || new Date(),
    updatedAt: x.updatedAt || new Date(),
});

export default <T>(store: Store<T>) => extend(store, timeStamper, record=> datesOut(idMap(record)));