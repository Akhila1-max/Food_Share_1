import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("foodshare.db");
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('donor', 'volunteer', 'admin')) NOT NULL
  );

  CREATE TABLE IF NOT EXISTS donations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    donor_id INTEGER NOT NULL,
    food_type TEXT NOT NULL,
    quantity TEXT NOT NULL,
    expiry_time DATETIME NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    status TEXT CHECK(status IN ('pending', 'accepted', 'picked_up', 'delivered')) DEFAULT 'pending',
    volunteer_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donor_id) REFERENCES users(id),
    FOREIGN KEY (volunteer_id) REFERENCES users(id)
  );
`);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer);
  const PORT = 3000;

  app.use(express.json());

  // Socket.io connection
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  // Middleware for Auth
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const stmt = db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)");
      const result = stmt.run(name, email, hashedPassword, role);
      res.status(201).json({ id: result.lastInsertRowid });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  });

  // Donation Routes
  app.post("/api/donations", authenticateToken, (req: any, res) => {
    const { food_type, quantity, expiry_time, latitude, longitude } = req.body;
    try {
      const stmt = db.prepare("INSERT INTO donations (donor_id, food_type, quantity, expiry_time, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)");
      const result = stmt.run(req.user.id, food_type, quantity, expiry_time, latitude, longitude);
      const newDonation = { id: result.lastInsertRowid, donor_id: req.user.id, food_type, quantity, expiry_time, latitude, longitude, status: 'pending' };
      io.emit("new_donation", newDonation);
      res.status(201).json(newDonation);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/donations", authenticateToken, (req: any, res) => {
    let donations;
    if (req.user.role === 'donor') {
      donations = db.prepare("SELECT * FROM donations WHERE donor_id = ? ORDER BY created_at DESC").all(req.user.id);
    } else if (req.user.role === 'volunteer') {
      donations = db.prepare("SELECT * FROM donations WHERE status = 'pending' OR volunteer_id = ? ORDER BY created_at DESC").all(req.user.id);
    } else {
      donations = db.prepare("SELECT * FROM donations ORDER BY created_at DESC").all();
    }
    res.json(donations);
  });

  app.patch("/api/donations/:id/status", authenticateToken, (req: any, res) => {
    const { status } = req.body;
    const { id } = req.params;
    try {
      const stmt = db.prepare("UPDATE donations SET status = ?, volunteer_id = ? WHERE id = ?");
      stmt.run(status, req.user.id, id);
      io.emit("donation_updated", { id, status, volunteer_id: req.user.id });
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Admin Routes
  app.get("/api/admin/stats", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const totalDonations = db.prepare("SELECT COUNT(*) as count FROM donations").get() as any;
    const activeVolunteers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'volunteer'").get() as any;
    const foodSaved = db.prepare("SELECT COUNT(*) as count FROM donations WHERE status = 'delivered'").get() as any;
    res.json({
      totalDonations: totalDonations.count,
      activeVolunteers: activeVolunteers.count,
      foodSaved: foodSaved.count
    });
  });

  app.get("/api/admin/users", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const users = db.prepare("SELECT id, name, email, role FROM users").all();
    res.json(users);
  });

  app.delete("/api/admin/users/:id", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
