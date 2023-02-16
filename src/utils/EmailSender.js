import nodemailer from "nodemailer";
import { EMAIL, EMAIL_PASSWORD } from "../config/index.js"
import hbs from "nodemailer-express-handlebars";
import path from "path"

export const sendEmail = async (to, subject, template, context) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: `${EMAIL}`,
      pass: `${EMAIL_PASSWORD}`
    }
  });

  const handlebarOptions = {
    viewEngine: {
      partialsDir: path.resolve('./src/views/'),
      defaultLayout: false,
    },
    viewPath: path.resolve('./src/views/'),
  };

  transporter.use('compile', hbs(handlebarOptions));

  const mailOptions = {
    from: `OAuth Project`,
    to,
    subject,
    template,
    context
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.info(info.response)
    return true;
  } catch (error) {
    return false;
  }
}