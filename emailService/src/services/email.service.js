// src / services / email.service.js;
import { transporter } from "../config/mailer.js";

export const sendEmail = async ({ to, subject, html, text }) => {
  return transporter.sendMail({
    from: `"Video App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    text,
  });
};
