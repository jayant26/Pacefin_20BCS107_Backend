const express = require('express');
const mysql = require('mysql');
const app = express();
const dotenv = require('dotenv');
const taskRoutes = require('./routes/task');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database:process.env.DB_DBNAME,
    connectionLimit: 5
});

app.use((req, res, next) => {
    req.pool = pool;
    next();
});

function executeQuery(connection, query, successMessage, errorMessage, callback) {
    connection.query(query, (err, result) => {
        if (err) {
            console.error(errorMessage, err);
        } else {
            if (result.affectedRows > 0) {
                console.log(successMessage);
            }
        }
        if (callback && typeof callback === 'function') {
            callback();
        }
    });
}
pool.getConnection((err, connection) => {
    if (err) {
        console.error("Error Connecting to MySQL:", err);
        return;
    }
    console.log("Connected Successfully");

    executeQuery(connection, `CREATE DATABASE IF NOT EXISTS ${process.env.DB_DBNAME}`, 'Database Created Successfully', 'Error Creating Database : ', () => {
    
        executeQuery(connection, `USE PACEFIN`, 'Using Database Successfully', 'Error accessing Database : ', () => {
    
            executeQuery(connection, `
                CREATE TABLE IF NOT EXISTS tasks (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(300) NOT NULL,
                    description TEXT NOT NULL,
                    username VARCHAR(50) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                );
            `, 'Table created successfully', 'Error creating Table : ', () => {
                connection.release();
            });
        });
    });
});

app.use('/tasks', taskRoutes);

app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({error: {message: error.message}
    });
});

const port = 3001;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
