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

    // const transporter = nodemailer.createTransport({
    //   host: process.env.SMTP_HOST,
    //   port: Number(process.env.SMTP_PORT),
    //   secure: false,
    //   auth: {
    //     user: process.env.SMTP_USER,
    //     pass: process.env.SMTP_PASS,
    //   },
    // });
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true, // 🔥 REQUIRED for port 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 10000, // 10s
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });
    
    await transporter.sendMail({
      from: "Proedge Website <info@proedgemedia.com>",
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
    console.error("EMAIL ERROR FULL DETAILS:", {
      message: error.message,
      code: error.code,
      response: error.response,
      stack: error.stack,
    });
  
    return res.status(500).json({
      error: "Email sending failed",
      details: error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
