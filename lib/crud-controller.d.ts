import { RequestHandler } from "express";
import { Payload, AsyncMap } from "./types";
/**
 * TODO: paged
 */
export default function CrudController<TStore extends AsyncMap<{}>>(store: TStore): {
    put: (payload?: Payload, clean?: (x: any) => any) => RequestHandler;
    get: (payload?: Payload, clean?: (x: any) => any) => RequestHandler;
    dlete: (clean?: (x: any) => any) => RequestHandler;
    post: (payload?: Payload, clean?: (x: any) => any) => RequestHandler;
};
