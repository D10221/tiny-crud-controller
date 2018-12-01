import { RequestHandler } from "express";

import fromBody from "./from-body";
import all from "./all";
import fromParams from "./from-params";
import { Payload, AsyncMap } from "./types";
/**
 * TODO: paged
 */
export default function CrudController<TStore extends AsyncMap<{}>>(
  store: TStore,
) {
  //
  const noClean = (x: any) => x;
  /**
   * READ/GET/LIST
   */
  const get: (payload?: Payload, clean?: (x: any) => any) => RequestHandler = (
    payload = fromParams,
    clean = noClean,
  ) => async (req, res, next) => {
    try {
      const [key] = payload(req, res);
      let data;
      if (key) {
        data = clean((await store.get(key)) || {});
      } else {
        data = ((await all(store)) || []).map(clean);
      }
      return res.json(data);
    } catch (error) {
      return next(error);
    }
  };
  /**
   * DELETE/REMOVE
   */
  const dlete: (clean?: (x: any) => any) => RequestHandler = (
    clean = noClean,
  ) => async (req, res, next) => {
    try {
      clean = clean || noClean;
      const { id } = req.body;
      const data = await store.set(id, null);
      return res.json(clean(data));
    } catch (error) {
      return next(error);
    }
  };
  /**
   * Create, Add, Insert , NEW , PUT
   */
  const put: (
    payload?: Payload,
    clean?: (x: any) => any,
  ) => RequestHandler = (payload = fromBody, clean = noClean) => async (
    req,
    res,
    next,
  ) => {
    try {
      payload = payload || fromBody;
      clean = clean || noClean;
      const [key, data] = payload(req, res);
      await store.set(key, data);
      const ret = await store.get(key);
      return res.json(clean(ret));
    } catch (error) {
      return next(error);
    }
  };
  /**
   * SET, Modify, update, POST
   */
  const post: (
    payload?: Payload,
    clean?: (x: any) => any,
  ) => RequestHandler = (payload = fromBody, clean = noClean) => async (
    req,
    res,
    next,
  ) => {
    try {
      payload = payload || fromBody;
      clean = clean || noClean;
      const data = await store.set(...payload(req, res));
      return res.json(clean(data));
    } catch (error) {
      return next(error);
    }
  };
  return {
    put,
    get,
    dlete,
    post,
  };
}
