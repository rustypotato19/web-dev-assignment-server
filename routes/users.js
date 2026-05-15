const router = require("express").Router();
const db = require("../db");

/* ================= SEARCH USERS ================= */
router.get("/search/:query", async (req, res) => {
    const { query } = req.params;

    try {
        const [rows] = await db.query(
            `SELECT uid, username, fullname, profile_image
             FROM users
             WHERE username LIKE ?
                OR fullname LIKE ?
             ORDER BY
                CASE
                    WHEN username LIKE ? THEN 0
                    ELSE 1
                END,
                username ASC
             LIMIT 15`,
            [`%${query}%`, `%${query}%`, `${query}%`]
        );

        return res.json(rows);

    } catch (err) {
        console.error("SEARCH USERS ERROR:", err);

        return res.status(500).json({
            success: false,
            error: "Server error"
        });
    }
});

/* ================= GET USER BY UID ================= */
router.get("/id/:uid", async (req, res) => {
    const { uid } = req.params;

    const [rows] = await db.query(
        `SELECT uid, email, username, fullname, date_of_birth, profile_image, created, updated
         FROM users
         WHERE uid = ?`,
        [uid]
    );

    if (!rows.length)
        return res.status(404).json({ error: "User not found" });

    res.json(rows[0]);
});

/* ================= GET USER BY USERNAME ================= */
router.get("/username/:username", async (req, res) => {
    const { username } = req.params;

    const [rows] = await db.query(
        `SELECT uid, email, username, fullname, date_of_birth, profile_image, created, updated
         FROM users
         WHERE username = ?`,
        [username]
    );

    if (!rows.length)
        return res.status(404).json({ error: "User not found" });

    res.json(rows[0]);
});

/* ================= UPDATE USERNAME ================= */
router.put("/username/:username", async (req, res) => {
    const { username } = req.params;
    const { newUsername } = req.body;

    const [result] = await db.query(
        `UPDATE users SET username = ?
         WHERE username = ?`,
        [newUsername, username]
    );

    if (result.affectedRows === 0)
        return res.status(404).json({ error: "User not found" });

    const [rows] = await db.query(
        "SELECT * FROM users WHERE username = ?",
        [newUsername]
    );

    res.json(rows[0]);
});

/* ================= UPDATE FULL NAME ================= */
router.put("/fullname/:uid", async (req, res) => {
    const { uid } = req.params;
    const { newFullname } = req.body;

    const [result] = await db.query(
        `UPDATE users SET fullname = ?
         WHERE uid = ?`,
        [newFullname, uid]
    );

    if (result.affectedRows === 0)
        return res.status(404).json({ error: "User not found" });

    const [rows] = await db.query(
        "SELECT * FROM users WHERE uid = ?",
        [uid]
    );

    res.json(rows[0]);
});

/* ================= UPDATE PROFILE IMAGE ================= */
router.put("/profile-image/:uid", async (req, res) => {
    const { uid } = req.params;
    const { newProfileImage } = req.body;

    const [result] = await db.query(
        `UPDATE users SET profile_image = ?
         WHERE uid = ?`,
        [newProfileImage, uid]
    );

    if (result.affectedRows === 0)
        return res.status(404).json({ error: "User not found" });

    const [rows] = await db.query(
        "SELECT * FROM users WHERE uid = ?",
        [uid]
    );

    res.json(rows[0]);
});

/* ================= UPDATE EMAIL ================= */
router.put("/email/:uid", async (req, res) => {
    const { uid } = req.params;
    const { newEmail } = req.body;

    const [result] = await db.query(
        `UPDATE users SET email = ?
         WHERE uid = ?`,
        [newEmail, uid]
    );

    if (result.affectedRows === 0)
        return res.status(404).json({ error: "User not found" });

    const [rows] = await db.query(
        "SELECT * FROM users WHERE uid = ?",
        [uid]
    );

    res.json(rows[0]);
});

/* ================= UPDATE DATE OF BIRTH ================= */
router.put("/date-of-birth/:uid", async (req, res) => {
    const { uid } = req.params;
    const { newDateOfBirth } = req.body;

    const [result] = await db.query(
        `UPDATE users SET date_of_birth = ?
         WHERE uid = ?`,
        [newDateOfBirth, uid]
    );

    if (result.affectedRows === 0)
        return res.status(404).json({ error: "User not found" });

    const [rows] = await db.query(
        "SELECT * FROM users WHERE uid = ?",
        [uid]
    );

    res.json(rows[0]);
});

/* ================= UPDATE PASSWORD ================= */
router.put("/password/:uid", async (req, res) => {
    const { uid } = req.params;
    const { newPassword } = req.body;

    const [result] = await db.query(
        `UPDATE users SET password = ?
         WHERE uid = ?`,
        [newPassword, uid]
    );

    if (result.affectedRows === 0)
        return res.status(404).json({ error: "User not found" });

    const [rows] = await db.query(
        "SELECT * FROM users WHERE uid = ?",
        [uid]
    );

    res.json(rows[0]);
});

/* ================= DELETE USER ================= */
router.delete("/:uid", async (req, res) => {
    const { uid } = req.params;

    const [result] = await db.query(
        `DELETE FROM users WHERE uid = ?`,
        [uid]
    );

    if (result.affectedRows === 0)
        return res.status(404).json({ error: "User not found" });

    res.json({
        success: true,
        deleted: uid
    });
});

module.exports = router;