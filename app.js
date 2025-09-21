
// ================== Dependencies ==================
const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;
const saltRounds = 10; // strength of hashing

// ================== Middleware ==================
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(bodyParser.json({ limit: '10mb' }));

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session middleware
app.use(
  session({
    secret: 'your-secret-key', // replace with random string
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // true only if HTTPS
  })
);

// Serve static files (HTML, CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// ================== Database Setup ==================
const db = new sqlite3.Database('./db/otazora.sqlite', (err) => {
  if (err) console.error('Error opening database: ' + err.message);
  else console.log('Connected to SQLite database.');
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      dob TEXT NOT NULL,
      password TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      page TEXT NOT NULL
    )
  `);

  db.run(
    `
    CREATE TABLE IF NOT EXISTS drawings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      data TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `,
    (err) => {
      if (err) console.error('Error creating drawings table:', err.message);
      else console.log('Drawings table ready.');
    }
  );
});

// ================== Routes ==================

// (1) Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'HOMEPAGE.html'));
});

// (2) Shop search route
app.get('/search', (req, res) => {
  const q = req.query.q || '';
  db.all(`SELECT * FROM products WHERE name LIKE ?`, [`%${q}%`], (err, rows) => {
    if (err) {
      console.error('Error searching products:', err.message);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json({ success: true, products: rows });
  });
});

// ================== Secure Auth Routes ==================

// Register (with hashed password)
app.post('/register', async (req, res) => {
  const { email, dob, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    db.run(
      'INSERT INTO users (email, dob, password) VALUES (?, ?, ?)',
      [email, dob, hashedPassword],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res
              .status(400)
              .json({ success: false, message: 'Email already registered.' });
          }
          return res
            .status(500)
            .json({ success: false, message: err.message });
        }
        console.log(`New user registered: ${email}`);
        res.json({ success: true, message: 'Registration successful!' });
      }
    );
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Login (with sessions)
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err) {
      console.error('Error fetching user:', err.message);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    if (!user) {
      console.log("Login failed: user not found ->", email);
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log("Login failed: incorrect password ->", email);
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Save session
    req.session.user = { id: user.id, email: user.email };
    console.log("User logged in. Session started:", req.session.user);
    res.json({ success: true, message: `Welcome ${user.email}` });
  });
});

// Profile
app.get('/profile', (req, res) => {
  if (!req.session.user) {
    console.log("Profile access blocked – no session found.");
    return res.status(401).json({ success: false, message: 'Not logged in' });
  }
  console.log("Profile accessed by:", req.session.user.email);
  res.json({
    success: true,
    message: `Hello ${req.session.user.email}, this is your profile.`,
  });
});

// Logout
app.post('/logout', (req, res) => {
  console.log("Logging out user:", req.session.user?.email);
  req.session.destroy(() => {
    console.log("Session destroyed");
    res.json({ success: true, message: 'Logged out successfully' });
  });
});


// Protected route example
app.get('/profile', (req, res) => {
  if (!req.session.user) {
    return res
      .status(401)
      .json({ success: false, message: 'Not logged in' });
  }
  res.json({
    success: true,
    message: `Hello ${req.session.user.email}, this is your profile.`,
  });
});

// ================== Drawing Routes ==================

// (3) Save a drawing
app.post('/drawings', (req, res) => {
  const { userId, data } = req.body;

  if (!data) {
    return res
      .status(400)
      .json({ success: false, message: 'Drawing data is required' });
  }

  db.run(
    `INSERT INTO drawings (userId, data) VALUES (?, ?)`,
    [userId || null, data],
    function (err) {
      if (err) {
        console.error('Error saving drawing:', err.message);
        return res
          .status(500)
          .json({ success: false, message: 'Database error' });
      }

      // Terminal log
      console.log(`Drawing saved for user ${userId || "guest"} with ID ${this.lastID}`);

      res.json({
        success: true,
        id: this.lastID,
        message: 'Drawing saved!',
      });
    }
  );
});

// (4) Fetch all drawings
app.get('/drawings', (req, res) => {
  db.all(`SELECT * FROM drawings ORDER BY created_at DESC`, [], (err, rows) => {
    if (err) {
      console.error('Error fetching drawings:', err.message);
      return res
        .status(500)
        .json({ success: false, message: 'Database error' });
    }
    res.json({ success: true, drawings: rows });
  });
});

// (5) Fetch a single drawing by ID
app.get('/drawings/:id', (req, res) => {
  const { id } = req.params;
  db.get(`SELECT * FROM drawings WHERE id = ?`, [id], (err, row) => {
    if (err) {
      console.error('Error fetching drawing:', err.message);
      return res
        .status(500)
        .json({ success: false, message: 'Database error' });
    }
    if (!row)
      return res
        .status(404)
        .json({ success: false, message: 'Drawing not found' });
    res.json({ success: true, drawing: row });
  });
});

// (6) Delete a drawing by ID
app.delete('/drawings/:id', (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM drawings WHERE id = ?`, [id], function (err) {
    if (err) {
      console.error('Error deleting drawing:', err.message);
      return res
        .status(500)
        .json({ success: false, message: 'Database error' });
    }
    if (this.changes === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'Drawing not found' });
    }
    res.json({ success: true, message: `Drawing ${id} deleted.` });
  });
});

// ================== Extra Routes for HD Task ==================

// (7) Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is healthy!' });
});

// (8) About project route
app.get('/about', (req, res) => {
  res.json({ project: 'OtaZora SketchPad', version: '1.0', author: 'Oshadhi' });
});

// (9) Help / usage info route
app.get('/help', (req, res) => {
  res.json({
    usage: 'Use /search?q= to search products, /drawings to manage sketches',
    contact: 'contactus@OtaZora',
  });
});

// (10) Delete ALL drawings
app.delete('/drawings', (req, res) => {
  db.run(`DELETE FROM drawings`, function (err) {
    if (err) {
      console.error('Error clearing drawings:', err.message);
      return res
        .status(500)
        .json({ success: false, message: 'Database error' });
    }
    res.json({ success: true, message: 'All drawings cleared.' });
  });
});

// (11) Render products dynamically
app.get('/products', (req, res) => {
  db.all(`SELECT * FROM products`, [], (err, rows) => {
    if (err) {
      console.error('Error fetching products:', err.message);
      return res.status(500).send('Database error');
    }
    res.render('products', { products: rows });
  });
});

// (12) Show all feedback
app.get('/feedback', (req, res) => {
  db.all(`SELECT * FROM feedback ORDER BY created_at DESC`, [], (err, rows) => {
    if (err) {
      console.error('Error fetching feedback:', err.message);
      return res.status(500).send('Database error');
    }
    res.render('feedback', { feedback: rows });
  });
});

// ================== Start Server ==================
app.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`);
});
