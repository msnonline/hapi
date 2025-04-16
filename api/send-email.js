// /api/send-email.js

const nodemailer = require("nodemailer");
const crypto = require("crypto");

module.exports = async (req, res) => {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Set security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5000/"); // if needed

  const { name, email, message } = req.body || {};

  // Basic validation
  if (
    typeof name !== "string" ||
    name.length < 2 ||
    name.length > 50 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    typeof message !== "string" ||
    message.length < 5 ||
    message.length > 1000
  ) {
    return res.status(400).json({ error: "Invalid input" });
  }

  // Optional: HMAC for integrity/logging
  const signature = crypto
    .createHmac("sha256", process.env.SECRET_KEY)
    .update(`${name}:${email}:${message}`)
    .digest("hex");

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Website Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.RECEIVER_EMAIL,
      subject: "New Contact Form Message",
      text: `
        Name: ${name}
        Email: ${email}
        Message: ${message}
        Signature: ${signature} (Internal only)
      `,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    return res.status(500).json({ error: "Email failed to send" });
  }
};
