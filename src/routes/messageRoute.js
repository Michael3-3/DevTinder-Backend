// routes/messageRoute.js
const express = require("express");
const Message = require("../models/message");
const auth = require("../middleware/auth");

const router = express.Router();

// Keep your current pattern: /api/messages/:userId/:targetId
router.get("/api/messages/:userId/:targetId", auth, async (req, res) => {
  const { userId, targetId } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: targetId },
        { sender: targetId, receiver: userId }
      ]
    })
      .sort({ createdAt: 1 })
      .lean();

    // Ensure uniform shape
    const data = messages.map(m => ({
      _id: m._id.toString(),
      sender: m.sender.toString(),
      receiver: m.receiver.toString(),
      text: m.text,
      createdAt: m.createdAt,
    }));

    res.json(data);
  } catch (err) {
    console.error("Fetch messages error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
