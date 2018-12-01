import { Request, Response } from "express";
/**
 * 
 */
export default (req: Request, _: Response): [string, {}] => {
  const { id } = req.query;
  return [id, {}];
};
