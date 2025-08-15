const express = require('express');
const connectDb = require('./config/database');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// Import routes
const authRoute = require('./routes/authRoute');
const profileRoute = require('./routes/profileRoute');
const feedRoute = require('./routes/feed');
const connectionRequestSending = require('./routes/connectionRequest');

const app = express();

// ✅ CORS setup — keep it at the very top (before routes)
app.use(cors({
    origin: "http://localhost:5173", // frontend URL
    credentials: true,
}));

// ✅ Preflight requests handler (safe way)
// app.options('*', (req, res) => {
//     res.header("Access-Control-Allow-Origin", "http://localhost:5173");
//     res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
//     res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
//     res.sendStatus(200);
// });

app.use(cookieParser());
app.use(express.json());

// Connect to DB
connectDb()
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(3001, () => {
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

// Global error handler
app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
});
