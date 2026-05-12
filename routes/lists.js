const router = require("express").Router();
const db = require("../db");

/* GET ALL OWNED LISTS */
router.get("/user/:uid", async (req, res) => {
    const { uid } = req.params;

    const result = await db.query(
        "SELECT * FROM lists WHERE owner_uid = $1",
        [uid]
    );

    res.json(result.rows);
});

/* GET LIST BY ID */
router.get("/user/list/:listid", async (req, res) => {
    const { listid } = req.params;

    const result = await db.query(
        "SELECT * FROM lists WHERE listid = $1",
        [listid]
    );

    if (result.rowCount === 0) {
        return res.status(404).json({
            success: false,
            error: "List not found"
        });
    }

    res.json(result.rows[0]);
});

/* GET ALL MEMBER LISTS */
router.get("/member/:uid", async (req, res) => {
    const { uid } = req.params;

    const result = await db.query(
        `SELECT l.*
     FROM lists l
     JOIN list_members m ON l.listid = m.listid
     WHERE m.member_uid = $1`,
        [uid]
    );

    res.json(result.rows);
});

/* GET LIST ITEMS */
router.get("/items/:listid", async (req, res) => {
    const { listid } = req.params;

    try {
        const result = await db.query(
            `SELECT *
             FROM list_items
             WHERE listid = $1
             ORDER BY created ASC`,
            [listid]
        );

        return res.json(result.rows);
    } catch (err) {
        console.error("GET LIST ITEMS ERROR:", err);

        return res.status(500).json({
            success: false,
            error: "Server error"
        });
    }
});

/* CREATE ITEM */
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
        const result = await db.query(
            `INSERT INTO list_items (listid, name, description, link)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [listid, name, description || null, link || null]
        );

        return res.json(result.rows[0]);
    } catch (err) {
        console.error("CREATE ITEM ERROR:", err);

        return res.status(500).json({
            success: false,
            error: "Server error"
        });
    }
});

/* DELETE ITEM */
router.delete("/items/delete/:itemid", async (req, res) => {
    const { itemid } = req.params;

    try {
        const result = await db.query(
            `DELETE FROM list_items
             WHERE itemid = $1
             RETURNING itemid`,
            [itemid]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                error: "Item not found"
            });
        }

        return res.json({
            success: true,
            deleted: result.rows[0].itemid
        });
    } catch (err) {
        console.error("DELETE ITEM ERROR:", err);

        return res.status(500).json({
            success: false,
            error: "Server error"
        });
    }
});

/* UPDATE ITEM */
router.put("/items/update/:itemid", async (req, res) => {
    const { itemid } = req.params;
    const { name, description, link } = req.body;

    try {
        const result = await db.query(
            `UPDATE list_items
             SET name = COALESCE($1, name),
                 description = COALESCE($2, description),
                 link = COALESCE($3, link)
             WHERE itemid = $4
             RETURNING *`,
            [name, description, link, itemid]
        );

        return res.json(result.rows[0]);
    } catch (err) {
        console.error("UPDATE ITEM ERROR:", err);

        return res.status(500).json({
            success: false,
            error: "Server error"
        });
    }
});

/* CREATE LIST */
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
        // 1. create list
        const result = await db.query(
            `INSERT INTO lists (owner_uid, name, description)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [uid, name, description || null]
        );

        const list = result.rows[0];

        // 2. automatically add creator as member
        await db.query(
            `INSERT INTO list_members (listid, member_uid)
             VALUES ($1, $2)`,
            [list.listid, uid]
        );

        return res.json({
            success: true,
            list
        });

    } catch (err) {
        console.error("CREATE LIST ERROR:", err);

        return res.json({
            success: false,
            error: "Server error"
        });
    }
});

/* UPDATE LIST */
router.put("/update/:listid", async (req, res) => {
    const { listid } = req.params;
    const { name, description } = req.body;

    try {
        const result = await db.query(
            `UPDATE lists
             SET name = COALESCE($1, name),
                 description = COALESCE($2, description)
             WHERE listid = $3
             RETURNING *`,
            [name, description, listid]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                error: "List not found"
            });
        }

        return res.json(result.rows[0]);

    } catch (err) {
        console.error("UPDATE LIST ERROR:", err);

        return res.status(500).json({
            success: false,
            error: "Server error"
        });
    }
});

/* DELETE LIST BY LIST UID */
router.delete("/delete/:listid", async (req, res) => {
    const { listid } = req.params;

    try {
        const result = await db.query(
            `DELETE FROM lists
             WHERE listid = $1
             RETURNING listid`,
            [listid]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                error: "List not found"
            });
        }

        return res.json({
            success: true,
            deleted: result.rows[0].listid
        });
    } catch (err) {
        console.error("DELETE LIST ERROR:", err);

        return res.status(500).json({
            success: false,
            error: "Server error"
        });
    }
});

/* JOIN LIST */
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
            `INSERT INTO list_members (listid, member_uid)
             VALUES ($1, $2)`,
            [listid, uid]
        );

        return res.json({
            success: true
        });

    } catch (err) {
        // duplicate key (already member)
        if (err.code === "23505") {
            return res.json({
                success: false,
                error: "Already a member"
            });
        }

        // foreign key violation (bad uid/listid)
        if (err.code === "23503") {
            return res.json({
                success: false,
                error: "Invalid user or list"
            });
        }

        console.error("JOIN ERROR:", err);

        return res.json({
            success: false,
            error: "Server error"
        });
    }
});

module.exports = router;