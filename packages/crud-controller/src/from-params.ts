import { Request, Response } from "express";

export default (req: Request, _: Response): [string, {}] => {
  const { id, ...data } = req.params || { id: undefined };
  return [id, data];
};
