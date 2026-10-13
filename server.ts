import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

import moviesRouter from "./server/routes/movies.js";
import packagesRouter from "./server/routes/packages.js";
import paymentsRouter from "./server/routes/payments.js";
import aiRouter from "./server/routes/ai.js";
import seoRouter from "./server/routes/seo.js";
import streamRouter from "./server/routes/stream.js";
import usersRouter from "./server/routes/users.js";
import rechargesRouter from "./server/routes/recharges.js";
import authRouter from "./server/routes/auth.js";
import { requireAuth, AuthRequest } from "./src/middleware/auth.ts";
import { getUsers, getOrCreateUser } from "./src/db/users.ts";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// SEO XML Sitemap and Robots.txt routes
app.use(seoRouter);

// Health Check API
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "FlickNime TV API Server" });
});

// API Routes
app.use("/api/movies", moviesRouter);
app.use("/api/packages", packagesRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/ai", aiRouter);
app.use("/api/users", usersRouter);
app.use("/api/recharges", rechargesRouter);
app.use(authRouter);
app.use(streamRouter);

// Cloud SQL PostgreSQL user endpoints with Firebase Auth verification
app.get("/api/db/users", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userList = await getUsers();
    res.json(userList);
  } catch (error: any) {
    console.error("Failed to fetch users from Cloud SQL:", error);
    res.status(500).json({ error: error.message || "Failed to fetch users" });
  }
});

app.post("/api/db/sync-user", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.user || !req.user.uid) {
      return res.status(401).json({ error: "Unauthorized: Missing user UID" });
    }
    const { displayName, photoUrl } = req.body || {};
    const synced = await getOrCreateUser(
      req.user.uid,
      req.user.email || `${req.user.uid}@flicknime.internal`,
      displayName || req.user.name,
      photoUrl || req.user.picture
    );
    res.json({ success: true, user: synced });
  } catch (error: any) {
    console.error("Failed to sync user to Cloud SQL:", error);
    res.status(500).json({ error: error.message || "Failed to sync user" });
  }
});

// Static assets from public folder
app.use(express.static(path.join(process.cwd(), "public")));

// Vite middleware or static serving
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === "true" ? false : undefined,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`IOIO Cinema server running on http://localhost:${PORT}`);
  });
}

setupServer();
