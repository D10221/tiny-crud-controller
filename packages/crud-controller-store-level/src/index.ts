import encoding from "encoding-down";
import levelup from "levelup";
import jsonDown from "./json-down";
import MemDown from "memdown";
/** */
export const jsonDb = (location: string): any => levelup(encoding(new jsonDown(location),{
  valueEncoding: "json"
}),
);
/** */
export const memDb: any = (location?: string) => levelup(encoding(new MemDown(location), {
  valueEncoding: "json"
}));

export { default } from "./create-store";
