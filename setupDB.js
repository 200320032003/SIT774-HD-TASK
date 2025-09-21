<<<<<<< HEAD
const sqlite3 = require('sqlite3').verbose();

// Open or create the database file
let db = new sqlite3.Database('./db/otazora.sqlite', (err) => {
  if (err) {
    console.error('Error opening database: ' + err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      dob TEXT NOT NULL,
      password TEXT NOT NULL
    )
  `);

  // Feedback table
  db.run(`
    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 🔹 Drop and recreate Products table
  db.run(`DROP TABLE IF EXISTS products`, (err) => {
    if (err) console.error("Error dropping products table:", err.message);
    else console.log("Old products table dropped.");
  });

  db.run(`
    CREATE TABLE products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      page TEXT NOT NULL
    )
  `, (err) => {
    if (err) console.error('Error creating products table:', err.message);
    else console.log('Products table recreated with UNIQUE name.');
  });

  // Drawings table
  db.run(`
    CREATE TABLE IF NOT EXISTS drawings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      data TEXT NOT NULL,   -- JSON or Base64 string of the drawing
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('Error creating drawings table:', err.message);
    else console.log('Drawings table created or already exists.');
  });
});

// Close database AFTER serialize finishes
db.close((err) => {
  if (err) console.error('Error closing DB: ' + err.message);
  else console.log('Database setup complete and closed.');
});
=======
const sqlite3 = require('sqlite3').verbose();

// Open or create the database file
let db = new sqlite3.Database('./db/otazora.sqlite', (err) => {
  if (err) {
    console.error('Error opening database: ' + err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      dob TEXT NOT NULL,
      password TEXT NOT NULL
    )
  `);

  // Feedback table
  db.run(`
    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 🔹 Drop and recreate Products table
  db.run(`DROP TABLE IF EXISTS products`, (err) => {
    if (err) console.error("Error dropping products table:", err.message);
    else console.log("Old products table dropped.");
  });

  db.run(`
    CREATE TABLE products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      page TEXT NOT NULL
    )
  `, (err) => {
    if (err) console.error('Error creating products table:', err.message);
    else console.log('Products table recreated with UNIQUE name.');
  });

  // Drawings table
  db.run(`
    CREATE TABLE IF NOT EXISTS drawings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      data TEXT NOT NULL,   -- JSON or Base64 string of the drawing
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('Error creating drawings table:', err.message);
    else console.log('Drawings table created or already exists.');
  });
});

// Close database AFTER serialize finishes
db.close((err) => {
  if (err) console.error('Error closing DB: ' + err.message);
  else console.log('Database setup complete and closed.');
});
>>>>>>> 4c5ccae6bf4a1764a2582ba495180a709a428126
