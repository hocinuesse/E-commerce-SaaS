import http from "http";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";

import globalError from "./middlewares/globalError";
import { apiLimiter, authLimiter } from "./middlewares/rateLimiter";
import logger, { morganStream } from "./utils/logger";
import { initSocket } from "./utils/socket";
import "./utils/redis"; // Initialize Redis connection in background

import userRouter from "./routes/userRouter";
import shopRouter from "./routes/shopRouter";
import productRouter from "./routes/productRouter";
import cartRouter from "./routes/cartRouter";
import managerRouter from "./routes/managerRouter";
import adminRouter from "./routes/adminRouter";
import orderRouter from "./routes/orderRouter";
import messagesRouter from "./routes/messagesRouter";

dotenv.config();

const app = express();
const server = http.createServer(app);

// 1. Initialize Real-Time WebSockets
initSocket(server);

// 2. Security Headers (Helmet)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// 3. HTTP Request Logging (Morgan + Winston)
app.use(morgan("combined", { stream: morganStream }));

// 4. CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow during dev/preview
      }
    },
    credentials: true,
  }),
);

// 5. Body Parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// 6. Rate Limiting
app.use("/api", apiLimiter);
app.use("/api/v1/auth", authLimiter);

// 7. Session Configuration with MongoStore
const dbURI = process.env.MONGO_URI;
if (!dbURI) {
  logger.error("🔴 MongoDB Connection Error: MONGO_URI is not defined.");
  process.exit(1);
}

app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback_ecommerce_secret_key_123456",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: dbURI,
      ttl: 14 * 24 * 60 * 60,
      autoRemove: "native",
    }),
    cookie: {
      maxAge: 14 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  }),
);

// 8. Health Check Route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// 9. API Routes
app.use("/api/v1/auth", userRouter);
app.use("/api/v1/shops", shopRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/managers", managerRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/messages", messagesRouter);

// 10. Global Error Handler
app.use(globalError);

// 11. Connect to Database & Start Server
const port = process.env.PORT || 5000;

mongoose
  .connect(dbURI)
  .then(() => {
    logger.info("🟢 Connected to MongoDB database successfully");
    server.listen(port, () => {
      logger.info(`🚀 Server running on port ${port} [${process.env.NODE_ENV || "development"}]`);
    });
  })
  .catch((err) => {
    logger.error("🔴 MongoDB Connection Error:", err);
  });

export { app, server };
