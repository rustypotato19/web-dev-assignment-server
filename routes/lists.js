const router = require("express").Router();
const db = require("../db");

/* ================= GET OWNED LISTS ================= */
router.get("/user/:uid", async (req, res) => {
    const { uid } = req.params;

    const [rows] = await db.query(
        "SELECT * FROM lists WHERE owner_uid = ?",
        [uid]
    );

    res.json(rows);
});

/* ================= GET LIST BY ID ================= */
router.get("/user/list/:listid", async (req, res) => {
    const { listid } = req.params;

    const [rows] = await db.query(
        "SELECT * FROM lists WHERE listid = ?",
        [listid]
    );

    if (rows.length === 0) {
        return res.status(404).json({
            success: false,
            error: "List not found"
        });
    }

    res.json(rows[0]);
});

/* ================= GET MEMBER LISTS ================= */
router.get("/member/:uid", async (req, res) => {
    const { uid } = req.params;

    try {
        const [rows] = await db.query(
            `SELECT l.*
             FROM lists l
             JOIN list_members m ON l.listid = m.listid
             WHERE m.member_uid = ?`,
            [uid]
        );

        return res.json(rows);

    } catch (err) {
        console.error("GET MEMBER LISTS ERROR:", err);

        return res.status(500).json({
            success: false,
            error: "Server error"
        });
    }
});

/* ================= GET MEMBERS (UID) IN A LIST ================= */
router.get("/members/:listid", async (req, res) => {
    const { listid } = req.params;

    try {
        const [rows] = await db.query(
            `SELECT member_uid
             FROM list_members
             WHERE listid = ?`,
            [listid]
        );

        // flatten into clean array: [1,2,3]
        const members = rows.map(r => r.member_uid);

        return res.json(members);

    } catch (err) {
        console.error("GET LIST MEMBERS ERROR:", err);

        return res.status(500).json({
            success: false,
            error: "Server error"
        });
    }
});

/* ================= GET LIST ITEMS ================= */
router.get("/items/:listid", async (req, res) => {
    const { listid } = req.params;

    try {
        const [rows] = await db.query(
            `SELECT *
             FROM list_items
             WHERE listid = ?
             ORDER BY created ASC`,
            [listid]
        );

        return res.json(rows);

    } catch (err) {
        console.error("GET LIST ITEMS ERROR:", err);

        return res.status(500).json({
            success: false,
            error: "Server error"
        });
    }
});

/* ================= CREATE ITEM ================= */
router.post("/items/create/:listid", async (req, res) => {
    const { listid } = req.params;
    const { name, description, link } = req.body;

    if (!name) {
        return res.json({
            success: false,
            error: "Missing name"
        });
    }

    try {
        const [result] = await db.query(
            `INSERT INTO list_items (listid, name, description, link)
             VALUES (?, ?, ?, ?)`,
            [listid, name, description || null, link || null]
        );

        const [rows] = await db.query(
            "SELECT * FROM list_items WHERE itemid = ?",
            [result.insertId]
        );

        return res.json(rows[0]);

    } catch (err) {
        console.error("CREATE ITEM ERROR:", err);

        return res.status(500).json({
            success: false,
            error: "Server error"
        });
    }
});

/* ================= DELETE ITEM ================= */
router.delete("/items/delete/:itemid", async (req, res) => {
    const { itemid } = req.params;

    try {
        const [result] = await db.query(
            `DELETE FROM list_items
             WHERE itemid = ?`,
            [itemid]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: "Item not found"
            });
        }

        return res.json({
            success: true,
            deleted: itemid
        });

    } catch (err) {
        console.error("DELETE ITEM ERROR:", err);

        return res.status(500).json({
            success: false,
            error: "Server error"
        });
    }
});

/* ================= UPDATE ITEM ================= */
router.put("/items/update/:itemid", async (req, res) => {
    const { itemid } = req.params;
    const { name, description, link } = req.body;

    try {
        await db.query(
            `UPDATE list_items
             SET name = COALESCE(?, name),
                 description = COALESCE(?, description),
                 link = COALESCE(?, link)
             WHERE itemid = ?`,
            [name, description, link, itemid]
        );

        const [rows] = await db.query(
            "SELECT * FROM list_items WHERE itemid = ?",
            [itemid]
        );

        return res.json(rows[0]);

    } catch (err) {
        console.error("UPDATE ITEM ERROR:", err);

        return res.status(500).json({
            success: false,
            error: "Server error"
        });
    }
});

/* ================= CREATE LIST ================= */
router.post("/create/:uid", async (req, res) => {
    const { uid } = req.params;
    const { name, description } = req.body;

    if (!name) {
        return res.json({
            success: false,
            error: "Missing name"
        });
    }

    try {
        const [result] = await db.query(
            `INSERT INTO lists (owner_uid, name, description)
             VALUES (?, ?, ?)`,
            [uid, name, description || null]
        );

        const listid = result.insertId;

        await db.query(
            `INSERT INTO list_members (listid, member_uid)
             VALUES (?, ?)`,
            [listid, uid]
        );

        const [rows] = await db.query(
            "SELECT * FROM lists WHERE listid = ?",
            [listid]
        );

        return res.json({
            success: true,
            list: rows[0]
        });

    } catch (err) {
        console.error("CREATE LIST ERROR:", err);

        return res.json({
            success: false,
            error: "Server error"
        });
    }
});

/* ================= UPDATE LIST ================= */
router.put("/update/:listid", async (req, res) => {
    const { listid } = req.params;
    const { name, description } = req.body;

    try {
        await db.query(
            `UPDATE lists
             SET name = COALESCE(?, name),
                 description = COALESCE(?, description)
             WHERE listid = ?`,
            [name, description, listid]
        );

        const [rows] = await db.query(
            "SELECT * FROM lists WHERE listid = ?",
            [listid]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: "List not found"
            });
        }

        return res.json(rows[0]);

    } catch (err) {
        console.error("UPDATE LIST ERROR:", err);

        return res.status(500).json({
            success: false,
            error: "Server error"
        });
    }
});

/* ================= DELETE LIST ================= */
router.delete("/delete/:listid", async (req, res) => {
    const { listid } = req.params;

    try {
        const [result] = await db.query(
            `DELETE FROM lists WHERE listid = ?`,
            [listid]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: "List not found"
            });
        }

        return res.json({
            success: true,
            deleted: listid
        });

    } catch (err) {
        console.error("DELETE LIST ERROR:", err);

        return res.status(500).json({
            success: false,
            error: "Server error"
        });
    }
});

/* ================= JOIN LIST ================= */
router.post("/join", async (req, res) => {
    const { uid, listid } = req.body;

    if (!uid || !listid) {
        return res.json({
            success: false,
            error: "Missing uid or listid"
        });
    }

    try {
        await db.query(
            `INSERT IGNORE INTO list_members (listid, member_uid)
             VALUES (?, ?)`,
            [listid, uid]
        );

        return res.json({
            success: true
        });

    } catch (err) {
        console.error("JOIN ERROR:", err);

        return res.json({
            success: false,
            error: "Server error"
        });
    }
});

module.exports = router;