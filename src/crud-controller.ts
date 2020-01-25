import { RequestHandler, Request } from "express";
import { Store } from "./types";
import fromAny from "./from-any";
/** */
const noFilter: (id: any, data: any | any[]) => any = (...x) => x;

type GetStore<TStore extends Store> = (
  req: Request,
) => TStore | Promise<TStore>;
/**
 * READ/GET one
 */
const findOne = <TStore extends Store>(getStore: GetStore<TStore>) => (
  payload = fromAny,
) => {
  payload = payload || fromAny;
  /** */
  return (transform = noFilter): RequestHandler => {
    transform = transform || noFilter;
    /** */
    return async (req, res, next) => {
      const store = await getStore(req);
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
const findMany = <TStore extends Store>(getStore: GetStore<TStore>) => (
  payload = fromAny,
) => {
  payload = payload || fromAny;
  /** */
  return (transform = noFilter): RequestHandler => {
    transform = transform || noFilter;
    /** */
    return async (req, res, next) => {
      const store = await getStore(req);
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
const find = <TStore extends Store>(getStore: GetStore<TStore>) => (
  payload = fromAny,
) => {
  payload = payload || fromAny;
  /** */
  return (transform = noFilter): RequestHandler => {
    transform = transform || noFilter;
    /** */
    return async (req, res, next) => {
      try {
        const store = await getStore(req);
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
const remove = <TStore extends Store>(getStore: GetStore<TStore>) => (
  payload = fromAny,
) => {
  payload = payload || fromAny;
  return (transform = noFilter): RequestHandler => {
    transform = transform || noFilter;
    return async (req, res, next) => {
      try {
        const store = await getStore(req);
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
const add = <TStore extends Store>(getStore: GetStore<TStore>) => (
  payload = fromAny,
) => {
  payload = payload || fromAny;
  /** */
  return (transform = noFilter): RequestHandler => {
    transform = transform || noFilter;
    /** */
    return async (req, res, next) => {
      try {
        const store = await getStore(req);
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
const update = <TStore extends Store>(getStore: GetStore<TStore>) => (
  payload = fromAny,
) => {
  payload = payload || fromAny;
  /** */
  return (transform = noFilter): RequestHandler => {
    transform = transform || noFilter;
    /** */
    return async (req, res, next) => {
      const store = await getStore(req);
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
/**
 * 
 * @param getStore where to get the store from 
 */
export const crudController = <TStore extends Store>(
  getStore: GetStore<TStore>,
) => {
  return {
    add: add(getStore),
    find: find(getStore),
    findOne: findOne(getStore),
    findMany: findMany(getStore),
    remove: remove(getStore),
    update: update(getStore),
  };
};
/**
 * with store instance
 * TODO: paged
 */
export default <TStore extends Store>(store: TStore) =>  crudController(_ => store);
