import express from "express";
import morgan from "morgan";
import cors from "cors"
import router from "./routes/routes.js"
import { SERVER_PORT } from "./config/index.js";

const app = express()

app.use(morgan('dev'))

app.use(express.json())

app.use(cors());

app.use("/api", router)

app.listen(SERVER_PORT, () => console.log(`Listening on port ${SERVER_PORT}...`))