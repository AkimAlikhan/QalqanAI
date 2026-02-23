// ===== GET /api/cluster =====
import express from 'express';
import graphEngine from '../ai/graphEngine.js';

const router = express.Router();

router.get('/', (req, res) => {
    try {
        const { url } = req.query;

        if (url) {
            // Get cluster for specific URL
            const domain = url.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
            const cluster = graphEngine.getCluster(domain);
            const clusterId = graphEngine.getClusterId(domain);

            if (cluster.nodes.length === 0) {
                // Domain not yet analyzed — return the full seeded graph
                const fullGraph = graphEngine.getFullGraph();
                return res.json({
                    domain,
                    cluster_id: null,
                    message: 'Domain not yet analyzed. Showing full threat ecosystem.',
                    nodes: fullGraph.nodes,
                    edges: fullGraph.edges,
                    website_count: fullGraph.nodes.filter(n => n.type === 'website').length,
                    total_nodes: fullGraph.nodes.length,
                    total_edges: fullGraph.edges.length,
                });
            }

            return res.json({
                domain,
                cluster_id: clusterId,
                nodes: cluster.nodes,
                edges: cluster.edges,
                website_count: cluster.nodes.filter(n => n.type === 'website').length,
                total_nodes: cluster.nodes.length,
                total_edges: cluster.edges.length,
            });
        }

        // No URL — return full graph
        const fullGraph = graphEngine.getFullGraph();
        res.json({
            domain: null,
            cluster_id: null,
            nodes: fullGraph.nodes,
            edges: fullGraph.edges,
            website_count: fullGraph.nodes.filter(n => n.type === 'website').length,
            total_nodes: fullGraph.nodes.length,
            total_edges: fullGraph.edges.length,
        });
    } catch (err) {
        console.error('Cluster error:', err);
        res.status(500).json({ error: 'Cluster lookup failed', message: err.message });
    }
});

export default router;
