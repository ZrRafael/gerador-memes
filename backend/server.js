require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from root directory first (for JS files)
app.use(express.static(path.join(__dirname, '../')));

// Then serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.get('/api/memes', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM memes ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching memes:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Handle all other routes by serving index.html from frontend
app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
        res.status(404).json({ error: 'API endpoint not found' });
    } else {
        res.sendFile(path.join(__dirname, '../frontend/index.html'));
    }
});

// Database connection
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise();

// Create tables if they don't exist
async function initializeDatabase() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS memes (
                id BIGINT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                image_data LONGTEXT NOT NULL,
                type VARCHAR(50) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

initializeDatabase();

// Routes
// Save a new meme
app.post('/api/memes', async (req, res) => {
    const { id, title, imageUrl, type } = req.body;

    try {
        await pool.query(
            'INSERT INTO memes (id, title, image_data, type) VALUES (?, ?, ?, ?)',
            [id, title, imageUrl, type]
        );
        res.status(201).json({ message: 'Meme saved successfully' });
    } catch (error) {
        console.error('Error saving meme:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a meme
app.delete('/api/memes/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query('DELETE FROM memes WHERE id = ?', [id]);
        res.json({ message: 'Meme deleted successfully' });
    } catch (error) {
        console.error('Error deleting meme:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get a single meme
app.get('/api/memes/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await pool.query('SELECT * FROM memes WHERE id = ?', [id]);
        if (rows.length === 0) {
            res.status(404).json({ error: 'Meme not found' });
        } else {
            res.json(rows[0]);
        }
    } catch (error) {
        console.error('Error fetching meme:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 