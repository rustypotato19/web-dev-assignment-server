const router = require("express").Router();
const db = require("../db");
const { hashPassword } = require("../utils/hash");

const SAFE_USER_FIELDS = `
    uid,
    email,
    username,
    fullname,
    date_of_birth,
    profile_image,
    created,
    updated
`;

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
    try {
        const { uid } = req.params;

        const [rows] = await db.query(
            `SELECT ${SAFE_USER_FIELDS}
             FROM users
             WHERE uid = ?`,
            [uid]
        );

        if (!rows.length) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        return res.json(rows[0]);

    } catch (err) {
        console.error("GET USER BY UID ERROR:", err);

        return res.status(500).json({
            success: false,
            error: "Server error"
        });
    }
});

/* ================= GET USER BY USERNAME ================= */
router.get("/username/:username", async (req, res) => {
    try {
        const { username } = req.params;

        const [rows] = await db.query(
            `SELECT ${SAFE_USER_FIELDS}
             FROM users
             WHERE username = ?`,
            [username]
        );

        if (!rows.length) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        return res.json(rows[0]);

    } catch (err) {
        console.error("GET USER BY USERNAME ERROR:", err);

        return res.status(500).json({
            success: false,
            error: "Server error"
        });
    }
});

/* ================= UPDATE USERNAME ================= */
router.put("/username/:username", async (req, res) => {
    try {
        const { username } = req.params;
        const { newUsername } = req.body;

        if (!newUsername) {
            return res.status(400).json({
                success: false,
                error: "Missing username"
            });
        }

        const [result] = await db.query(
            `UPDATE users
             SET username = ?
             WHERE username = ?`,
            [newUsername, username]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        const [rows] = await db.query(
            `SELECT ${SAFE_USER_FIELDS}
             FROM users
             WHERE username = ?`,
            [newUsername]
        );

        return res.json(rows[0]);

    } catch (err) {
        console.error("UPDATE USERNAME ERROR:", err);

        return res.status(500).json({
            success: false,
            error: "Server error"
        });
    }
});

/* ================= UPDATE FULL NAME ================= */
router.put("/fullname/:uid", async (req, res) => {
    try {
        const { uid } = req.params;
        const { newFullname } = req.body;

        if (!newFullname) {
            return res.status(400).json({
                success: false,
                error: "Missing fullname"
            });
        }

        const [result] = await db.query(
            `UPDATE users
             SET fullname = ?
             WHERE uid = ?`,
            [newFullname, uid]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        const [rows] = await db.query(
            `SELECT ${SAFE_USER_FIELDS}
             FROM users
             WHERE uid = ?`,
            [uid]
        );

        return res.json(rows[0]);

    } catch (err) {
        console.error("UPDATE FULLNAME ERROR:", err);

        return res.status(500).json({
            success: false,
            error: "Server error"
        });
    }
});

/* ================= UPDATE PROFILE IMAGE ================= */
router.put("/profile-image/:uid", async (req, res) => {
    try {
        const { uid } = req.params;
        const { newProfileImage } = req.body;

        const [result] = await db.query(
            `UPDATE users
             SET profile_image = ?
             WHERE uid = ?`,
            [newProfileImage, uid]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        const [rows] = await db.query(
            `SELECT ${SAFE_USER_FIELDS}
             FROM users
             WHERE uid = ?`,
            [uid]
        );

        return res.json(rows[0]);

    } catch (err) {
        console.error("UPDATE PROFILE IMAGE ERROR:", err);

        return res.status(500).json({
            success: false,
            error: "Server error"
        });
    }
});

/* ================= UPDATE EMAIL ================= */
router.put("/email/:uid", async (req, res) => {
    try {
        const { uid } = req.params;
        const { newEmail } = req.body;

        if (!newEmail) {
            return res.status(400).json({
                success: false,
                error: "Missing email"
            });
        }

        const [result] = await db.query(
            `UPDATE users
             SET email = ?
             WHERE uid = ?`,
            [newEmail, uid]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        const [rows] = await db.query(
            `SELECT ${SAFE_USER_FIELDS}
             FROM users
             WHERE uid = ?`,
            [uid]
        );

        return res.json(rows[0]);

    } catch (err) {
        console.error("UPDATE EMAIL ERROR:", err);

        return res.status(500).json({
            success: false,
            error: "Server error"
        });
    }
});

/* ================= UPDATE DATE OF BIRTH ================= */
router.put("/date-of-birth/:uid", async (req, res) => {
    try {
        const { uid } = req.params;
        const { newDateOfBirth } = req.body;

        const [result] = await db.query(
            `UPDATE users
             SET date_of_birth = ?
             WHERE uid = ?`,
            [newDateOfBirth, uid]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        const [rows] = await db.query(
            `SELECT ${SAFE_USER_FIELDS}
             FROM users
             WHERE uid = ?`,
            [uid]
        );

        return res.json(rows[0]);

    } catch (err) {
        console.error("UPDATE DATE OF BIRTH ERROR:", err);

        return res.status(500).json({
            success: false,
            error: "Server error"
        });
    }
});

/* ================= UPDATE PASSWORD ================= */
router.put("/password/:uid", async (req, res) => {
    try {
        const { uid } = req.params;
        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({
                success: false,
                error: "Missing password"
            });
        }

        console.log("RAW PASSWORD:", newPassword);

        const hashedPassword = await hashPassword(newPassword);

        console.log("HASHED PASSWORD:", hashedPassword);

        const [result] = await db.query(
            `UPDATE users
             SET password = ?
             WHERE uid = ?`,
            [hashedPassword, uid]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        return res.json({
            success: true
        });

    } catch (err) {
        console.error("UPDATE PASSWORD ERROR:", err);

        return res.status(500).json({
            success: false,
            error: "Server error"
        });
    }
});

/* ================= DELETE USER ================= */
router.delete("/:uid", async (req, res) => {
    try {
        const { uid } = req.params;

        const [result] = await db.query(
            `DELETE FROM users
             WHERE uid = ?`,
            [uid]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        return res.json({
            success: true,
            deleted: uid
        });

    } catch (err) {
        console.error("DELETE USER ERROR:", err);

        return res.status(500).json({
            success: false,
            error: "Server error"
        });
    }
});

module.exports = router;