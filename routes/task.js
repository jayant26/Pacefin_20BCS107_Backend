const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
    const pool = req.pool;
    const { title, description, username } = req.body;

    if (!title || !description || !username) {
        return res.status(400).json({ error: "Title, Description, and username are required" });
    }

    pool.getConnection((err, connection) => {
        if (err) {
            console.error("Error connecting to MySQL:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
        const query = 'INSERT INTO tasks (title, description, username) VALUES (?, ?, ?)';
        connection.query(query, [title, description, username], (err, result) => {
            connection.release();

            if (err) {
                console.error("Error inserting task : ", err);
                return res.status(500).json({ error: "Internal server error" });
            }
            res.status(201).json({ message: "Task inserted successfully" });
        });
    });
});




router.get('/:id', (req, res) => {
    const pool = req.pool;
    const taskId = req.params.id;
    pool.getConnection((err, connection) => {
        if (err) {
            console.error("Error connecting to MySQL:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
        const query = 'SELECT * FROM tasks WHERE id = ?';
        connection.query(query, [taskId], (err, result) => {
            connection.release();

            if (err) {
                console.error("Error retrieving task: ", err);
                return res.status(500).json({ error: "Internal server error" });
            }

            if (result.length === 0) {
                return res.status(404).json({ error: "Task not found" });
            }

            const task = result[0];
            res.status(200).json({ task });
        });
    });
});

router.put('/:id', (req, res) => {
    const pool = req.pool;
    const taskId = req.params.id;
    const { title, description, username } = req.body;

    if(!title||!description||!username)
    {
        return res.status(400).json({error:"Title,Description,username are required"});
    }
    pool.getConnection((err, connection) => {
        if (err) {
            console.error("Error connecting to MySQL:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
        const query = 'UPDATE tasks SET title = ?, description = ?, username = ? WHERE id = ?';
    
        connection.query(query, [title,description,username,taskId], (err, result) => {
            connection.release();

            if (err) {
                console.error("Error updating task: ", err);
                return res.status(500).json({ error: "Internal server error" });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Task not found" });
            }

            res.status(200).json({ message: "Task updated successfully" });
        });
    });
});



router.delete('/:id', (req, res) => {
    const pool = req.pool;
    const taskId = req.params.id;

    pool.getConnection((err, connection) => {
        if (err) {
            console.error("Error connecting to MySQL:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
        const query = 'DELETE FROM tasks WHERE id = ?';
        connection.query(query, [taskId], (err, result) => {
            connection.release();

            if (err) {
                console.error("Error deleting task: ", err);
                return res.status(500).json({ error: "Internal server error" });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Task not found" });
            }

            res.status(200).json({ message: "Task deleted successfully" });
        });
    });
});







module.exports = router;
