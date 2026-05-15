const nodemailer = require("nodemailer");

if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("[MAIL] Missing Gmail environment variables");
}

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

/* verify connection on startup (helps catch config issues early) */
transporter.verify((error, success) => {
    if (error) {
        console.error("[MAIL] SMTP connection failed:", error);
    } else {
        console.log("[MAIL] SMTP ready");
    }
});

module.exports = transporter;