import { RequestHandler, Request } from "express";
export declare type Getter = (req: Request) => {};
/**
 *
 */
export default function RejectKeys(keys: string[], get?: Getter): RequestHandler;
