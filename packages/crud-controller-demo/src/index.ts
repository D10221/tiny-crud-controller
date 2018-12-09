import express from "express";
import configure from "./configure";
import start from "./start";
import { AddressInfo } from "net";

configure(express())
  .then(app => {
    console.log("configured");
    const port = Number(process.env.PORT) || 5000;
    return start(app, port);
  })
  .then(server => {
    const address = server.address() as AddressInfo;
    console.log(
      "Started: %s://%s:%s",
      address.family,
      address.address,
      address.port,
    );
  })
  .catch(error => {
    console.error(error);
    process.exit(-1);
  });
