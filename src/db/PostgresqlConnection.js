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
  pool.connect((err, client, release) => {
    console.log("Connecting to Postgresql...");
    if (err) {
      return console.error('Error acquiring client', err.stack)
    }
    client.query('select now()', (err, result) => {
      release()
      if (err) {
        return console.error('Error executing query', err.stack)
      }
      console.log(`Connected to Postgresql DB at ${new Date(result.rows[0].now).toLocaleString()}`)
    })
  })
}

const disconnect = () => {
  pool.end(() => {
    console.log(`Postgresql DB disconnected at ${new Date().toLocaleString()}`)
  })
}

export {
  connect, disconnect
};