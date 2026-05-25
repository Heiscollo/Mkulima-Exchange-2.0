import express from "express";
import cors from "cors";
import path from "path";
import { existsSync } from "fs";
import dotenv from "dotenv";
import connectDB from "./server/config/db";
import { importData } from "./seed";

// Load environment variables
dotenv.config();

// Routes
import authRoutes from "./server/routes/authRoutes";
import productRoutes from "./server/routes/productRoutes";
import orderRoutes from "./server/routes/orderRoutes";
import userRoutes from "./server/routes/userRoutes";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Connect to DB
  await connectDB();
  
  // Seed database
  await importData();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'))); // For local image uploads

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/users", userRoutes);
  
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Mkulima Exchange API is running" });
  });

  // Serve client app
  const distPath = path.join(process.cwd(), 'dist');
  const devMode = process.env.NODE_ENV !== "production";
  
  if (existsSync(distPath)) {
    // Production: serve pre-built dist folder
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(distPath, 'index.html'));
      }
    });
  } else if (devMode) {
    // Development without dist: serve index.html as fallback
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(process.cwd(), 'index.html'));
      }
    });
  }

  // Error handling middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
