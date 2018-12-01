import { Request, Response } from "express";

export default function fromBody(_: Request, res: Response): [string, {}] {
  const { id, ...data } = res.locals.body || { id: undefined };
  return [id, data];
}
