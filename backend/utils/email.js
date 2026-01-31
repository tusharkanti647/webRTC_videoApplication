import nodemailer from "nodemailer";

export async function sendInviteEmail(
    to,
    { joinUrl, name },
) {
    // For demo, we'll just log. In production configure SMTP via .env
    console.log(`Sending invite to ${to}: ${joinUrl}`);
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT) || 587,
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject: `Invite to ${name}`,
            text: `Join: ${joinUrl}`,
        });
    } catch (err) {
        console.warn("email send failed (ok for demo)", err);
    }
}
