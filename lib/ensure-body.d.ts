import { RequestHandler } from "express";
/**
   * ensure
   */
export default function ensureBody<Shape, TK extends keyof Shape & string>(expectedKeys?: TK[]): RequestHandler;
