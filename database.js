const initSqlJs = require('sql.js');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'barbershop.db');
let db = null;

async function initializeDatabase() {
  const SQL = await initSqlJs();

  // Load existing DB or create new
  if (fs.existsSync(DB_PATH)) {
    const buf = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buf);
  } else {
    db = new SQL.Database();
  }

  // Create tables
  db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, phone TEXT, role TEXT DEFAULT 'customer', created_at TEXT DEFAULT (datetime('now')))`);
  db.run(`CREATE TABLE IF NOT EXISTS barbers (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, title TEXT, bio TEXT, image TEXT, specialties TEXT, created_at TEXT DEFAULT (datetime('now')))`);
  db.run(`CREATE TABLE IF NOT EXISTS services (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT, price REAL NOT NULL, duration INTEGER DEFAULT 30, image TEXT, created_at TEXT DEFAULT (datetime('now')))`);
  db.run(`CREATE TABLE IF NOT EXISTS haircuts (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT, length_category TEXT DEFAULT 'all', hair_type TEXT DEFAULT 'all', image TEXT, tags TEXT, is_signature INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')))`);
  db.run(`CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, price REAL NOT NULL, category TEXT NOT NULL, description TEXT, image TEXT, rating REAL DEFAULT 0, reviews_count INTEGER DEFAULT 0, is_bestseller INTEGER DEFAULT 0, stock INTEGER DEFAULT 100, created_at TEXT DEFAULT (datetime('now')))`);
  db.run(`CREATE TABLE IF NOT EXISTS bookings (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, barber_id INTEGER, service_id INTEGER, booking_date TEXT NOT NULL, booking_time TEXT NOT NULL, status TEXT DEFAULT 'pending', notes TEXT, created_at TEXT DEFAULT (datetime('now')))`);
  db.run(`CREATE TABLE IF NOT EXISTS cart_items (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, product_id INTEGER NOT NULL, quantity INTEGER DEFAULT 1, created_at TEXT DEFAULT (datetime('now')))`);
  db.run(`CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, total REAL NOT NULL, status TEXT DEFAULT 'pending', shipping_address TEXT, created_at TEXT DEFAULT (datetime('now')))`);
  db.run(`CREATE TABLE IF NOT EXISTS order_items (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id INTEGER NOT NULL, product_id INTEGER NOT NULL, quantity INTEGER NOT NULL, price REAL NOT NULL)`);
  db.run(`CREATE TABLE IF NOT EXISTS testimonials (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, rating INTEGER NOT NULL, text TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')))`);

  // Seed if empty
  const res = db.exec("SELECT COUNT(*) as count FROM users");
  if (!res.length || res[0].values[0][0] === 0) seedData();

  saveDb();
  return db;
}

function saveDb() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

// Helper methods matching better-sqlite3 API
function getDb() { return db; }

function dbRun(sql, params = []) {
  db.run(sql, params);
  saveDb();
  return { lastInsertRowid: db.exec("SELECT last_insert_rowid()")[0].values[0][0] };
}

function dbGet(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) {
    const cols = stmt.getColumnNames();
    const vals = stmt.get();
    stmt.free();
    const obj = {};
    cols.forEach((c, i) => obj[c] = vals[i]);
    return obj;
  }
  stmt.free();
  return null;
}

function dbAll(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    const cols = stmt.getColumnNames();
    const vals = stmt.get();
    const obj = {};
    cols.forEach((c, i) => obj[c] = vals[i]);
    results.push(obj);
  }
  stmt.free();
  return results;
}

function seedData() {
  const ap = bcrypt.hashSync('admin123', 10);
  const cp = bcrypt.hashSync('customer123', 10);

  db.run("INSERT INTO users (name,email,password,phone,role) VALUES (?,?,?,?,?)", ['Admin', 'admin@ironandgold.com', ap, '08123456789', 'admin']);
  db.run("INSERT INTO users (name,email,password,phone,role) VALUES (?,?,?,?,?)", ['John Doe', 'john@example.com', cp, '08987654321', 'customer']);

  db.run("INSERT INTO barbers (name,title,bio,image,specialties) VALUES (?,?,?,?,?)", ['James Sterling', 'Master Barber', '15+ years of experience in classic cuts with modern twist.', '/images/barber1.jpg', 'Classic Cuts, Fades']);
  db.run("INSERT INTO barbers (name,title,bio,image,specialties) VALUES (?,?,?,?,?)", ['Elena Rossi', 'Senior Stylist', 'Italian elegance. Trained in Milan, excels at textured styles.', '/images/barber2.jpg', 'Textured Styles, Beard Design']);
  db.run("INSERT INTO barbers (name,title,bio,image,specialties) VALUES (?,?,?,?,?)", ['Marcus Thorne', 'Fade Specialist', 'Precision fades and modern styles. Multiple award winner.', '/images/barber3.jpg', 'Skin Fades, Designs']);
  db.run("INSERT INTO barbers (name,title,bio,image,specialties) VALUES (?,?,?,?,?)", ['David Chen', 'Grooming Expert', 'Eastern and Western grooming techniques combined.', '/images/barber4.jpg', 'Grooming, Scalp Care']);

  db.run("INSERT INTO services (name,description,price,duration,image) VALUES (?,?,?,?,?)", ['Signature Haircut', 'Premium haircut with consultation, shampoo, cut, and style.', 65, 45, '/images/service1.jpg']);
  db.run("INSERT INTO services (name,description,price,duration,image) VALUES (?,?,?,?,?)", ['Beard Sculpting', 'Expert beard trimming and shaping with hot towel treatment.', 45, 30, '/images/service2.jpg']);
  db.run("INSERT INTO services (name,description,price,duration,image) VALUES (?,?,?,?,?)", ['Royal Shave', 'Traditional straight razor shave with premium products.', 40, 40, '/images/service3.jpg']);
  db.run("INSERT INTO services (name,description,price,duration,image) VALUES (?,?,?,?,?)", ['The Executive Experience', 'Signature cut, beard sculpting, charcoal face mask, and premium wash.', 110, 90, '/images/service4.jpg']);

  db.run("INSERT INTO haircuts (name,description,length_category,hair_type,image,tags,is_signature) VALUES (?,?,?,?,?,?,?)", ['The Executive Fade', 'Precision tapered sides with a high-volume textured top.', 'short', 'all', '/images/haircut1.jpg', '["Bold","Sharp"]', 1]);
  db.run("INSERT INTO haircuts (name,description,length_category,hair_type,image,tags,is_signature) VALUES (?,?,?,?,?,?,?)", ['Modern Pomp', 'High-shine, classic silhouette with maximum hold.', 'mid', 'straight', '/images/haircut2.jpg', '["Classic","Elegant"]', 0]);
  db.run("INSERT INTO haircuts (name,description,length_category,hair_type,image,tags,is_signature) VALUES (?,?,?,?,?,?,?)", ['Sculpted Buzz', 'Minimal maintenance, maximum impact.', 'short', 'all', '/images/haircut3.jpg', '["Clean","Modern"]', 0]);
  db.run("INSERT INTO haircuts (name,description,length_category,hair_type,image,tags,is_signature) VALUES (?,?,?,?,?,?,?)", ['Textured Crop', 'A messy yet controlled aesthetic for natural hair types.', 'short', 'wavy', '/images/haircut4.jpg', '["Casual","Trendy"]', 0]);
  db.run("INSERT INTO haircuts (name,description,length_category,hair_type,image,tags,is_signature) VALUES (?,?,?,?,?,?,?)", ["Gentleman's Part", 'Timeless symmetry paired with a modern hard line.', 'mid', 'straight', '/images/haircut5.jpg', '["Classic","Professional"]', 0]);

  db.run("INSERT INTO products (name,price,category,description,image,rating,reviews_count,is_bestseller) VALUES (?,?,?,?,?,?,?,?)", ['Matte Grit Pomade', 28.00, 'pomades', 'High-hold, zero shine finish. Perfect for textured styles.', '/images/product1.jpg', 4.5, 124, 1]);
  db.run("INSERT INTO products (name,price,category,description,image,rating,reviews_count,is_bestseller) VALUES (?,?,?,?,?,?,?,?)", ['Cedar & Smoke Oil', 34.00, 'beard_oils', 'Natural oils and essential extracts to soften even the roughest beards.', '/images/product2.jpg', 4.7, 89, 0]);
  db.run("INSERT INTO products (name,price,category,description,image,rating,reviews_count,is_bestseller) VALUES (?,?,?,?,?,?,?,?)", ['Daily Tonic Wash', 22.00, 'shampoos', 'Sulfate-free cleanser with menthol and tea tree oil.', '/images/product3.jpg', 4.3, 45, 0]);
  db.run("INSERT INTO products (name,price,category,description,image,rating,reviews_count,is_bestseller) VALUES (?,?,?,?,?,?,?,?)", ['Signature Comb', 18.00, 'accessories', 'Anti-static, hand-polished acetate comb.', '/images/product4.jpg', 4.8, 210, 0]);
  db.run("INSERT INTO products (name,price,category,description,image,rating,reviews_count,is_bestseller) VALUES (?,?,?,?,?,?,?,?)", ['Sculpting Balm', 30.00, 'pomades', 'Maximum control for flyaways with deep conditioning.', '/images/product5.jpg', 4.4, 67, 0]);
  db.run("INSERT INTO products (name,price,category,description,image,rating,reviews_count,is_bestseller) VALUES (?,?,?,?,?,?,?,?)", ['Gold Reserve Aftershave', 42.00, 'aftershaves', 'Sophisticated cooling mist with bourbon and leather hints.', '/images/product6.jpg', 4.6, 31, 0]);

  db.run("INSERT INTO testimonials (name,rating,text) VALUES (?,?,?)", ['Michael R.', 5, "The best barbershop I've ever visited. The attention to detail is unmatched."]);
  db.run("INSERT INTO testimonials (name,rating,text) VALUES (?,?,?)", ['Thomas W.', 5, "Iron & Gold has been my go-to for two years. The beard sculpting is phenomenal."]);
  db.run("INSERT INTO testimonials (name,rating,text) VALUES (?,?,?)", ['Alexander K.', 5, "From the moment you walk in, you feel the luxury. Simply outstanding."]);
}

module.exports = { initializeDatabase, getDb, dbRun, dbGet, dbAll, saveDb };
