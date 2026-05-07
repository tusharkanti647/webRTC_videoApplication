// import nodemailer from 'nodemailer';

// Function to send an invite email to a user
// `to`        -> receiver email address
// `joinUrl`   -> meeting / room link user will join
// `name`      -> name of the rome
// export async function sendInviteEmail(to, { joinUrl, name }) {
//   try {
//     const transporter = nodemailer.createTransport({
//       host: process.env.EMAIL_HOST,
//       port: Number(process.env.EMAIL_PORT),
//       secure: process.env.EMAIL_PORT === 587, // true for 465, false for 587
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     await transporter.sendMail({
//       from: `"Video App" <${process.env.EMAIL_USER}>`,
//       to,
//       subject: `Invite to ${name}`,
//       text: `You are invited to join.\n\nJoin link: ${joinUrl}`,
//       html: `
//         <h3>You are invited to ${name}</h3>
//         <p>Click below to join:</p>
//         <a href="${joinUrl}">${joinUrl}</a>
//       `,
//     });

//     console.log('Email sent successfully');
//   } catch (err) {
//     console.error('Email send failed:', err);
//   }
// }
// import dotenv from 'dotenv';
// dotenv.config();

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendInviteEmail = async (to, { joinUrl, name }) => {
  try {
    console.log('UUUUUxxxxxxxxx', process.env.EMAIL_USER, process.env.EMAIL_PASS);
    console.log('kkkkkkkkkkkk start mail');
    const mailOptions = {
      from: `"Video App" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Invite to ${name}`,
      text: `You are invited to join ${name}.\n\nJoin link: ${joinUrl}`,
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2>You are invited to ${name}</h2>
          <p>Click the button below to join:</p>
          <a 
            href="${joinUrl}" 
            style="
              display:inline-block;
              padding:10px 20px;
              background:#1976d2;
              color:white;
              text-decoration:none;
              border-radius:5px;
            "
          >
            Join Now
          </a>
          <p style="margin-top:20px;">Or use this link:</p>
          <p>${joinUrl}</p>
        </div>
      `,
    };
    console.log('kkkkkkkkkkkk sending start mail');
    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Email sent:', info.response);
    return true;
  } catch (err) {
    console.error('❌ Email failed:', err);
    return false;
  }
};

// // setTimeout(() => {
// console.log('YYYYYY');
// sendInviteEmail('tusharkanti647@gmail.com', {
//   joinUrl: 'http://tusharkantidas.com/roome',
//   name: '1st roome name',
// });
// // }, 1000);
