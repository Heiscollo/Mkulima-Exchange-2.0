import mongoose from "mongoose";

let mongoServer: any = null;

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;

    if (!uri) {
      console.log("No MONGODB_URI found in .env, using local connection fallback...");
      // Skip MongoDB Memory Server on Windows - just use a local fallback
      uri = "mongodb://localhost:27017/mkulima-test";
    }

    try {
      // Set a connection timeout
      await Promise.race([
        mongoose.connect(uri),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("MongoDB connection timeout")), 3000)
        ),
      ]);
      console.log("MongoDB Connected Successfully");
    } catch (mongooseErr) {
      console.warn("MongoDB connection warning, app will start with limited functionality:", (mongooseErr as Error).message);
    }
  } catch (err) {
    console.error("Database connection setup failed:", err);
    // Don't exit - let the app start anyway
  }
};

export const disconnectDB = async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
};

export default connectDB;
