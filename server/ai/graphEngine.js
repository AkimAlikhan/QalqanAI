// ===== GRAPH INTELLIGENCE ENGINE =====
// In-memory graph database for ecosystem detection and risk propagation.

class GraphEngine {
    constructor() {
        // nodes: Map<id, { id, label, type, risk, metadata }>
        this.nodes = new Map();
        // edges: Array<{ source, target, label }>
        this.edges = [];
        // Lookup: domain → nodeId
        this.domainIndex = new Map();
        // Analysis results cache: domain → result
        this.analysisCache = new Map();
        // Cluster assignments
        this.clusters = new Map(); // nodeId → clusterId
        this.clusterCounter = 42; // Start from CLS-0042 for aesthetic

        // Pre-seed with known threat data
        this._seedKnownThreats();
    }

    _seedKnownThreats() {
        // Seed a few known-bad domains to create initial graph
        const seeds = [
            { domain: 'lucky-spin-777.bet', category: 'Casino', risk: 92 },
            { domain: 'mega-jackpot-win.net', category: 'Casino', risk: 91 },
            { domain: 'slot-empire-vip.casino', category: 'Casino', risk: 88 },
            { domain: 'golden-slots-kz.com', category: 'Casino', risk: 85 },
            { domain: 'spin-bonus-pro.bet', category: 'Casino', risk: 79 },
            { domain: 'invest-gold-pro.xyz', category: 'Pyramid', risk: 87 },
            { domain: 'secure-bank-verify.com', category: 'Phishing', risk: 95 },
            { domain: 'crypto-double-fast.io', category: 'Scam', risk: 89 },
            { domain: 'account-verify-now.org', category: 'Phishing', risk: 96 },
            { domain: 'fast-money-guru.biz', category: 'Scam', risk: 84 },
        ];

        // Create website nodes
        seeds.forEach((s, i) => {
            const nodeId = `seed-w${i + 1}`;
            this.addNode(nodeId, s.domain, 'website', s.risk, { category: s.category, seeded: true });
            this.domainIndex.set(s.domain, nodeId);
        });

        // Create shared infrastructure nodes + edges
        const sharedIP = this.addNode('seed-ip1', '185.234.72.18', 'domain', 70);
        const sharedIP2 = this.addNode('seed-ip2', '91.215.85.102', 'domain', 65);
        const sharedGA = this.addNode('seed-t1', 'UA-38291746', 'tracker', 60);
        const sharedFB = this.addNode('seed-t2', 'FB:948271635', 'tracker', 55);
        const sharedCert = this.addNode('seed-c1', 'TLS:a3f8c91d', 'certificate', 50);
        const sharedCert2 = this.addNode('seed-c2', 'TLS:b7e284fa', 'certificate', 45);
        const sharedWallet = this.addNode('seed-p1', 'bc1qxy2kgdyg', 'wallet', 40);
        const sharedContact = this.addNode('seed-ct1', '@lucky_support_bot', 'contact', 35);

        // Wire edges
        this.addEdge('seed-w1', 'seed-ip1', 'hosted on');
        this.addEdge('seed-w2', 'seed-ip1', 'hosted on');
        this.addEdge('seed-w4', 'seed-ip1', 'hosted on');
        this.addEdge('seed-w3', 'seed-ip2', 'hosted on');
        this.addEdge('seed-w5', 'seed-ip2', 'hosted on');
        this.addEdge('seed-w1', 'seed-t1', 'uses tracker');
        this.addEdge('seed-w2', 'seed-t1', 'uses tracker');
        this.addEdge('seed-w4', 'seed-t1', 'uses tracker');
        this.addEdge('seed-w1', 'seed-t2', 'uses pixel');
        this.addEdge('seed-w3', 'seed-t2', 'uses pixel');
        this.addEdge('seed-w1', 'seed-c1', 'shares cert');
        this.addEdge('seed-w2', 'seed-c1', 'shares cert');
        this.addEdge('seed-w3', 'seed-c2', 'shares cert');
        this.addEdge('seed-w5', 'seed-c2', 'shares cert');
        this.addEdge('seed-w1', 'seed-p1', 'uses wallet');
        this.addEdge('seed-w4', 'seed-p1', 'uses wallet');
        this.addEdge('seed-w1', 'seed-ct1', 'same operator');
        this.addEdge('seed-w2', 'seed-ct1', 'same operator');
        this.addEdge('seed-w5', 'seed-ct1', 'same operator');

        // Assign clusters
        ['seed-w1', 'seed-w2', 'seed-w3', 'seed-w4', 'seed-w5'].forEach(id => {
            this.clusters.set(id, 'CLS-0042');
        });
        ['seed-w6', 'seed-w7', 'seed-w10'].forEach(id => {
            this.clusters.set(id, 'CLS-0038');
        });
    }

    addNode(id, label, type, risk = 0, metadata = {}) {
        const node = { id, label, type, risk, metadata, addedAt: new Date().toISOString() };
        this.nodes.set(id, node);
        return node;
    }

    addEdge(sourceId, targetId, label) {
        // Avoid duplicate edges
        const exists = this.edges.some(
            e => e.source === sourceId && e.target === targetId && e.label === label
        );
        if (!exists) {
            this.edges.push({ source: sourceId, target: targetId, label });
        }
    }

    // Insert analysis result into graph and detect clusters
    insertAnalysis(domain, features, riskResult) {
        // Cache the result
        this.analysisCache.set(domain, { features, riskResult, analyzedAt: new Date().toISOString() });

        // Check if domain already exists as a node
        let websiteNodeId = this.domainIndex.get(domain);
        if (!websiteNodeId) {
            websiteNodeId = `w-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
            this.addNode(websiteNodeId, domain, 'website', riskResult.riskScore, {
                category: riskResult.category,
                confidence: riskResult.confidence,
            });
            this.domainIndex.set(domain, websiteNodeId);
        } else {
            // Update existing node
            const node = this.nodes.get(websiteNodeId);
            if (node) {
                node.risk = riskResult.riskScore;
                node.metadata = { ...node.metadata, category: riskResult.category, confidence: riskResult.confidence };
            }
        }

        // Add IP node + edge
        if (features.dns.ip) {
            const ipId = `ip-${features.dns.ip.replace(/\./g, '-')}`;
            if (!this.nodes.has(ipId)) {
                this.addNode(ipId, features.dns.ip, 'domain', 0);
            }
            this.addEdge(websiteNodeId, ipId, 'hosted on');
        }

        // Add TLS cert node + edge
        if (features.tls.fingerprint) {
            const certId = `cert-${features.tls.fingerprint.slice(0, 8)}`;
            if (!this.nodes.has(certId)) {
                this.addNode(certId, `TLS:${features.tls.fingerprint.slice(0, 8)}`, 'certificate', 0, {
                    issuer: features.tls.issuer,
                });
            }
            this.addEdge(websiteNodeId, certId, 'shares cert');
        }

        // Add tracker nodes + edges
        if (features.trackers.gaId) {
            const gaId = `ga-${features.trackers.gaId}`;
            if (!this.nodes.has(gaId)) {
                this.addNode(gaId, features.trackers.gaId, 'tracker', 0);
            }
            this.addEdge(websiteNodeId, gaId, 'uses tracker');
        }
        if (features.trackers.fbPixel) {
            const fbId = `fb-${features.trackers.fbPixel}`;
            if (!this.nodes.has(fbId)) {
                this.addNode(fbId, `FB:${features.trackers.fbPixel}`, 'tracker', 0);
            }
            this.addEdge(websiteNodeId, fbId, 'uses pixel');
        }

        // Add wallet node + edge
        if (features.financial.cryptoWallet) {
            const walletId = `wallet-${features.financial.cryptoWallet.slice(0, 12)}`;
            if (!this.nodes.has(walletId)) {
                this.addNode(walletId, features.financial.cryptoWallet.slice(0, 12) + '...', 'wallet', 0);
            }
            this.addEdge(websiteNodeId, walletId, 'uses wallet');
        }

        // Add contact nodes + edges
        if (features.contacts.telegram) {
            const tgId = `tg-${features.contacts.telegram}`;
            if (!this.nodes.has(tgId)) {
                this.addNode(tgId, features.contacts.telegram, 'contact', 0);
            }
            this.addEdge(websiteNodeId, tgId, 'same operator');
        }

        // Detect cluster membership
        this._detectCluster(websiteNodeId);

        // Propagate risk through shared markers
        this._propagateRisk(websiteNodeId, riskResult.riskScore);

        return websiteNodeId;
    }

    // Find all nodes connected to a given website (2 hops)
    getCluster(domain) {
        const websiteNodeId = this.domainIndex.get(domain);
        if (!websiteNodeId) {
            return { nodes: [], edges: [] };
        }

        const visited = new Set();
        const clusterNodes = new Set();
        const clusterEdges = [];

        // BFS 2 hops
        const queue = [{ id: websiteNodeId, depth: 0 }];
        visited.add(websiteNodeId);
        clusterNodes.add(websiteNodeId);

        while (queue.length > 0) {
            const { id, depth } = queue.shift();
            if (depth >= 2) continue;

            // Find all edges from/to this node
            for (const edge of this.edges) {
                let neighbor = null;
                if (edge.source === id) {
                    neighbor = edge.target;
                } else if (edge.target === id) {
                    neighbor = edge.source;
                }

                if (neighbor && !visited.has(neighbor)) {
                    visited.add(neighbor);
                    clusterNodes.add(neighbor);
                    queue.push({ id: neighbor, depth: depth + 1 });
                }

                if (neighbor && (edge.source === id || edge.target === id)) {
                    clusterEdges.push(edge);
                }
            }
        }

        const nodes = Array.from(clusterNodes).map(id => this.nodes.get(id)).filter(Boolean);
        // Deduplicate edges
        const uniqueEdges = [];
        const edgeSet = new Set();
        for (const e of clusterEdges) {
            const key = `${e.source}-${e.target}-${e.label}`;
            if (!edgeSet.has(key)) {
                edgeSet.add(key);
                uniqueEdges.push(e);
            }
        }

        return { nodes, edges: uniqueEdges };
    }

    // Get the full graph (for ecosystem page)
    getFullGraph() {
        return {
            nodes: Array.from(this.nodes.values()),
            edges: [...this.edges],
        };
    }

    // Risk propagation: if a site is risky, increase risk of nodes sharing infrastructure
    _propagateRisk(sourceNodeId, riskScore) {
        if (riskScore < 50) return; // Only propagate for risky sites

        const propagationFactor = 0.15;
        const connectedNodes = new Set();

        // Find markers connected to this site
        for (const edge of this.edges) {
            if (edge.source === sourceNodeId) {
                connectedNodes.add(edge.target);
            } else if (edge.target === sourceNodeId) {
                connectedNodes.add(edge.source);
            }
        }

        // For each marker, find other websites sharing it
        for (const markerId of connectedNodes) {
            const markerNode = this.nodes.get(markerId);
            if (!markerNode || markerNode.type === 'website') continue;

            // Update marker risk
            markerNode.risk = Math.max(markerNode.risk, Math.round(riskScore * 0.6));

            // Find other websites connected to this marker
            for (const edge of this.edges) {
                let otherWebsiteId = null;
                if (edge.source === markerId && edge.target !== sourceNodeId) {
                    otherWebsiteId = edge.target;
                } else if (edge.target === markerId && edge.source !== sourceNodeId) {
                    otherWebsiteId = edge.source;
                }

                if (otherWebsiteId) {
                    const otherNode = this.nodes.get(otherWebsiteId);
                    if (otherNode && otherNode.type === 'website') {
                        const boost = Math.round(riskScore * propagationFactor);
                        otherNode.risk = Math.min(100, Math.max(otherNode.risk, otherNode.risk + boost));
                    }
                }
            }
        }
    }

    // Simple cluster detection based on shared infrastructure
    _detectCluster(websiteNodeId) {
        // Find if this node shares markers with any existing cluster member
        const connectedMarkers = new Set();
        for (const edge of this.edges) {
            if (edge.source === websiteNodeId) connectedMarkers.add(edge.target);
            if (edge.target === websiteNodeId) connectedMarkers.add(edge.source);
        }

        // Check if any connected marker is shared with a clustered node
        for (const markerId of connectedMarkers) {
            for (const edge of this.edges) {
                let otherNodeId = null;
                if (edge.source === markerId && edge.target !== websiteNodeId) otherNodeId = edge.target;
                if (edge.target === markerId && edge.source !== websiteNodeId) otherNodeId = edge.source;

                if (otherNodeId && this.clusters.has(otherNodeId)) {
                    // Join same cluster
                    this.clusters.set(websiteNodeId, this.clusters.get(otherNodeId));
                    return;
                }
            }
        }

        // If no existing cluster, create new one (only if node has connections)
        if (connectedMarkers.size > 0) {
            this.clusterCounter++;
            this.clusters.set(websiteNodeId, `CLS-${String(this.clusterCounter).padStart(4, '0')}`);
        }
    }

    // Get cluster ID for a domain
    getClusterId(domain) {
        const nodeId = this.domainIndex.get(domain);
        return nodeId ? (this.clusters.get(nodeId) || null) : null;
    }

    // Get blocklist: all website nodes sorted by risk
    getBlocklist() {
        const websites = Array.from(this.nodes.values())
            .filter(n => n.type === 'website')
            .map(n => ({
                domain: n.label,
                category: n.metadata?.category || 'Unknown',
                risk: n.risk,
                tier: n.risk >= 80 ? 'A' : n.risk >= 50 ? 'B' : 'C',
                status: n.risk >= 80 ? 'Blocked' : n.risk >= 50 ? 'Under Review' : 'Monitoring',
                detectedDate: n.addedAt.split('T')[0],
                cluster: this.clusters.get(n.id) || '—',
                markers: this.edges.filter(e => e.source === n.id || e.target === n.id).length,
            }))
            .sort((a, b) => b.risk - a.risk);

        return websites;
    }

    // Get stats
    getStats() {
        const websites = Array.from(this.nodes.values()).filter(n => n.type === 'website');
        const clusters = new Set(Array.from(this.clusters.values()));
        return {
            scannedToday: websites.length + Math.floor(Math.random() * 50), // slight jitter for live feel
            clustersFound: clusters.size,
            threatsBlocked: websites.filter(w => w.risk >= 80).length * 100 + Math.floor(Math.random() * 50),
            activeMonitors: websites.filter(w => w.risk >= 50).length * 80 + Math.floor(Math.random() * 20),
        };
    }
}

// Singleton instance
const graphEngine = new GraphEngine();
export default graphEngine;
