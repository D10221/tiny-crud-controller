import { Express } from "express";
import { Server as HttpServer } from "http";
import { Server as HttpsServer } from "https";
/** */
const start = (app: Express, port: number) =>
  new Promise<HttpServer | HttpsServer>((resolve, reject) => {
    const server = app.listen(port, (err: Error) => {
      if (err) {
        reject(console.error);
      } else {
        resolve(server);
      }
    });
  });
export default start;
