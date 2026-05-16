const express = require('express');
const { dbRun, dbGet, dbAll } = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let q = 'SELECT * FROM products WHERE 1=1'; const p = [];
    if (category && category !== 'all') { q += ' AND category = ?'; p.push(category); }
    if (search) { q += ' AND (name LIKE ? OR description LIKE ?)'; p.push(`%${search}%`, `%${search}%`); }
    if (sort === 'price_low') q += ' ORDER BY price ASC';
    else if (sort === 'price_high') q += ' ORDER BY price DESC';
    else if (sort === 'rating') q += ' ORDER BY rating DESC';
    else q += ' ORDER BY is_bestseller DESC, created_at DESC';
    res.json(dbAll(q, p));
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

router.get('/cart/items', authenticateToken, (req, res) => {
  try {
    const items = dbAll('SELECT ci.id, ci.quantity, p.id as product_id, p.name, p.price, p.image, p.category FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.user_id = ?', [req.user.id]);
    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
    res.json({ items, total, count: items.length });
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

router.post('/cart', authenticateToken, (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    const existing = dbGet('SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?', [req.user.id, product_id]);
    if (existing) dbRun('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?', [quantity, existing.id]);
    else dbRun('INSERT INTO cart_items (user_id,product_id,quantity) VALUES (?,?,?)', [req.user.id, product_id, quantity]);
    const count = dbGet('SELECT SUM(quantity) as count FROM cart_items WHERE user_id = ?', [req.user.id]);
    res.json({ message: 'Added to cart.', cartCount: count ? count.count : 0 });
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

router.put('/cart/:id', authenticateToken, (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity <= 0) dbRun('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    else dbRun('UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?', [quantity, req.params.id, req.user.id]);
    res.json({ message: 'Cart updated.' });
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

router.delete('/cart/:id', authenticateToken, (req, res) => {
  try {
    dbRun('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Removed from cart.' });
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

router.post('/cart/checkout', authenticateToken, (req, res) => {
  try {
    const { shipping_address } = req.body;
    const items = dbAll('SELECT ci.quantity, p.price, p.id as product_id FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.user_id = ?', [req.user.id]);
    if (!items.length) return res.status(400).json({ error: 'Cart is empty.' });
    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const orderResult = dbRun('INSERT INTO orders (user_id,total,shipping_address) VALUES (?,?,?)', [req.user.id, total, shipping_address]);
    items.forEach(i => dbRun('INSERT INTO order_items (order_id,product_id,quantity,price) VALUES (?,?,?,?)', [orderResult.lastInsertRowid, i.product_id, i.quantity, i.price]));
    dbRun('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
    res.json({ message: 'Order placed!', orderId: orderResult.lastInsertRowid, total });
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

router.get('/:id', (req, res) => {
  try {
    const product = dbGet('SELECT * FROM products WHERE id = ?', [parseInt(req.params.id)]);
    if (!product) return res.status(404).json({ error: 'Not found.' });
    res.json(product);
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

module.exports = router;
