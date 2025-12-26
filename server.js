import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";

dotenv.config();

const app = express();
const upload = multer();

// ✅ FIXED CORS CONFIG
app.use(
  cors({
    origin: "https://proedgemedia.com",
    methods: ["POST", "GET", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

// ✅ Handle preflight requests
app.options("*", cors());

// Health check
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// Contact endpoint
app.post("/contact", upload.none(), async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    console.log("FORM DATA:", req.body);

    if (!name || !email || !message) {
      return res.status(400).send("Missing required fields");
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Proedge Website" <${process.env.SMTP_USER}>`,
      to: process.env.MAIL_TO,
      replyTo: email,
      subject: `[Proedge Website] ${subject || "New Contact Message"}`,
      html: `
        <h3>New Contact Message</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Subject:</b> ${subject || "-"}</p>
        <p><b>Message:</b><br/>${message}</p>
      `,
    });

    res.send("OK");
  } catch (error) {
    console.error("EMAIL ERROR:", error);
    res.status(500).send("Email sending failed");
  }
});
app.get("/", (req, res) => {
  res.send("Backend is running");
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
