import { Request, Response } from "express";

/** */
export interface Repo {
  byId(args: any): Promise<any>;
  all(args?: any): Promise<any>;
  remove(args?: any): Promise<any>;
  add(args: any): Promise<any>;
  update(args: any): Promise<any>;
}
/** */
export type Validate = (req: Request) => Promise<string[]>;
/** */
export interface Options {
  validate?: Validate;
}
export type Payload = (req: Request, res: Response) => [string, {}];

export interface AsyncMap<V extends {} = {}> {
  clear(): Promise<any>;
  delete(key: string): Promise<boolean>;
  forEach(
    callbackfn: (value: V, key: string, map: AsyncMap<V>) => any,
    thisArg?: any,
  ): void;
  get(key: string): Promise<V | undefined>;
  has(key: string): Promise<boolean>;
  set(key: string, value: V): Promise<this>;  
}
