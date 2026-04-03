import mongoose from "mongoose";

const db = mongoose.connection;

mongoose.connect(process.env.databaseConnectString, { dbName: "personalWeb2024" });

db.on("connected", function () {
  console.log(`Connected to MongoDB ${db.name} at ${db.host}:${db.port}`);
});
