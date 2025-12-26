import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import axios from "axios";

dotenv.config();

const app = express();
const upload = multer();

app.use(cors());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.post("/contact", upload.none(), async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    console.log("FORM DATA:", req.body);

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Proedge Website",
          email: "info@proedgemedia.com", // must be VERIFIED sender
        },
        to: process.env.MAIL_TO.split(",").map((mail) => ({
          email: mail.trim(),
        })),
        replyTo: {
          email,
          name,
        },
        subject: `[Proedge Website] ${subject || "New Contact Message"}`,
        htmlContent: `
          <h3>New Contact Message</h3>
          <p><b>Name:</b> ${name}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Subject:</b> ${subject}</p>
          <p><b>Message:</b><br/>${message}</p>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    res.send("OK");

  } catch (error) {
    console.error("BREVO API ERROR:", error.response?.data || error.message);
    res.status(500).json({
      error: "Email sending failed",
      details: error.response?.data || error.message,
    });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});
