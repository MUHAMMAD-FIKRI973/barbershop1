const express = require('express');
const { dbAll, dbGet } = require('../database');
const router = express.Router();

router.get('/', (req, res) => {
  try {
    const { length, hair_type } = req.query;
    let q = 'SELECT * FROM haircuts WHERE 1=1'; const p = [];
    if (length && length !== 'all') { q += ' AND length_category = ?'; p.push(length); }
    if (hair_type && hair_type !== 'all') { q += ' AND hair_type = ?'; p.push(hair_type); }
    q += ' ORDER BY is_signature DESC, created_at DESC';
    const haircuts = dbAll(q, p).map(h => ({ ...h, tags: h.tags ? JSON.parse(h.tags) : [] }));
    res.json(haircuts);
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

router.get('/:id', (req, res) => {
  try {
    const h = dbGet('SELECT * FROM haircuts WHERE id = ?', [parseInt(req.params.id)]);
    if (!h) return res.status(404).json({ error: 'Not found.' });
    h.tags = h.tags ? JSON.parse(h.tags) : [];
    res.json(h);
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

module.exports = router;
