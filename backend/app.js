import express from 'express';
import db from './src/db/index.js';

const app = express();
app.use(express.json());

// Example route to test connection
app.get('/test', (req, res) => {
    db.query('SELECT 1 + 1 AS solution', (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Query failed' });
        }
        res.json({ result: results[0].solution });
    });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
