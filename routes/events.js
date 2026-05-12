const router = require("express").Router();
const db = require("../db");

/* USER EVENTS */
router.get("/user/:uid", async (req, res) => {
    const { uid } = req.params;

    const result = await db.query(
        "SELECT * FROM user_events WHERE uid = $1",
        [uid]
    );

    res.json(result.rows);
});

/* CREATE USER EVENT */
router.post("/user/create/:uid", async (req, res) => {
    const { uid } = req.params;
    const { name, date } = req.body;

    const result = await db.query(
        `INSERT INTO user_events (uid, name, date)
         VALUES ($1,$2,$3)
         RETURNING *`,
        [uid, name, date]
    );

    res.json(result.rows[0]);
});

/* DELETE USER EVENT */
router.delete("/user/delete/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            `
            DELETE FROM user_events
            WHERE eventid = $1
            RETURNING eventid
            `,
            [id],
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Event not found",
            });
        }

        return res.json({
            success: true,
            deleted: result.rows[0].eventid,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Server error deleting event",
        });
    }
});

/* FIXED EVENTS */
router.get("/fixed", async (req, res) => {
    await db.query(`
        DELETE FROM fixed_events
        WHERE date < CURRENT_DATE
    `);

    const result = await db.query(
        "SELECT * FROM fixed_events ORDER BY date ASC"
    );

    res.json(result.rows);
});

module.exports = router;