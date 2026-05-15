const router = require("express").Router();
const db = require("../db");

/* ================= USER EVENTS ================= */
router.get("/user/:uid", async (req, res) => {
    const { uid } = req.params;

    const [rows] = await db.query(
        "SELECT * FROM user_events WHERE uid = ?",
        [uid]
    );

    res.json(rows);
});

/* ================= CREATE USER EVENT ================= */
router.post("/user/create/:uid", async (req, res) => {
    const { uid } = req.params;
    const { name, date } = req.body;

    const [result] = await db.query(
        `INSERT INTO user_events (uid, name, date)
         VALUES (?, ?, ?)`,
        [uid, name, date]
    );

    /* MySQL insertId → re-fetch full row */
    const [rows] = await db.query(
        "SELECT * FROM user_events WHERE eventid = ?",
        [result.insertId]
    );

    res.json(rows[0]);
});

/* ================= DELETE USER EVENT ================= */
router.delete("/user/delete/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            `DELETE FROM user_events
             WHERE eventid = ?`,
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Event not found",
            });
        }

        return res.json({
            success: true,
            deleted: id,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Server error deleting event",
        });
    }
});

/* ================= FIXED EVENTS ================= */
router.get("/fixed", async (req, res) => {
    try {
        /* delete expired fixed events */
        await db.query(`
            DELETE FROM fixed_events
            WHERE date < CURDATE()
        `);

        const [rows] = await db.query(
            "SELECT * FROM fixed_events ORDER BY date ASC"
        );

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch fixed events",
        });
    }
});

module.exports = router;