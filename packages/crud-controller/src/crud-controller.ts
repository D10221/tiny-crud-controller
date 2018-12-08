import { RequestHandler } from "express";
import { Store } from "./types";
import fromAny from "./from-any";
/** */
const noFilter: (id: any, data: any | any[]) => any = (...x) => x;
/**
 * TODO: paged
 */
export default function CrudController<TStore extends Store>(store: TStore) {
  /**
   * READ/GET one
   */
  const findOne = (payload = fromAny) => {
    payload = payload || fromAny;
    /** */
    return (transform = noFilter): RequestHandler => {
      transform = transform || noFilter;
      /** */
      return async (req, res, next) => {
        try {
          const [id, params] = payload(req, res);
          let ret = await store.findOne(id, params);
          return res.json(transform(id, ret));
        } catch (error) {
          return next(error);
        }
      };
    };
  };
  /**
   * READ/GET one
   */
  const findMany = (payload = fromAny) => {
    payload = payload || fromAny;
    /** */
    return (transform = noFilter): RequestHandler => {
      transform = transform || noFilter;
      /** */
      return async (req, res, next) => {
        try {
          const [id, params] = payload(req, res);
          let ret = await store.findMany(params);
          return res.json(transform(id, ret));
        } catch (error) {
          return next(error);
        }
      };
    };
  };
  /**
   * READ/GET/LIST
   */
  const find = (payload = fromAny) => {
    payload = payload || fromAny;
    /** */
    return (transform = noFilter): RequestHandler => {
      transform = transform || noFilter;
      /** */
      return async (req, res, next) => {
        try {
          const [id, params] = payload(req, res);
          let ret: any;
          if (id) {
            ret = await store.findOne(id, params);
          } else {
            ret = await store.findMany(params);
          }
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
  const add = (payload = fromAny) => {
    payload = payload || fromAny;
    /** */
    return (transform = noFilter): RequestHandler => {
      transform = transform || noFilter;
      /** */
      return async (req, res, next) => {
        try {
          const [id, data] = payload(req, res);
          await store.add(id, data);
          const ret = await store.findOne(id);
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
  const update = (payload = fromAny) => {
    payload = payload || fromAny;
    /** */
    return (transform = noFilter): RequestHandler => {
      transform = transform || noFilter;
      /** */
      return async (req, res, next) => {
        try {
          const [id, data] = payload(req, res);
          await store.update(id, data);
          const ret = await store.findOne(id);
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
    findOne,
    findMany,
    remove,
    update,
  };
}
