const express = require('express');
const mysql = require('mysql2/promise');
const morgan = require('morgan');
const dotenv = require('dotenv');
const expressListEndpoints = require("express-list-endpoints");
const cors = require("cors");

dotenv.config();

// Database Defaults
const DB_DEFAULTS = {
    HOST: "localhost",
    USER: "root",
    PASSWORD: "root",
    DATABASE: "tutorial"
};

const pool = mysql.createPool({
    host: process.env.HOST || DB_DEFAULTS.HOST,
    user: process.env.USERNAME || DB_DEFAULTS.USER,
    password: process.env.PASSWORD || DB_DEFAULTS.PASSWORD,
    database: process.env.DATABASE || DB_DEFAULTS.DATABASE,
    ssl: {
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
app.use(express.json());

// Functions
const getSanitizedEndpoints = () => {
    const originalEndpoints = expressListEndpoints(app);
    return originalEndpoints.map(({ middlewares, ...sanitizedEndpoint }) => sanitizedEndpoint);
}

// Routes
app.get('/', (req, res) => {
    res.json({ 
        msg: "hello World",
        endpoints: getSanitizedEndpoints()
    });
});

app.get('/db-test', async (req, res) => {
    try {
        await pool.execute('SELECT 1');
        res.json({ msg: "Database connection successful" });
    } catch (err) {
        console.error('Database connection test failed:', err);
        res.status(500).send('Failed to connect to database');
    }
});

app.get('/microposts', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM microposts');
        res.json(rows);
    } catch (err) {
        console.error('Error querying database:', err);
        res.status(500).send('Failed to retrieve microposts');
    }
});

app.post('/microposts', async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) {
            return res.status(400).send('Content is required');
        }

        const [result] = await pool.execute('INSERT INTO microposts (content) VALUES (?)', [content]);
        res.status(201).json({ id: result.insertId, content });

    } catch (err) {
        console.error('Error inserting micropost:', err);
        res.status(500).send('Failed to add micropost');
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
