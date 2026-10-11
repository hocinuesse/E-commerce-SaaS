import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import globalError from "./middlewares/globalError";
import cookieParser from "cookie-parser";
import userRouter from "./routes/userRouter";
import shopRouter from "./routes/shopRouter";
import productRouter from "./routes/productRouter";
import cartRouter from "./routes/cartRouter";
import managerRouter from "./routes/managerRouter";
import adminRouter from "./routes/adminRouter";
import orderRouter from "./routes/orderRouter";
import messagesRouter from "./routes/messagesRouter";
import session from "express-session";
import MongoStore from "connect-mongo";

dotenv.config();
const app = express();
app.use(
  cors({
    origin: "http://localhost:3000", 
    credentials: true,
  }),
);
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      ttl: 14 * 24 * 60 * 60,
      autoRemove: "native",
    }),
    cookie: {
      maxAge: 14 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: "lax",
    },
  }),
);
app.use(cookieParser());

const dbURI = process.env.MONGO_URI;
if (!dbURI) {
  console.error(
    "🔴 MongoDB Connection Error: MONGO_URI is not defined in the environment variables.",
  );
  process.exit(1);
}

const port = process.env.PORT || 5000;
mongoose
  .connect(dbURI)
  .then(() => {
    console.log("conected to database succesful");
  })
  .catch((err) => console.error("🔴 MongoDB Connection Error:", err));

app.use("/api/v1/auth", userRouter);
app.use("/api/v1/shops", shopRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/managers", managerRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/messages", messagesRouter);

app.use(globalError);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
