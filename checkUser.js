
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./db/otazora.sqlite');

db.all('SELECT * FROM users', [], (err, rows) => {
  if (err) {
    throw err;
  }
  console.log("Users in database:");
  console.log(rows);
});

db.close();
