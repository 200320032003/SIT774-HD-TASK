const express = require("express");
const session = require("express-session");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
const port = 3000;
const db = new Database("otazora.db");

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(session({
  secret: "otazora-secret",
  resave: false,
  saveUninitialized: true
}));

// Helper middleware for authentication
function requireAuth(req, res, next) {
  if (!req.session.user) return res.redirect("/login");
  next();
}

// Routes
app.get("/", (req, res) => res.render("home"));
app.get("/about", (req, res) => res.render("about"));

app.get("/shop", (req, res) => {
  const products = db.prepare("SELECT * FROM products").all();

  // Split into categories
  const newArrivals = products.filter(p => p.category === "new");
  const popularSeries = products.filter(p => p.category === "popular");
  const accessories = products.filter(p => p.category === "accessory");
  const figures = products.filter(p => p.category === "figure");

  res.render("shop", { 
    title: "Shop – OtaZora", 
    newArrivals, 
    popularSeries, 
    accessories, 
    figures 
  });
});


app.get("/events", (req, res) => {
  const events = db.prepare("SELECT * FROM events").all();
  res.render("events", { events });
});

app.get("/contact", (req, res) => res.render("contact"));

// Contact form POST → save feedback
app.post("/contact", (req, res) => {
  const { name, email, phone, message } = req.body;
  db.prepare("INSERT INTO feedback (name,email,phone,message,created_at) VALUES (?,?,?,?,datetime('now'))")
    .run(name, email, phone, message);
  res.render("thanks", { name, email });
});

// Register page
app.get("/register", (req, res) => res.render("register", { error: null }));

app.post("/register", (req, res) => {
  const { username, password } = req.body;
  try {
    db.prepare("INSERT INTO users (username,password) VALUES (?,?)").run(username, password);
    res.redirect("/login");
  } catch {
    res.render("register", { error: "User already exists" });
  }
});

// Login page
app.get("/login", (req, res) => res.render("login", { error: null }));

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE username=? AND password=?").get(username, password);
  if (user) {
    req.session.user = user;
    res.redirect("/dashboard");
  } else {
    res.render("login", { error: "Invalid credentials" });
  }
});

// Dashboard (requires login)
app.get("/dashboard", requireAuth, (req, res) => {
  const feedbacks = db.prepare("SELECT * FROM feedback ORDER BY created_at DESC").all();
  const users = db.prepare("SELECT username FROM users").all();
  res.render("dashboard", { user: req.session.user, feedbacks, users });
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

// Start server
app.listen(port, () => {
  console.log(`OtaZora running at: http://localhost:${port}`);
});
