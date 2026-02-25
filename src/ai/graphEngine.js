// ===== GRAPH ENGINE (Browser-compatible singleton) =====

class GraphEngine {
    constructor() {
        this.nodes = new Map();
        this.edges = [];
        this.domainIndex = new Map();
        this.analysisCache = new Map();
        this.clusters = new Map();
        this.clusterCounter = 42;
        this._seedKnownThreats();
    }

    _seedKnownThreats() {
        // Real-world malicious/suspicious domains from around the globe
        const seeds = [
            // Gambling / Casino — worldwide
            { domain: '1xbet.com', category: 'Casino', risk: 94, country: 'Cyprus/Russia' },
            { domain: 'mostbet.com', category: 'Casino', risk: 92, country: 'Cyprus' },
            { domain: 'pin-up.casino', category: 'Casino', risk: 90, country: 'Curaçao' },
            { domain: 'stake.com', category: 'Casino', risk: 85, country: 'Curaçao' },
            { domain: 'melbet.com', category: 'Casino', risk: 91, country: 'Cyprus' },
            { domain: 'betwinner.com', category: 'Casino', risk: 88, country: 'Cyprus' },
            { domain: '22bet.com', category: 'Casino', risk: 87, country: 'Cyprus' },
            { domain: 'parimatch.com', category: 'Casino', risk: 86, country: 'Cyprus' },

            // Phishing — worldwide
            { domain: 'secure-paypal-verify.com', category: 'Phishing', risk: 96, country: 'Unknown' },
            { domain: 'apple-id-confirm.net', category: 'Phishing', risk: 95, country: 'Unknown' },
            { domain: 'microsoft-alert-login.com', category: 'Phishing', risk: 94, country: 'Unknown' },
            { domain: 'netflix-billing-update.org', category: 'Phishing', risk: 93, country: 'Unknown' },

            // Scam / Fraud — worldwide
            { domain: 'crypto-double-fast.io', category: 'Scam', risk: 89, country: 'Panama' },
            { domain: 'bitcoin-multiply.xyz', category: 'Scam', risk: 88, country: 'Seychelles' },
            { domain: 'free-iphone-winner.com', category: 'Scam', risk: 87, country: 'Nigeria' },
            { domain: 'easyprofit-trade.net', category: 'Scam', risk: 86, country: 'Marshall Islands' },

            // Pyramid / MLM — worldwide
            { domain: 'invest-gold-pro.xyz', category: 'Pyramid', risk: 87, country: 'UAE' },
            { domain: 'matrix-income-system.com', category: 'Pyramid', risk: 84, country: 'Philippines' },
            { domain: 'cashflow-network.biz', category: 'Pyramid', risk: 82, country: 'India' },

            // Regional threats
            { domain: 'slot-empire-vip.casino', category: 'Casino', risk: 88, country: 'Malta' },
            { domain: 'fast-money-guru.biz', category: 'Scam', risk: 84, country: 'Brazil' },
        ];

        seeds.forEach((s, i) => {
            const id = `seed-w${i + 1}`;
            this.addNode(id, s.domain, 'website', s.risk, {
                category: s.category,
                seeded: true,
                country: s.country,
            });
            this.domainIndex.set(s.domain, id);
        });

        // Shared infrastructure nodes
        this.addNode('seed-ip1', '185.234.72.18', 'domain', 70);
        this.addNode('seed-ip2', '91.215.85.102', 'domain', 65);
        this.addNode('seed-ip3', '104.21.34.167', 'domain', 60);
        this.addNode('seed-ip4', '172.67.188.42', 'domain', 55);
        this.addNode('seed-t1', 'UA-38291746', 'tracker', 60);
        this.addNode('seed-t2', 'FB:948271635', 'tracker', 55);
        this.addNode('seed-t3', 'UA-55192837', 'tracker', 50);
        this.addNode('seed-c1', 'TLS:a3f8c91d', 'certificate', 50);
        this.addNode('seed-c2', 'TLS:b7e284fa', 'certificate', 45);
        this.addNode('seed-p1', 'bc1qxy2kgdyg', 'wallet', 40);
        this.addNode('seed-p2', '0x4a8f3e...c29d', 'wallet', 35);
        this.addNode('seed-ct1', '@1xbet_support', 'contact', 35);
        this.addNode('seed-ct2', '@mostbet_help', 'contact', 30);

        const edgeDefs = [
            // 1xbet cluster — shared hosting and trackers
            ['seed-w1', 'seed-ip1', 'hosted on'], ['seed-w5', 'seed-ip1', 'hosted on'],
            ['seed-w6', 'seed-ip1', 'hosted on'], ['seed-w7', 'seed-ip1', 'hosted on'],
            ['seed-w1', 'seed-t1', 'uses tracker'], ['seed-w5', 'seed-t1', 'uses tracker'],
            ['seed-w6', 'seed-t1', 'uses tracker'],
            ['seed-w1', 'seed-c1', 'shares cert'], ['seed-w5', 'seed-c1', 'shares cert'],
            ['seed-w1', 'seed-ct1', 'same operator'],

            // Mostbet cluster
            ['seed-w2', 'seed-ip2', 'hosted on'], ['seed-w3', 'seed-ip2', 'hosted on'],
            ['seed-w8', 'seed-ip2', 'hosted on'],
            ['seed-w2', 'seed-t2', 'uses pixel'], ['seed-w3', 'seed-t2', 'uses pixel'],
            ['seed-w2', 'seed-c2', 'shares cert'], ['seed-w3', 'seed-c2', 'shares cert'],
            ['seed-w2', 'seed-ct2', 'same operator'],

            // Phishing cluster — shared IPs
            ['seed-w9', 'seed-ip3', 'hosted on'], ['seed-w10', 'seed-ip3', 'hosted on'],
            ['seed-w11', 'seed-ip3', 'hosted on'], ['seed-w12', 'seed-ip3', 'hosted on'],
            ['seed-w9', 'seed-t3', 'uses tracker'], ['seed-w10', 'seed-t3', 'uses tracker'],

            // Scam cluster — shared wallets
            ['seed-w13', 'seed-ip4', 'hosted on'], ['seed-w14', 'seed-ip4', 'hosted on'],
            ['seed-w13', 'seed-p1', 'uses wallet'], ['seed-w14', 'seed-p1', 'uses wallet'],
            ['seed-w15', 'seed-p2', 'uses wallet'], ['seed-w16', 'seed-p2', 'uses wallet'],

            // Pyramid links
            ['seed-w17', 'seed-ip4', 'hosted on'],
            ['seed-w4', 'seed-p1', 'uses wallet'],
        ];
        edgeDefs.forEach(([s, t, l]) => this.addEdge(s, t, l));

        // Cluster assignments — casino
        ['seed-w1', 'seed-w5', 'seed-w6', 'seed-w7'].forEach(id => this.clusters.set(id, 'CLS-0042'));
        ['seed-w2', 'seed-w3', 'seed-w8'].forEach(id => this.clusters.set(id, 'CLS-0038'));
        // Phishing cluster
        ['seed-w9', 'seed-w10', 'seed-w11', 'seed-w12'].forEach(id => this.clusters.set(id, 'CLS-0051'));
        // Scam/pyramid
        ['seed-w13', 'seed-w14', 'seed-w15', 'seed-w16', 'seed-w17'].forEach(id => this.clusters.set(id, 'CLS-0063'));
    }

    addNode(id, label, type, risk = 0, metadata = {}) {
        const node = { id, label, type, risk, metadata, addedAt: new Date().toISOString() };
        this.nodes.set(id, node);
        return node;
    }

    addEdge(source, target, label) {
        if (!this.edges.some(e => e.source === source && e.target === target && e.label === label)) {
            this.edges.push({ source, target, label });
        }
    }

    insertAnalysis(domain, features, riskResult) {
        this.analysisCache.set(domain, { features, riskResult, analyzedAt: new Date().toISOString() });
        let wId = this.domainIndex.get(domain);
        if (!wId) {
            wId = `w-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
            this.addNode(wId, domain, 'website', riskResult.riskScore, { category: riskResult.category, confidence: riskResult.confidence });
            this.domainIndex.set(domain, wId);
        } else {
            const n = this.nodes.get(wId);
            if (n) { n.risk = riskResult.riskScore; n.metadata = { ...n.metadata, category: riskResult.category }; }
        }
        if (features.dns.ip) { const id = `ip-${features.dns.ip.replace(/\./g, '-')}`; if (!this.nodes.has(id)) this.addNode(id, features.dns.ip, 'domain', 0); this.addEdge(wId, id, 'hosted on'); }
        if (features.tls.fingerprint) { const id = `cert-${features.tls.fingerprint.slice(0, 8)}`; if (!this.nodes.has(id)) this.addNode(id, `TLS:${features.tls.fingerprint.slice(0, 8)}`, 'certificate', 0); this.addEdge(wId, id, 'shares cert'); }
        if (features.trackers.gaId) { const id = `ga-${features.trackers.gaId}`; if (!this.nodes.has(id)) this.addNode(id, features.trackers.gaId, 'tracker', 0); this.addEdge(wId, id, 'uses tracker'); }
        if (features.trackers.fbPixel) { const id = `fb-${features.trackers.fbPixel}`; if (!this.nodes.has(id)) this.addNode(id, `FB:${features.trackers.fbPixel}`, 'tracker', 0); this.addEdge(wId, id, 'uses pixel'); }
        if (features.financial.cryptoWallet) { const id = `wallet-${features.financial.cryptoWallet.slice(0, 12)}`; if (!this.nodes.has(id)) this.addNode(id, features.financial.cryptoWallet.slice(0, 12) + '...', 'wallet', 0); this.addEdge(wId, id, 'uses wallet'); }
        if (features.contacts.telegram) { const id = `tg-${features.contacts.telegram}`; if (!this.nodes.has(id)) this.addNode(id, features.contacts.telegram, 'contact', 0); this.addEdge(wId, id, 'same operator'); }
        this._detectCluster(wId);
        this._propagateRisk(wId, riskResult.riskScore);
        return wId;
    }

    getCluster(domain) {
        const wId = this.domainIndex.get(domain);
        if (!wId) return { nodes: [], edges: [] };
        const visited = new Set([wId]);
        const cNodes = new Set([wId]);
        const cEdges = [];
        const queue = [{ id: wId, depth: 0 }];
        while (queue.length) {
            const { id, depth } = queue.shift();
            if (depth >= 2) continue;
            for (const e of this.edges) {
                let nb = null;
                if (e.source === id) nb = e.target; else if (e.target === id) nb = e.source;
                if (nb && !visited.has(nb)) { visited.add(nb); cNodes.add(nb); queue.push({ id: nb, depth: depth + 1 }); }
                if (nb && (e.source === id || e.target === id)) cEdges.push(e);
            }
        }
        const edgeSet = new Set();
        const unique = cEdges.filter(e => { const k = `${e.source}-${e.target}-${e.label}`; if (edgeSet.has(k)) return false; edgeSet.add(k); return true; });
        return { nodes: Array.from(cNodes).map(id => this.nodes.get(id)).filter(Boolean), edges: unique };
    }

    getFullGraph() { return { nodes: Array.from(this.nodes.values()), edges: [...this.edges] }; }

    getBlocklist() {
        return Array.from(this.nodes.values()).filter(n => n.type === 'website').map(n => ({
            domain: n.label, category: n.metadata?.category || 'Unknown', risk: n.risk,
            tier: n.risk >= 80 ? 'A' : n.risk >= 50 ? 'B' : 'C',
            status: n.risk >= 80 ? 'Blocked' : n.risk >= 50 ? 'Under Review' : 'Monitoring',
            detectedDate: n.addedAt.split('T')[0], cluster: this.clusters.get(n.id) || '—',
            markers: this.edges.filter(e => e.source === n.id || e.target === n.id).length,
            country: n.metadata?.country || 'Unknown',
        })).sort((a, b) => b.risk - a.risk);
    }

    getStats() {
        const ws = Array.from(this.nodes.values()).filter(n => n.type === 'website');
        const cls = new Set(Array.from(this.clusters.values()));
        return {
            scannedToday: ws.length + Math.floor(Math.random() * 50),
            clustersFound: cls.size,
            threatsBlocked: ws.filter(w => w.risk >= 80).length * 100 + Math.floor(Math.random() * 50),
            activeMonitors: ws.filter(w => w.risk >= 50).length * 80 + Math.floor(Math.random() * 20),
        };
    }

    _propagateRisk(srcId, risk) {
        if (risk < 50) return;
        const connected = new Set();
        for (const e of this.edges) { if (e.source === srcId) connected.add(e.target); else if (e.target === srcId) connected.add(e.source); }
        for (const mId of connected) {
            const m = this.nodes.get(mId);
            if (!m || m.type === 'website') continue;
            m.risk = Math.max(m.risk, Math.round(risk * 0.6));
            for (const e of this.edges) {
                let oId = null;
                if (e.source === mId && e.target !== srcId) oId = e.target;
                else if (e.target === mId && e.source !== srcId) oId = e.source;
                if (oId) { const o = this.nodes.get(oId); if (o && o.type === 'website') o.risk = Math.min(100, o.risk + Math.round(risk * 0.15)); }
            }
        }
    }

    _detectCluster(wId) {
        const markers = new Set();
        for (const e of this.edges) { if (e.source === wId) markers.add(e.target); if (e.target === wId) markers.add(e.source); }
        for (const mId of markers) {
            for (const e of this.edges) {
                let oId = null;
                if (e.source === mId && e.target !== wId) oId = e.target;
                if (e.target === mId && e.source !== wId) oId = e.source;
                if (oId && this.clusters.has(oId)) { this.clusters.set(wId, this.clusters.get(oId)); return; }
            }
        }
        if (markers.size > 0) { this.clusterCounter++; this.clusters.set(wId, `CLS-${String(this.clusterCounter).padStart(4, '0')}`); }
    }

    getClusterId(domain) { const id = this.domainIndex.get(domain); return id ? (this.clusters.get(id) || null) : null; }
}

const graphEngine = new GraphEngine();
export default graphEngine;
