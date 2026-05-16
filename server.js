const express = require('express');
const path = require('path');
const cors = require('cors');
const { initializeDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Start server after DB is ready
initializeDatabase().then(() => {
  const authRoutes = require('./routes/auth');
  const productRoutes = require('./routes/products');
  const bookingRoutes = require('./routes/bookings');
  const haircutRoutes = require('./routes/haircuts');

  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/haircuts', haircutRoutes);

  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
  });

  app.listen(PORT, () => {
    console.log(`\n  Iron & Gold Barbershop Server`);
    console.log(`  Running at http://localhost:${PORT}`);
    console.log(`  Database initialized with seed data\n`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
