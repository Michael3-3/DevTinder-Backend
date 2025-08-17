// utils/initializeSocket.js
const socket = require("socket.io");
const Message = require("../models/message");

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: { origin: "http://localhost:5173", credentials: true },
  });

  io.on("connection", (socket) => {
    console.log("⚡ socket connected:", socket.id);

    // Join a unique room for the pair (order-independent)
    socket.on("joinChat", ({ userId, targetId }) => {
      if (!userId || !targetId) return;
      const roomId = [userId, targetId].sort().join("_");
      socket.join(roomId);
      console.log(`👥 ${userId} joined room ${roomId}`);
    });

    // Accept BOTH shapes and normalize:
    // A) { userId, targetId, message }
    // B) { sender, receiver, text }
    socket.on("sendMessage", async (payload, ack) => {
      try {
        const sender   = payload.userId   || payload.sender;
        const receiver = payload.targetId || payload.receiver;
        const text     = payload.message  || payload.text;

        if (!sender || !receiver || !text) {
          ack && ack({ success: false, error: "Invalid payload" });
          return;
        }

        const roomId = [sender, receiver].sort().join("_");

        // Persist
        const doc = await Message.create({ sender, receiver, text });
        // Uniform message object sent to clients
        const out = {
          _id: doc._id.toString(),
          sender: doc.sender.toString(),
          receiver: doc.receiver.toString(),
          text: doc.text,
          createdAt: doc.createdAt,
        };

        // Realtime emit to both users in room
        io.to(roomId).emit("receiveMessage", out);

        ack && ack({ success: true, message: out });
      } catch (err) {
        console.error("sendMessage error:", err);
        ack && ack({ success: false, error: "Server error" });
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ socket disconnected:", socket.id);
    });
  });
};

module.exports = initializeSocket;
