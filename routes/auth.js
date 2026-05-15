const router = require("express").Router();
const db = require("../db");
const { comparePassword, hashPassword } = require("../utils/hash");

/* ================= LOGIN BY EMAIL ================= */
router.post("/login/email", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.json({ success: false, error: "Missing fields" });

    const [rows] = await db.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
    );

    if (!rows.length)
        return res.json({ success: false, error: "User not found" });

    const user = rows[0];

    const match = await comparePassword(password, user.password);

    if (!match)
        return res.json({ success: false, error: "Invalid password" });

    return res.json({
        success: true,
        user: {
            uid: user.uid,
            username: user.username,
            email: user.email,
            fullname: user.fullname,
            profile_image: user.profile_image
        }
    });
});

/* ================= LOGIN BY USERNAME ================= */
router.post("/login/username", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password)
        return res.json({ success: false, error: "Missing fields" });

    const [rows] = await db.query(
        "SELECT * FROM users WHERE username = ?",
        [username]
    );

    if (!rows.length)
        return res.json({ success: false });

    const user = rows[0];

    const match = await comparePassword(password, user.password);

    if (!match)
        return res.json({ success: false });

    return res.json({
        success: true,
        user: {
            uid: user.uid,
            username: user.username,
            email: user.email,
            fullname: user.fullname,
            profile_image: user.profile_image
        }
    });
});

/* ================= SIGNUP ================= */
router.post("/signup", async (req, res) => {
    const {
        email,
        username,
        fullname,
        date_of_birth,
        password,
        profile_image
    } = req.body;

    try {
        if (!email || !username || !fullname || !password) {
            return res.json({
                success: false,
                error: "Missing required fields"
            });
        }

        /* check duplicates */
        const [exists] = await db.query(
            "SELECT uid FROM users WHERE email = ? OR username = ?",
            [email, username]
        );

        if (exists.length > 0) {
            return res.json({
                success: false,
                error: "Email or username already exists"
            });
        }

        const hashed = await hashPassword(password);

        const [result] = await db.query(
            `INSERT INTO users 
            (email, username, fullname, date_of_birth, password, profile_image)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [email, username, fullname, date_of_birth, hashed, profile_image]
        );

        return res.json({
            success: true,
            uid: result.insertId
        });

    } catch (err) {
        console.error("SIGNUP ERROR:", err);

        return res.json({
            success: false,
            error: "Server error"
        });
    }
});

/* ================= CHECK EMAIL EXISTS ================= */
router.get("/ver/email/:email", async (req, res) => {
    const { email } = req.params;

    try {
        const [rows] = await db.query(
            "SELECT uid FROM users WHERE email = ?",
            [email]
        );

        return res.json({
            exists: rows.length > 0
        });

    } catch (err) {
        console.error("AUTH EMAIL CHECK ERROR:", err);

        return res.status(500).json({
            exists: false,
            error: "Server error"
        });
    }
});

/* ================= CHECK USERNAME EXISTS ================= */
router.get("/ver/username/:username", async (req, res) => {
    const { username } = req.params;

    try {
        const [rows] = await db.query(
            "SELECT uid FROM users WHERE username = ?",
            [username]
        );

        return res.json({
            exists: rows.length > 0
        });

    } catch (err) {
        console.error("AUTH USERNAME CHECK ERROR:", err);

        return res.status(500).json({
            exists: false,
            error: "Server error"
        });
    }
});

module.exports = router;