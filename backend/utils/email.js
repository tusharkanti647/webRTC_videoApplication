

import nodemailer from "nodemailer";

// Function to send an invite email to a user
// `to`        -> receiver email address
// `joinUrl`   -> meeting / room link user will join
// `name`      -> name of the rome
export async function sendInviteEmail(to, { joinUrl, name }) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_PORT == 587, // true for 465, false for 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Video App" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Invite to ${name}`,
      text: `You are invited to join.\n\nJoin link: ${joinUrl}`,
      html: `
        <h3>You are invited to ${name}</h3>
        <p>Click below to join:</p>
        <a href="${joinUrl}">${joinUrl}</a>
      `,
    });

    console.log("Email sent successfully");
  } catch (err) {
    console.error("Email send failed:", err);
  }
}
