const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 9003;

require("dotenv").config();

app.use(cors());
app.use(express.json());

/* ROUTES */
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/lists", require("./routes/lists"));
app.use("/api/friends", require("./routes/friends"));
app.use("/api/events", require("./routes/events"));
app.use("/api/mail", require("./routes/mailer"));

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
});