import express, { json, Express } from "express";
import mapOfThings from "./map-of-things";
import { LevelDB } from "@australis/tiny-crud-controller-store-level";
// ...
const app = express();

async function configure(app: Express) {
  try {
    app.use("/api/map/things", [json(), mapOfThings()]);

    // const { default: sqlThings} = await import("./sql-things");
    // app.use("/api/sql/things", [json(), await sqlThings()]);

    // const { default: mongoose } = await import("mongoose");
    // if (!process.env.MONGO_DB) throw new Error("NO MONGO_DB");
    // const db = await mongoose.connect(
    //   process.env.MONGO_DB,
    //   {},
    // );

    // const { default: mongoThings } = await import("./mongo-things");
    // app.use("/api/mongo/things", [json(), mongoThings(db)]);

    const { default: levelThings } = await import("./level-things");
    app.use("/api/level/things", [
      json(),
      await levelThings(LevelDB("db")),
    ]);
    return app;
  } catch (error) {
    return Promise.reject(error);
  }
}

configure(app)
  .then((app) => {
    console.log("configured");
    const port = Number(process.env.PORT) || 5000;
    return start(app, port);
  })
  .catch(error => {
    console.error(error);
    process.exit(-1);
  });

const start = (app: Express, port: number) =>
  new Promise((resolve, reject) => {
    app.listen(port, (err: Error) => {
      if (err) {
        reject(console.error);
      } else {
        resolve();
      }
    });
  });
