import express, { json } from "express";
import mapOfThings from "./map-of-things";
import sqlThings from "./sql-things";
import mongoThings from "./mongo-things";
// ...
const app = express();

async function run() {
  try {
    const { default: mongoose } = await import("mongoose");
    if (!process.env.MONGO_DB) throw new Error("NO MONGO_DB");
    const db = await mongoose.connect(
      process.env.MONGO_DB,
      {},
    );
    app.use("/api/map/things", [json(), mapOfThings()]);
    app.use("/api/sql/things", [json(), await sqlThings()]);
    app.use("/api/mongo/things", [json(), mongoThings(db)]);
    app.listen(5000, (err: any) => {
      if (err) {
        console.error(err);
        process.exit(-1);
      } else {
        console.log("listening %s", 5000);
      }
    });
    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
}

run()
  .then(() => {
    console.log("Started");
  })
  .catch(error => {
    console.error(error);
    process.exit(-1);
  });
