const router = require("express").Router();

const transporter = require("../utils/mail");

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

                    <p>
                        Hi <strong>${username}</strong>,
                    </p>

                    <p>
                        Your account was created successfully and you're now ready
                        to start creating gift lists, adding friends, and sharing ideas.
                    </p>

                    <p>
                        We're excited to have you here 🎁
                    </p>

                    <hr style="margin: 24px 0;" />

                    <p style="font-size: 12px; color: #666;">
                        This email was sent automatically by mygiftlist.com.
                    </p>
                </div>
            `
        });

        res.json({
            success: true
        });
    } catch (err) {
        console.error("WELCOME EMAIL ERROR:", err);

        res.status(500).json({
            success: false,
            error: "Failed to send welcome email"
        });
    }
});

module.exports = router;