// ===== GET /api/stats =====
import express from 'express';
import graphEngine from '../ai/graphEngine.js';

const router = express.Router();

router.get('/', (req, res) => {
    try {
        const stats = graphEngine.getStats();
        res.json(stats);
    } catch (err) {
        console.error('Stats error:', err);
        res.status(500).json({ error: 'Stats failed', message: err.message });
    }
});

export default router;
