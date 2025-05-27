import express from 'express';
import client from '../db/turso.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await client.execute({
      sql: 'SELECT * FROM users WHERE username = ? AND password = ?',
      args: [username, password],
    });

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({ message: 'Login successful' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login error', error: err.message });
  }
});

export default router;
