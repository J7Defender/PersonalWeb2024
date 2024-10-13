import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/templates/material-kit-master/index.html");
});

app.get("/signin", (req, res) => {
  res.sendFile(__dirname + "/templates/material-kit-master/pages/sign-in.html");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
