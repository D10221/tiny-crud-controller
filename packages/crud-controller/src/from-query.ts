import { Request, Response } from "express";
/**
 *
 */
export default (req: Request, _: Response): [string, {}] => {
  const { id, ...data } = req.query || { id: undefined };
  return [id, data];
};
