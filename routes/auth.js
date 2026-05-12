const router = require("express").Router();
const db = require("../db");
const { comparePassword, hashPassword } = require("../utils/hash");

router.post("/login/email", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.json({ success: false, error: "Missing fields" });

    const result = await db.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
    );

    if (!result.rows.length)
        return res.json({ success: false });

    const user = result.rows[0];

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


router.post("/login/username", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password)
        return res.json({ success: false, error: "Missing fields" });

    const result = await db.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
    );

    if (!result.rows.length)
        return res.json({ success: false });

    const user = result.rows[0];

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

        // prevent duplicates
        const exists = await db.query(
            `SELECT uid FROM users WHERE email = $1 OR username = $2`,
            [email, username]
        );

        if (exists.rows.length > 0) {
            return res.json({
                success: false,
                error: "Email or username already exists"
            });
        }

        const hashed = await hashPassword(password);

        const result = await db.query(
            `INSERT INTO users 
            (email, username, fullname, date_of_birth, password, profile_image)
            VALUES ($1,$2,$3,$4,$5,$6)
            RETURNING uid`,
            [email, username, fullname, date_of_birth, hashed, profile_image]
        );

        res.json({
            success: true,
            uid: result.rows[0].uid
        });

    } catch (err) {
        console.error("SIGNUP ERROR:", err);

        res.json({
            success: false,
            error: "Server error"
        });
    }
});

/* Check if email exists */
router.get("/ver/email/:email", async (req, res) => {
    const { email } = req.params;

    try {
        const result = await db.query(
            "SELECT uid FROM users WHERE email = $1",
            [email]
        );

        return res.json({
            exists: result.rows.length > 0
        });

    } catch (err) {
        console.error("AUTH EMAIL CHECK ERROR:", err);

        return res.status(500).json({
            exists: false,
            error: "Server error"
        });
    }
});

/* Check if username exists */
router.get("/ver/username/:username", async (req, res) => {
    const { username } = req.params;

    try {
        const result = await db.query(
            "SELECT uid FROM users WHERE username = $1",
            [username]
        );

        return res.json({
            exists: result.rows.length > 0
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