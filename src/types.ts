import { Request, Response } from "express";

/** */
export interface Store {
  find(...args: any[]): Promise<any>;
  remove(args?: any): Promise<any>;
  add(...args: any[]): Promise<any>;
  update(...args: any[]): Promise<any>;
}
/** */
export type Validate = (req: Request) => Promise<string[]>;
/** */
export interface Options {
  validate?: Validate;
}
export type Payload = (
  req: Request,
  res: Response,
) => [string | undefined, {} | undefined];
