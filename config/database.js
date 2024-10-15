import mongoose from "mongoose";
import { databaseConnectString } from "./config.js";

const db = mongoose.connection;

mongoose.connect(databaseConnectString, { dbName: "personalWeb2024" });

db.on("connected", function () {
  console.log(`Connected to MongoDB ${db.name} at ${db.host}:${db.port}`);
});
