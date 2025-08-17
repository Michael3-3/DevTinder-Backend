const express = require('express');
const http = require('http');
const connectDb = require('./config/database');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require("dotenv").config();
// Import routes
const authRoute = require('./routes/authRoute');
const profileRoute = require('./routes/profileRoute');
const feedRoute = require('./routes/feed');
const messageRoute = require('./routes/messageRoute');
const connectionRequestSending = require('./routes/connectionRequest');
const initializeSocket = require('./utils/initailizeSocket');

const app = express();

const server = http.createServer(app);
initializeSocket(server);

// ✅ CORS setup — keep it at the very top (before routes)
app.use(cors({
    origin: "https://devmeet.ddns.net/", // frontend URL
    credentials: true,
}));

app.use(cookieParser());
app.use(express.json());

// Connect to DB
connectDb()
    .then(() => {
        console.log("Connected to MongoDB");
        server.listen(process.env.port, () => {
            console.log("Server is running on port 3001");
        });
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
    });

// Routes
app.use('/', authRoute);
app.use('/', profileRoute);
app.use('/', feedRoute);
app.use('/', connectionRequestSending);
app.use('/',messageRoute)

// Global error handler
app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
});
