import { Request, Response } from "express";

export default function fromBody(_: Request, res: Response) {
    return res.locals.body;
}