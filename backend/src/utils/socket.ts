import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import logger from "./logger";

let io: Server | null = null;

export const initSocket = (server: HttpServer): Server => {
  const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:3000";

  io = new Server(server, {
    cors: {
      origin: allowedOrigin,
      credentials: true,
      methods: ["GET", "POST", "PATCH", "DELETE"],
    },
  });

  io.on("connection", (socket: Socket) => {
    logger.info(`🔌 Socket connected: ${socket.id}`);

    // Join shop room (for vendors and store managers)
    socket.on("join_shop", (shopId: string) => {
      if (shopId) {
        socket.join(`shop_${shopId}`);
        logger.info(`Socket ${socket.id} joined room shop_${shopId}`);
      }
    });

    // Leave shop room
    socket.on("leave_shop", (shopId: string) => {
      if (shopId) {
        socket.leave(`shop_${shopId}`);
      }
    });

    // Join user room (for clients to receive personal order updates)
    socket.on("join_user", (userId: string) => {
      if (userId) {
        socket.join(`user_${userId}`);
        logger.info(`Socket ${socket.id} joined room user_${userId}`);
      }
    });

    socket.on("disconnect", () => {
      logger.info(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.io is not initialized!");
  }
  return io;
};

// Real-Time Notification Emitters
export const notifyNewOrder = (shopId: string, order: any): void => {
  if (io) {
    io.to(`shop_${shopId}`).emit("new_order", {
      message: "You have received a new order!",
      order,
    });
  }
};

export const notifyOrderStatusChanged = (userId: string, order: any): void => {
  if (io) {
    io.to(`user_${userId}`).emit("order_status_updated", {
      message: `Your order status has been updated to ${order.status}`,
      order,
    });
  }
};

export const notifyNewMessage = (shopId: string, message: any): void => {
  if (io) {
    io.to(`shop_${shopId}`).emit("new_message", {
      message: "New customer inquiry received",
      data: message,
    });
  }
};

