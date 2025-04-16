const express = require("express");
const path = require("path");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const helmet = require("helmet");
const crypto = require("crypto");
const cors = require("cors");
const { body, validationResult } = require("express-validator");

dotenv.config();
const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(helmet());
app.use(express.json());
app.use(cors({ origin: "http://localhost:3290" })); // strict CORS
app.use(express.static(path.join(__dirname, "client")));

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "index.html"));
});

// POST: Email Sending
app.post(
  "/send-email",
  [
    body("name").trim().isLength({ min: 2, max: 50 }),
    body("email").isEmail(),
    body("message").trim().isLength({ min: 5, max: 1000 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const { name, email, message } = req.body;

    // OPTIONAL: Server-side HMAC to log + secure internally
    const secret = process.env.SECRET_KEY;
    const dataToSign = `${name}:${email}:${message}`;
    const signature = crypto
      .createHmac("sha256", secret)
      .update(dataToSign)
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

      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: "Email failed to send" });
    }
  }
);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
