import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { PostgresConnection } from "../db/index.js"
import { BCRYPT_SALTS_ROUNDS, HOST_FRONT_VERIFY_ACCOUNT_LINK, URL_USER_INFO, JWT_SECRET, JWT_TIME_OF_LIFE } from "../config/index.js";
import { HTTP_200_OK, HTTP_201_CREATED, HTTP_400_BAD_REQUEST } from "../utils/HttpStatus.js";
import { sendEmail } from "../utils/EmailSender.js";

export const logIn = async (req, res) => {
  const { email, pw } = req.body;
  const { status, message } = await validateLogin(email, pw);
  res.status(status).send(message);
}

export const signUp = async (req, res) => {
  const { first_name, last_name, email, pw, pwConfirm } = req.body;
  if (pw !== pwConfirm) return res.status(HTTP_400_BAD_REQUEST).send({ message: "Passwords are different" });
  const { status, message } = await saveNewAccount(first_name, last_name, email, pw)
  res.status(status).send(message);
}

export const logInGoogle = async (req, res) => {
  const { access_token } = req.body;
  const { sub, email } = await getUserInfoFromGoogle(access_token);
  const { status, message } = await validateLogin(email, sub);
  res.status(status).send(message);
}

export const signUpGoogle = async (req, res) => {
  const { access_token } = req.body;
  const { sub, given_name, family_name, email } = await getUserInfoFromGoogle(access_token);
  console.log(sub, given_name, family_name, email);
  const { status, message } = await saveNewAccount(given_name, family_name, email, sub);
  res.status(status).send(message);
}

export const verifyAccount = async (req, res) => {
  const { id_account, token } = req.params;
  try {
    const account = await findAccountById(id_account);
    if (!account) return res.status(HTTP_400_BAD_REQUEST).send({ message: `Invalid link` })

    const tokenDB = await findToken(id_account, token);
    if (!tokenDB) return res.status(HTTP_400_BAD_REQUEST).send({ message: `Invalid link` })

    await activateAccount(account, tokenDB);
    res.status(HTTP_200_OK).send({ message: "Account verify" });
  } catch (error) {
    res.status(HTTP_400_BAD_REQUEST).send({ error: error.message });
  }
}

export const resendToken = async (req, res) => {
  const { email } = req.body;
  try {
    const account = await findAccountByEmail(email);
    if (account) {
      const token = await findTokenByAccount(account.id);
      const verifyLink = `${HOST_FRONT_VERIFY_ACCOUNT_LINK}/${account.id}/${token}`;
      await sendEmail(email, "Activate your acount", 'VerifyAccount', { verifyLink })
      return res.status(HTTP_200_OK).send({ message: "Resend" });
    }
    return res.status(HTTP_400_BAD_REQUEST).send({ message: "Email not found" });
  } catch (error) {
    return res.status(HTTP_400_BAD_REQUEST).send({ message: error.message, constraint: error.constraint });
  }
}

const saveNewAccount = async (first_name, last_name, email, pw) => {
  try {
    const account = await createAccount(first_name, last_name, email, pw);
    console.log(account);
    const tokenVerify = await createTokenVerify(account.id);
    const verifyLink = `${HOST_FRONT_VERIFY_ACCOUNT_LINK}/${account.id}/${tokenVerify.token}`;
    await sendEmail(email, "Activate your acount", 'VerifyAccount', { verifyLink })
    return { status: HTTP_201_CREATED, message: { message: "Created" } };
  } catch (error) {
    return { status: HTTP_400_BAD_REQUEST, message: { message: error.message } };
  }
}

const getUserInfoFromGoogle = async (access_token) => {
  console.log(access_token);
  console.log(`${URL_USER_INFO}${access_token}`);
  const data = await fetch(`${URL_USER_INFO}${access_token}`)
    .then(response => response.json())
    .catch(err => console.log(err))
  return data;
}

const activateAccount = async (account, token) => {
  await updateAccount(account, 'is_active', true);
  await deleteToken(token);
}

const updateAccount = async (account, field, value) => {
  const dbConnection = await PostgresConnection.connect();
  let result;
  try {
    result = await dbConnection.query(`UPDATE account SET ${field} = ${value} WHERE email = '${account.email}'`);
    result = result.rows;
  } catch (error) {
    throw error;
  } finally {
    dbConnection.release(true);
  }
  return result;
}

const deleteToken = async (token) => {
  const dbConnection = await PostgresConnection.connect();
  try {
    await dbConnection.query(`DELETE FROM tokenverify WHERE token = '${token.token}'`);
  } catch (error) {
    throw error;
  } finally {
    dbConnection.release(true);
  }
}

const validateLogin = async (email, pw) => {
  try {
    const account = await findAccountByEmail(email);
    if (account) {
      if (!account.is_active) return { status: HTTP_400_BAD_REQUEST, message: { message: "VERIFY YOUR ACCOUNT" } };

      if (validatePassword(pw, account.pw)) {
        const token = jwt.sign({
          first_name: account.first_name,
          last_name: account.last_name,
          email: account.email,
        }, JWT_SECRET, { expiresIn: JWT_TIME_OF_LIFE });

        return { header: { msg: "auth-token", token }, status: HTTP_200_OK, message: { data: token } };
      }
      return { status: HTTP_400_BAD_REQUEST, message: { message: "INCORRECT CREDENTIALS" } };
    }
    return { status: HTTP_400_BAD_REQUEST, message: { message: "CREATE AN ACCOUNT" } };
  } catch (error) {
    return { status: HTTP_400_BAD_REQUEST, message: { message: error.message } };
  }
}

const validatePassword = (pwSended, pwDB) => {
  return bcrypt.compareSync(pwSended, pwDB);
}

const findAccountById = async (id) => {
  const account = await findAccountBy('id', id)
  return account[0];
}

const findAccountByEmail = async (email) => {
  const account = await findAccountBy('email', email)
  return account[0];
}

const findAccountBy = async (by, data) => {
  const dbConnection = await PostgresConnection.connect();
  let result;
  try {
    result = await dbConnection.query(`SELECT id, first_name, last_name, email, pw, is_active FROM account WHERE ${by} = '${data}'`);
    result = result.rows;
  } catch (error) {
    throw error;
  } finally {
    dbConnection.release(true);
  }
  return result;
}

const findToken = async (id_account, token) => {
  const dbConnection = await PostgresConnection.connect();
  let result;
  try {
    result = await dbConnection.query(`SELECT id_account, token FROM tokenverify WHERE id_account = '${id_account}' AND token = '${token}'`);
    result = result.rows[0];
  } catch (error) {
    throw error;
  } finally {
    dbConnection.release(true);
  }
  return result;
}

const findTokenByAccount = async (id_account) => {
  const dbConnection = await PostgresConnection.connect();
  let result;
  try {
    result = await dbConnection.query(`SELECT id_account, token FROM tokenverify WHERE id_account = '${id_account}'`);
    result = result.rows[0];
  } catch (error) {
    throw error;
  } finally {
    dbConnection.release(true);
  }
  return result;
}

const createAccount = async (first_name, last_name, email, pw) => {
  const dbConnection = await PostgresConnection.connect();
  let result;
  try {
    const hash = bcrypt.hashSync(String(pw), Number(BCRYPT_SALTS_ROUNDS));
    result = await dbConnection.query(`INSERT INTO "account" (first_name, last_name, email, pw) VALUES ($1, $2, $3, $4) RETURNING *`, [first_name, last_name, email, hash])
    result = result.rows[0];
  } catch (error) {
    throw error;
  } finally {
    dbConnection.release(true);
  }
  return result;
}

const createTokenVerify = async (idAccount) => {
  const dbConnection = await PostgresConnection.connect();
  let result;
  try {
    const token = crypto.randomBytes(32).toString("hex")
    result = await dbConnection.query(`INSERT INTO "tokenverify" (id_account, token) VALUES ($1, $2) RETURNING *`, [idAccount, token])
    result = result.rows[0];
  } catch (error) {
    throw error;
  } finally {
    dbConnection.release(true);
  }
  return result;
}