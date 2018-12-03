import express, { json } from "express";
import mapOfThings from "./map-of-things";
import { newLevel } from "@australis/tiny-crud-controller-store-level";
// ...
const app = express();

async function run() {
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
    app.use("/api/level/things", [json(), levelThings(newLevel("xstore.json"))]);
    
    const port = Number(process.env.PORT) || 5000;
    app.listen(port, (err: any) => {
      if (err) {
        console.error(err);
        process.exit(-1);
      } else {
        console.log("listening %s", port);
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
