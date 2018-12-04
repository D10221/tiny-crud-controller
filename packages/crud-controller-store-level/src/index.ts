import levelup from "levelup";
import jsonDown from "jsondown";
import { join, isAbsolute } from "path";
import MemDown from "memdown";

export const jsonDb = (location: string) =>
  levelup(
    jsonDown(isAbsolute(location) ? location : join(process.cwd(), location)),
  );

export const memDb = (location?: string) => levelup(new MemDown(location));

export { default } from "./create-store";
