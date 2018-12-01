import express, { json } from "express";
import mapOfThings from "./map-of-things";
// ...
const app = express();

app.use("/api/things", [json(), mapOfThings()]);

app.listen(5000, (err: any) => {
  if (err) {
    console.error(err);
    process.exit(-1);
  } else {
    console.log("listening %s", 5000);
  }
});
