import pg from "pg"
import { POSTGRES_DATABASE, POSTGRES_HOST, POSTGRES_PASSWORD, POSTGRES_PORT, POSTGRES_USER } from "../config/index.js";

const pool = new pg.Pool({
  host: POSTGRES_HOST,
  port: POSTGRES_PORT,
  user: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  database: POSTGRES_DATABASE,
})

const connect = () => {
  return pool.connect();
}

const disconnect = () => {
  pool.end(() => {
    console.log(`Postgresql DB disconnected at ${new Date().toLocaleString()}`)
  })
}

export {
  connect, disconnect
};