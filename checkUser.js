<<<<<<< HEAD
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
=======
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
>>>>>>> 4c5ccae6bf4a1764a2582ba495180a709a428126
