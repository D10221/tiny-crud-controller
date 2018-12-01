import { Request, Response } from "express";

export default function fromBody(req: Request, _: Response): [string, {}] {
  const { id, ...data } = req.body || { id: undefined, data: undefined };
  return [id, data];
}
