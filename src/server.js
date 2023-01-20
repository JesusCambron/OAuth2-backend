import express from "express";
import { PostgresConnection } from "./db/index.js";

const app = express()

PostgresConnection.connect();

app.listen(3000)