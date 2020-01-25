import AsyncMap from "./asyncMap";
import { RequestHandler, Request } from "express";

const fakeRequest = (store: AsyncMap | null | undefined) => (
  handler: RequestHandler,
  stringify = JSON.stringify.bind(JSON),
) => (req: Partial<Request>) => {
  Object.assign(req, { app: { locals: { store } } });  
  return new Promise<any>((resolve, reject) => {
    const res: any = {
      json: (x: any) => resolve(stringify(x)),
      status: (_statusCode?: any) => (x: any) => resolve(x),
      send: (x: any) => resolve(x),
    };
    const next = (e?: any) => {
      if (e) {
        reject(e);
      } else {
        resolve(null);
      }
    };
    handler(req as Request, res, next);
  });
};

export default fakeRequest;
