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
app.use(streamRouter);

// Vite middleware or static serving
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
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
