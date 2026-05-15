const router = require("express").Router();
const transporter = require("../utils/mail");

/* ================= WELCOME EMAIL ================= */
router.post("/welcome", async (req, res) => {
    const { email, username } = req.body;

    if (!email || !username) {
        return res.status(400).json({
            success: false,
            error: "Missing email or username"
        });
    }

    try {
        await transporter.sendMail({
            from: `"mygiftlist.com" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: "Welcome to mygiftlist.com! 🎉",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h1 style="color: #16a34a;">
                        Welcome to mygiftlist.com!
                    </h1>

                    <p>Hi <strong>${escapeHtml(username)}</strong>,</p>

                    <p>
                        Your account was created successfully and you're now ready
                        to start creating gift lists, adding friends, and sharing ideas.
                    </p>

                    <p>We're excited to have you here 🎁</p>

                    <hr style="margin: 24px 0;" />

                    <p style="font-size: 12px; color: #666;">
                        This email was sent automatically by mygiftlist.com.
                    </p>
                </div>
            `
        });

        return res.json({ success: true });

    } catch (err) {
        console.error("WELCOME EMAIL ERROR:", err);

        return res.status(500).json({
            success: false,
            error: "Failed to send welcome email"
        });
    }
});

/* ================= CONTACT EMAIL ================= */
router.post("/contact", async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({
            success: false,
            error: "Missing fields"
        });
    }

    try {
        await transporter.sendMail({
            from: `"Website Contact" <${process.env.GMAIL_USER}>`,
            to: process.env.GMAIL_USER,
            subject: `New Contact Form Message from ${name}`,
            html: `
                <div style="font-family: Arial, sans-serif;">
                    <h2>New Contact Form Submission</h2>

                    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
                    <p><strong>Email:</strong> ${escapeHtml(email)}</p>

                    <hr />

                    <p><strong>Message:</strong></p>
                    <p>${escapeHtml(message)}</p>
                </div>
            `
        });

        return res.json({ success: true });

    } catch (err) {
        console.error("CONTACT EMAIL ERROR:", err);

        return res.status(500).json({
            success: false,
            error: "Failed to send email"
        });
    }
});

/* ================= BASIC HTML ESCAPE ================= */
function escapeHtml(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

module.exports = router;