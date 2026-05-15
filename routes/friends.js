const router = require("express").Router();
const db = require("../db");

/* ================= GET FRIENDS ================= */
router.get("/:uid", async (req, res) => {
    const { uid } = req.params;

    try {
        const [rows] = await db.query(
            `SELECT
                u.uid,
                u.username,
                u.fullname,
                u.email,
                u.profile_image
             FROM user_friends f
             JOIN users u
                ON u.uid = f.friend_uid
             WHERE f.user_uid = ?`,
            [uid]
        );

        return res.json({
            friends: rows
        });

    } catch (err) {
        console.error("GET FRIENDS ERROR:", err);

        return res.status(500).json({
            success: false,
            error: "Server error"
        });
    }
});

/* ================= ADD FRIEND (BIDIRECTIONAL) ================= */
router.post("/add", async (req, res) => {
    const { user_uid, friend_uid } = req.body;

    if (!user_uid || !friend_uid) {
        return res.json({
            success: false,
            error: "Missing user_uid or friend_uid"
        });
    }

    if (Number(user_uid) === Number(friend_uid)) {
        return res.json({
            success: false,
            error: "Cannot add yourself"
        });
    }

    try {
        /* insert both directions */
        await db.query(
            `INSERT IGNORE INTO user_friends (user_uid, friend_uid)
             VALUES (?, ?)`,
            [user_uid, friend_uid]
        );

        await db.query(
            `INSERT IGNORE INTO user_friends (user_uid, friend_uid)
             VALUES (?, ?)`,
            [friend_uid, user_uid]
        );

        return res.json({
            success: true
        });

    } catch (err) {
        console.error("ADD FRIEND ERROR:", err);

        return res.status(500).json({
            success: false,
            error: "Server error"
        });
    }
});

/* ================= REMOVE FRIEND (BIDIRECTIONAL) ================= */
router.delete("/remove", async (req, res) => {
    const { user_uid, friend_uid } = req.body;

    try {
        await db.query(
            `DELETE FROM user_friends
             WHERE user_uid = ? AND friend_uid = ?`,
            [user_uid, friend_uid]
        );

        await db.query(
            `DELETE FROM user_friends
             WHERE user_uid = ? AND friend_uid = ?`,
            [friend_uid, user_uid]
        );

        return res.json({
            success: true
        });

    } catch (err) {
        console.error("REMOVE FRIEND ERROR:", err);

        return res.status(500).json({
            success: false,
            error: "Server error"
        });
    }
});

module.exports = router;