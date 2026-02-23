// ===== QALQANAI BACKEND SERVER =====
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import analyzeRouter from './routes/analyze.js';
import clusterRouter from './routes/cluster.js';
import blocklistRouter from './routes/blocklist.js';
import statsRouter from './routes/stats.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30,             // 30 requests per minute
    message: { error: 'Rate limit exceeded. Please slow down.' },
});
app.use('/api/', limiter);

// Request logging
app.use('/api/', (req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// API Routes
app.use('/api/analyze', analyzeRouter);
app.use('/api/cluster', clusterRouter);
app.use('/api/blocklist', blocklistRouter);
app.use('/api/stats', statsRouter);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'operational', version: '2.4.1', uptime: process.uptime() });
});

// 404
app.use('/api/{*path}', (req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔══════════════════════════════════════════════╗
║          QalqanAI Backend Server             ║
║──────────────────────────────────────────────║
║  Status:  OPERATIONAL                        ║
║  Port:    ${String(PORT).padEnd(35)}║
║  API:     http://localhost:${PORT}/api        ║
║  Version: 2.4.1                              ║
╚══════════════════════════════════════════════╝
  `);
});

export default app;
