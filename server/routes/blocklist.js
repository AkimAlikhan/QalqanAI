// ===== GET /api/blocklist =====
import express from 'express';
import graphEngine from '../ai/graphEngine.js';

const router = express.Router();

router.get('/', (req, res) => {
    try {
        const blocklist = graphEngine.getBlocklist();
        res.json({ items: blocklist, total: blocklist.length });
    } catch (err) {
        console.error('Blocklist error:', err);
        res.status(500).json({ error: 'Blocklist failed', message: err.message });
    }
});

export default router;
