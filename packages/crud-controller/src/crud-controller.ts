import { RequestHandler } from "express";
import fromBody from "./from-body";
import fromParams from "./from-params";
import { Store } from "./types";
import fromAny from "./from-any";
/**
 * TODO: paged
 */
export default function CrudController<TStore extends Store>(store: TStore) {
  //
  const noClean = (x: any) => x;
  /**
   * READ/GET/LIST
   */
  const get = (payload = fromParams, clean = noClean): RequestHandler => async (
    req,
    res,
    next,
  ) => {
    payload = payload || fromAny;
    clean = clean || noClean;
    try {
      const [id] = payload(req, res);
      let ret: any = (await store.find(id)) || null;
      if (!Array.isArray(ret) && typeof ret === "object") {
        ret = ret && { id, ...ret };
        ret = ret || null;
      }
      return res.json(clean(ret));
    } catch (error) {
      return next(error);
    }
  };
  /**
   * DELETE/REMOVE
   */
  const dlete = (payload = fromAny, clean = noClean): RequestHandler => async (
    req,
    res,
    next,
  ) => {
    payload = payload || fromAny;
    clean = clean || noClean;
    try {
      const [id] = payload(req, res);
      const ret = await store.remove(id);
      return res.json(clean(ret));
    } catch (error) {
      return next(error);
    }
  };
  /**
   * Create, Add, Insert , NEW , PUT
   */
  const put = (payload = fromBody, clean = noClean): RequestHandler => async (
    req,
    res,
    next,
  ) => {
    try {
      payload = payload || fromBody;
      clean = clean || noClean;
      const [id, data] = payload(req, res);
      await store.add(id, data);
      const ret = await store.find(id);
      return res.json(clean({ id, ...ret }));
    } catch (error) {
      return next(error);
    }
  };
  /**
   * SET, Modify, update, POST
   */
  const post = (payload = fromBody, clean = noClean): RequestHandler => async (
    req,
    res,
    next,
  ) => {
    try {
      payload = payload || fromBody;
      clean = clean || noClean;
      const [id, data] = payload(req, res);
      await store.update(id, data);
      const ret = await store.find(id);
      return res.json(
        clean({
          id,
          ...ret,
        }),
      );
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
