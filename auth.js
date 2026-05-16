const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbRun, dbGet, dbAll } = require('../database');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');
const router = express.Router();

router.post('/register', (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required.' });
    const existing = dbGet('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) return res.status(400).json({ error: 'Email already registered.' });
    const hashed = bcrypt.hashSync(password, 10);
    const result = dbRun('INSERT INTO users (name,email,password,phone) VALUES (?,?,?,?)', [name, email, hashed, phone || null]);
    const token = jwt.sign({ id: result.lastInsertRowid, email, name, role: 'customer' }, JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ message: 'Account created.', token, user: { id: result.lastInsertRowid, name, email, role: 'customer' } });
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

router.post('/login', (req, res) => {
  try {
    const { email, password, remember } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
    const user = dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid email or password.' });
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: remember ? '30d' : '24h' });
    res.json({ message: 'Login successful.', token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

router.get('/profile', authenticateToken, (req, res) => {
  try {
    const user = dbGet('SELECT id,name,email,phone,role,created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

module.exports = router;
