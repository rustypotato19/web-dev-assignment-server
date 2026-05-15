const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 9003;

/* ================= MIDDLEWARE ================= */

app.use(
    cors({
        origin: "*",
        credentials: true
    })
);

app.use(express.json({ limit: "2mb" }));

/* ================= ROUTES ================= */
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/lists", require("./routes/lists"));
app.use("/api/friends", require("./routes/friends"));
app.use("/api/events", require("./routes/events"));
app.use("/api/mail", require("./routes/mailer"));

/* ================= HEALTH CHECK ================= */
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        uptime: process.uptime(),
        timestamp: Date.now()
    });
});

/* ================= START SERVER ================= */
app.listen(PORT, "127.0.0.1", () => {
    console.log(`API running on http://127.0.0.1:${PORT}`);
});