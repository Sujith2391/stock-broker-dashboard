const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);

// Enable CORS for frontend
app.use(cors());
app.use(express.json());

const io = new Server(server, {
    cors: {
        origin: "*", // Allow all for MVP simplicity
        methods: ["GET", "POST"]
    }
});

// --- In-Memory Data ---
const TICKERS = ['GOOG', 'TSLA', 'AMZN', 'META', 'NVDA'];
const users = new Map(); // email -> { id, email }
const subscriptions = new Map(); // userId -> Set<ticker>

// --- Helper: Stock Price Generator ---
// Initialize with random base prices
const prices = {};
TICKERS.forEach(t => prices[t] = (Math.random() * 1000 + 50).toFixed(2));

function updatePrices() {
    TICKERS.forEach(ticker => {
        const current = parseFloat(prices[ticker]);
        // Random fluctuation betweeen -2% and +2%
        const change = (Math.random() * 0.04) - 0.02;
        let newPrice = current * (1 + change);
        if (newPrice < 1) newPrice = 1; // Prevent negative
        prices[ticker] = newPrice.toFixed(2);

        // Broadcast to room
        io.to(ticker).emit('price_update', {
            ticker,
            price: prices[ticker],
            timestamp: Date.now()
        });
    });
}

// Run price generator every second
setInterval(updatePrices, 1000);

// --- REST API ---

// Login Endpoint
app.post('/login', (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    // Simple "find or create"
    let user = Array.from(users.values()).find(u => u.email === email);
    if (!user) {
        user = { id: uuidv4(), email };
        users.set(user.id, user);
        subscriptions.set(user.id, new Set()); // Init empty subs
    }

    res.json({ user, token: 'mock-jwt-token' });
});

// Get Subscriptions
app.get('/subscriptions/:userId', (req, res) => {
    const { userId } = req.params;
    const subs = subscriptions.get(userId);
    if (!subs) return res.json([]);
    res.json(Array.from(subs));
});

// Toggle Subscription (Add/Remove)
app.post('/subscribe', (req, res) => {
    const { userId, ticker } = req.body;
    if (!TICKERS.includes(ticker)) return res.status(400).json({ error: 'Invalid ticker' });

    const userSubs = subscriptions.get(userId);
    if (!userSubs) return res.status(404).json({ error: 'User not found' });

    let action = 'added';
    if (userSubs.has(ticker)) {
        userSubs.delete(ticker);
        action = 'removed';
    } else {
        userSubs.add(ticker);
    }

    res.json({ success: true, action, active: Array.from(userSubs) });
});

// --- WebSocket Logic ---

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join_user', (userId) => {
        // In a real app, verify token here.
        // For MVP, we trust the client sends their ID.
        socket.userId = userId;
        const userSubs = subscriptions.get(userId);
        if (userSubs) {
            userSubs.forEach(ticker => {
                socket.join(ticker);
            });
        }
    });

    socket.on('subscribe', (ticker) => {
        // Client UI sends this when toggling ON
        // Backend API also updates Map, but Socket needs to join room
        if (TICKERS.includes(ticker)) {
            socket.join(ticker);
        }
    });

    socket.on('unsubscribe', (ticker) => {
        // Client UI sends this when toggling OFF
        socket.leave(ticker);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
