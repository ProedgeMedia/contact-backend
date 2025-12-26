import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";

dotenv.config();

const app = express();
const upload = multer();

app.use(cors());

app.post("/contact", upload.none(), async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    console.log("FORM DATA:", req.body);

    if (!name || !email || !message) {
      return res.status(400).send("Missing required fields");
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Website Contact" <${process.env.SMTP_USER}>`,
      to: process.env.MAIL_TO,
      replyTo: email,
      subject: `[Proedge Website] ${subject || "New Contact Message"}`,
      html: `
        <h3>New Contact Message</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Subject:</b> ${subject}</p>
        <p><b>Message:</b><br/>${message}</p>
      `,
    });

    res.send("OK");

  } catch (error) {
    console.error("EMAIL ERROR:", error);
    res.status(500).send("Email sending failed");
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});
