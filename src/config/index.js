import dotenv from "dotenv";

dotenv.config()

export const POSTGRES_USER = process.env.POSTGRES_USER;
export const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD;
export const POSTGRES_HOST = process.env.POSTGRES_HOST;
export const POSTGRES_PORT = process.env.POSTGRES_PORT;
export const POSTGRES_DATABASE = process.env.POSTGRES_DATABASE;
export const CLIENT_ID = process.env.CLIENT_ID;
export const CLIENT_SECRET = process.env.CLIENT_SECRET;
export const SERVER_PORT = process.env.SERVER_PORT;
export const CLIENT_URL = process.env.CLIENT_URL;
export const URL_USER_INFO = process.env.URL_USER_INFO;
export const BCRYPT_SALTS_ROUNDS = process.env.BCRYPT_SALTS_ROUNDS;
export const EMAIL = process.env.EMAIL;
export const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
export const HOST_FRONT_VERIFY_ACCOUNT_LINK = process.env.HOST_FRONT_VERIFY_ACCOUNT_LINK;
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_TIME_OF_LIFE = process.env.JWT_TIME_OF_LIFE;