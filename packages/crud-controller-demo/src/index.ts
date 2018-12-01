import express, { json } from "express";
import mapOfThings from "./map-of-things";
import sqlThings from "./sql-things";
// ...
const app = express();

async function run() {
  try {
    app.use("/api/things", [json(), mapOfThings()]);
    app.use("/api/sql/things", [json(), await sqlThings()]);

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
