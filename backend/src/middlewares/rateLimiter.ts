import rateLimit from "express-rate-limit";

// General API Rate Limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    statusCode: 429,
    message: "Too many requests from this IP, please try again after 15 minutes.",
  },
});

// Strict Rate Limiter for Authentication endpoints (Login, Register, Refresh)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Max 20 attempts per 15 minutes to prevent brute-force attacks
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    statusCode: 429,
    message: "Too many authentication attempts. Please try again after 15 minutes.",
  },
});

