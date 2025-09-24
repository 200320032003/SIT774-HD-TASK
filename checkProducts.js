
const sqlite3 = require('sqlite3').verbose();

// Open DB
let db = new sqlite3.Database('./db/otazora.sqlite');

const products = [
  // === New Arrivals ===
  { name: "New Arrival 1", description: "Premium anime hoodie made from soft cotton, perfect for conventions and casual wear.", price: 19.99, page: "SHOP.html" },
  { name: "New Arrival 2", description: "Limited edition collectible figure with stunning details - a must-have for fans.", price: 24.99, page: "SHOP.html" },
  { name: "New Arrival 3", description: "Exclusive anime Blu-ray/DVD set with bonus artwork and behind-the-scenes content.", price: 29.99, page: "SHOP.html" },
  { name: "New Arrival 4", description: "Handcrafted anime-themed bracelet with adjustable strap, perfect for fans.", price: 34.99, page: "SHOP.html" },

  // === Popular Series ===
  { name: "Popular Series 1", description: "Official series hoodie with vibrant artwork - high-quality print and long-lasting.", price: 15.99, page: "SHOP.html" },
  { name: "Popular Series 2", description: "A full set of collectible posters featuring iconic anime scenes.", price: 22.50, page: "SHOP.html" },
  { name: "Popular Series 3", description: "Hot-selling manga box set, complete with exclusive cover art.", price: 18.75, page: "SHOP.html" },
  { name: "Popular Series 4", description: "Limited print fanbook filled with sketches and character insights.", price: 20.00, page: "SHOP.html" },

  // === Accessories ===
  { name: "Accessory 1", description: "Stylish anime keychain - durable and lightweight, perfect for everyday carry.", price: 12.99, page: "SHOP.html" },
  { name: "Accessory 2", description: "Premium enamel pin set featuring your favorite anime icons.", price: 14.50, page: "SHOP.html" },

  // === Figures ===
  { name: "Figure 1", description: "High-quality collectible figure with detailed craftsmanship and stand.", price: 45.00, page: "SHOP.html" },
  { name: "Figure 2", description: "Exclusive limited-edition anime figure for serious collectors.", price: 55.00, page: "SHOP.html" }
];

// Insert or update each product
const stmtInsert = db.prepare(`
  INSERT INTO products (name, description, price, page)
  VALUES (?, ?, ?, ?)
  ON CONFLICT(name) DO UPDATE SET
    description = excluded.description,
    price = excluded.price,
    page = excluded.page
`);

products.forEach(p => {
  stmtInsert.run(p.name, p.description, p.price, p.page);
});

stmtInsert.finalize(() => {
  console.log(" Products table updated/inserted successfully.");
  db.close();
});

