import { Request, Response } from "express";

export default function fromBody(req: Request, _: Response) {
    return req.body;
}