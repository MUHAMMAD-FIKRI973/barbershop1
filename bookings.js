const express = require('express');
const { dbRun, dbGet, dbAll } = require('../database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

router.get('/barbers', (req, res) => { try { res.json(dbAll('SELECT * FROM barbers')); } catch(e) { res.status(500).json({error:'Server error.'}); }});
router.get('/services', (req, res) => { try { res.json(dbAll('SELECT * FROM services')); } catch(e) { res.status(500).json({error:'Server error.'}); }});
router.get('/testimonials', (req, res) => { try { res.json(dbAll('SELECT * FROM testimonials')); } catch(e) { res.status(500).json({error:'Server error.'}); }});

router.post('/', authenticateToken, (req, res) => {
  try {
    const { barber_id, service_id, booking_date, booking_time, notes } = req.body;
    if (!barber_id || !service_id || !booking_date || !booking_time) return res.status(400).json({ error: 'All fields required.' });
    const existing = dbGet("SELECT id FROM bookings WHERE barber_id=? AND booking_date=? AND booking_time=? AND status != 'cancelled'", [barber_id, booking_date, booking_time]);
    if (existing) return res.status(400).json({ error: 'Time slot already booked.' });
    const result = dbRun('INSERT INTO bookings (user_id,barber_id,service_id,booking_date,booking_time,notes) VALUES (?,?,?,?,?,?)', [req.user.id, barber_id, service_id, booking_date, booking_time, notes]);
    res.status(201).json({ message: 'Booking confirmed!', bookingId: result.lastInsertRowid });
  } catch(e) { res.status(500).json({ error: 'Server error.' }); }
});

router.get('/my', authenticateToken, (req, res) => {
  try {
    res.json(dbAll('SELECT b.*, br.name as barber_name, s.name as service_name, s.price FROM bookings b JOIN barbers br ON b.barber_id=br.id JOIN services s ON b.service_id=s.id WHERE b.user_id=? ORDER BY b.booking_date DESC', [req.user.id]));
  } catch(e) { res.status(500).json({ error: 'Server error.' }); }
});

router.get('/all', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' });
    res.json(dbAll('SELECT b.*, u.name as customer_name, u.email as customer_email, br.name as barber_name, s.name as service_name, s.price FROM bookings b JOIN users u ON b.user_id=u.id JOIN barbers br ON b.barber_id=br.id JOIN services s ON b.service_id=s.id ORDER BY b.booking_date DESC'));
  } catch(e) { res.status(500).json({ error: 'Server error.' }); }
});

router.put('/:id/cancel', authenticateToken, (req, res) => {
  try {
    dbRun("UPDATE bookings SET status='cancelled' WHERE id=? AND user_id=?", [req.params.id, req.user.id]);
    res.json({ message: 'Booking cancelled.' });
  } catch(e) { res.status(500).json({ error: 'Server error.' }); }
});

module.exports = router;
