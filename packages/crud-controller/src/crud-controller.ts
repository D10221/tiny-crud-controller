import { RequestHandler } from "express";
import fromBody from "./from-body";
import fromParams from "./from-params";
import { Store } from "./types";
import fromAny from "./from-any";
/** */
const noFilter: (id: any, data: any | any[]) => any = (...x) => x;
/**
 * TODO: paged
 */
export default function CrudController<TStore extends Store>(store: TStore) {
  //
  /**
   * READ/GET/LIST
   */
  const find = (payload = fromParams) => {
    payload = payload || fromAny;
    /** */
    return (transform = noFilter): RequestHandler => {
      transform = transform || noFilter;
      /** */
      return async (req, res, next) => {
        try {
          const [id] = payload(req, res);
          let ret: any = (await store.find(id)) || null;
          return res.json(transform(id, ret));
        } catch (error) {
          return next(error);
        }
      };
    };
  };
  /**
   * DELETE/REMOVE
   */
  const remove = (payload = fromAny) => {
    payload = payload || fromAny;
    return (transform = noFilter): RequestHandler => {
      transform = transform || noFilter;
      return async (req, res, next) => {
        try {
          const [id] = payload(req, res);
          const ret = await store.remove(id);
          return res.json(transform(id, ret));
        } catch (error) {
          return next(error);
        }
      };
    };
  };
  /**
   * Create, Add, Insert , NEW , PUT
   */
  const add = (payload = fromBody) => {
    payload = payload || fromBody;
    /** */
    return (transform = noFilter): RequestHandler => {
      transform = transform || noFilter;
      /** */
      return async (req, res, next) => {
        try {
          const [id, data] = payload(req, res);
          await store.add(id, data);
          const ret = await store.find(id);
          return res.json(transform(id, ret));
        } catch (error) {
          return next(error);
        }
      };
    };
  };
  /**
   * SET, Modify, update, POST
   */
  const update = (payload = fromBody) => {
    payload = payload || fromBody;
    /** */
    return (transform = noFilter): RequestHandler => {
      transform = transform || noFilter;
      /** */
      return async (req, res, next) => {
        try {
          const [id, data] = payload(req, res);
          await store.update(id, data);
          const ret = await store.find(id);
          return res.json(transform(id, ret));
        } catch (error) {
          return next(error);
        }
      };
    };
  };
  return {
    add,
    find,
    remove,
    update,
  };
}
