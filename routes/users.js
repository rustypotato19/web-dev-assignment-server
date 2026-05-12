const router = require("express").Router();
const db = require("../db");

/* SEARCH USERS */
router.get("/search/:query", async (req, res) => {
    const { query } = req.params;

    try {
        const result = await db.query(
            `SELECT uid, username, fullname, profile_image
             FROM users
             WHERE username ILIKE $1
                OR fullname ILIKE $1
             ORDER BY
                CASE
                    WHEN username ILIKE $2 THEN 0
                    ELSE 1
                END,
                username ASC
             LIMIT 15`,
            [`%${query}%`, `${query}%`]
        );

        return res.json(result.rows);

    } catch (err) {
        console.error("SEARCH USERS ERROR:", err);

        return res.status(500).json({
            success: false,
            error: "Server error"
        });
    }
});

/* GET USER BY UID */
router.get("/:uid", async (req, res) => {
    const { uid } = req.params;

    const result = await db.query(
        `SELECT uid, email, username, fullname, date_of_birth, profile_image, created, updated
     FROM users WHERE uid = $1`,
        [uid]
    );

    if (!result.rows.length)
        return res.status(404).json({ error: "User not found" });

    res.json(result.rows[0]);
});

/* GET USER BY Username */
router.get("/username/:username", async (req, res) => {
    const { username } = req.params;

    const result = await db.query(
        `SELECT uid, email, username, fullname, date_of_birth, profile_image, created, updated
     FROM users WHERE username = $1`,
        [username]
    );

    if (!result.rows.length)
        return res.status(404).json({ error: "User not found" });

    res.json(result.rows[0]);
});

/* UPDATE USERNAME */
router.put("/username/:username", async (req, res) => {
    const { username } = req.params;
    const { newUsername } = req.body;

    const result = await db.query(
        `UPDATE users SET username = $1 WHERE username = $2 RETURNING *`,
        [newUsername, username]
    );

    if (!result.rows.length)
        return res.status(404).json({ error: "User not found" });

    res.json(result.rows[0]);
});

/* UPDATE FULL NAME */
router.put("/fullname/:uid", async (req, res) => {
    const { uid } = req.params;
    const { newFullname } = req.body;

    const result = await db.query(
        `UPDATE users SET fullname = $1 WHERE uid = $2 RETURNING *`,
        [newFullname, uid]
    );

    if (!result.rows.length)
        return res.status(404).json({ error: "User not found" });

    res.json(result.rows[0]);
});

/* UPDATE PROFILE IMAGE */
router.put("/profile-image/:uid", async (req, res) => {
    const { uid } = req.params;
    const { newProfileImage } = req.body;

    const result = await db.query(
        `UPDATE users SET profile_image = $1 WHERE uid = $2 RETURNING *`,
        [newProfileImage, uid]
    );

    if (!result.rows.length)
        return res.status(404).json({ error: "User not found" });

    res.json(result.rows[0]);
});

/* UPDATE USER EMAIL */
router.put("/email/:uid", async (req, res) => {
    const { uid } = req.params;
    const { newEmail } = req.body;

    const result = await db.query(
        `UPDATE users SET email = $1 WHERE uid = $2 RETURNING *`,
        [newEmail, uid]
    );

    if (!result.rows.length)
        return res.status(404).json({ error: "User not found" });

    res.json(result.rows[0]);
});

/* UPDATE USER DATE OF BIRTH */
router.put("/date-of-birth/:uid", async (req, res) => {
    const { uid } = req.params;
    const { newDateOfBirth } = req.body;

    const result = await db.query(
        `UPDATE users SET date_of_birth = $1 WHERE uid = $2 RETURNING *`,
        [newDateOfBirth, uid]
    );

    if (!result.rows.length)
        return res.status(404).json({ error: "User not found" });

    res.json(result.rows[0]);
});

/* UPDATE USER PASSWORD */
router.put("/password/:uid", async (req, res) => {
    const { uid } = req.params;
    const { newPassword } = req.body;

    const result = await db.query(
        `UPDATE users SET password = $1 WHERE uid = $2 RETURNING *`,
        [newPassword, uid]
    );

    if (!result.rows.length)
        return res.status(404).json({ error: "User not found" });

    res.json(result.rows[0]);
});

/* DELETE USER */
router.delete("/:uid", async (req, res) => {
    const { uid } = req.params;

    const result = await db.query(
        `DELETE FROM users WHERE uid = $1 RETURNING *`,
        [uid]
    );

    if (!result.rows.length)
        return res.status(404).json({ error: "User not found" });

    res.json(result.rows[0]);
});

module.exports = router;