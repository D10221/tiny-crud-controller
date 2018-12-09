import { LevelDB } from "@australis/tiny-store-level";
import { Express, json, Router } from "express";
import mapOfThings from "./map-of-things";

export default async function configure<A extends Express | Router>(app: A) {
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

    const leveldb: any = LevelDB("demo_db");
    const { default: levelThings } = await import("./level-things");
    app.use("/api/level/things", [json(), await levelThings(leveldb)]);
    return app;
  } catch (error) {
    return Promise.reject(error);
  }
}
