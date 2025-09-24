
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/otazora.sqlite');

// Show all tables
db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, rows) => {
  if (err) throw err;

  console.log("Tables in database:");
  rows.forEach(row => console.log(" - " + row.name));

  // Now dump contents of each table
  console.log("\n=== USERS TABLE ===");
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) console.error("Users error:", err.message);
    else console.table(rows);
  });

  console.log("\n=== FEEDBACK TABLE ===");
  db.all("SELECT * FROM feedback", [], (err, rows) => {
    if (err) console.error("Feedback error:", err.message);
    else console.table(rows);
  });

  console.log("\n=== PRODUCTS TABLE ===");
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) console.error("Products error:", err.message);
    else console.table(rows);
  });
});

db.close();

