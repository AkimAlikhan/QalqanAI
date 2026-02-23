// ===== POST /api/analyze =====
import express from 'express';
import { extractFeatures } from '../ai/featureExtractor.js';
import { scoreRisk } from '../ai/riskEngine.js';
import graphEngine from '../ai/graphEngine.js';

const router = express.Router();

router.post('/', async (req, res) => {
    const startTime = Date.now();

    try {
        const { url } = req.body;
        if (!url || typeof url !== 'string' || url.trim().length === 0) {
            return res.status(400).json({ error: 'URL is required' });
        }

        const cleanUrl = url.trim();

        // Check cache first — same URL = same result
        const cached = graphEngine.analysisCache.get(cleanUrl.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]);
        if (cached) {
            const scanDuration = `${((Date.now() - startTime) / 1000).toFixed(1)}s`;
            return res.json({
                url: cleanUrl,
                domain: cached.features.domain,
                risk_score: cached.riskResult.riskScore,
                category: cached.riskResult.category,
                confidence: cached.riskResult.confidence,
                probabilities: cached.riskResult.probabilities,
                tier: cached.riskResult.tier,
                status: cached.riskResult.status,
                explanations: cached.riskResult.explanations,
                markers: formatMarkers(cached.features),
                redirect_chain: cached.features.redirectChain,
                scan_duration: scanDuration,
                scanned_at: cached.analyzedAt,
                cluster_id: graphEngine.getClusterId(cached.features.domain),
                rules_evaluated: cached.riskResult.rulesEvaluated,
                rules_fired: cached.riskResult.rulesFired,
                cached: true,
            });
        }

        // Step 1: Feature extraction (real DNS/TLS + heuristics)
        const features = await extractFeatures(cleanUrl);

        // Step 2: Risk scoring (deterministic rules)
        const riskResult = scoreRisk(features);

        // Step 3: Graph intelligence (insert + cluster + propagate)
        graphEngine.insertAnalysis(features.domain, features, riskResult);

        // Step 4: Check for graph-based risk boost
        const cluster = graphEngine.getCluster(features.domain);
        let graphBoost = 0;
        if (cluster.nodes.length > 3) {
            const avgClusterRisk = cluster.nodes
                .filter(n => n.type === 'website' && n.label !== features.domain)
                .reduce((sum, n) => sum + n.risk, 0) / Math.max(cluster.nodes.filter(n => n.type === 'website' && n.label !== features.domain).length, 1);

            if (avgClusterRisk > 70) {
                graphBoost = Math.round((avgClusterRisk - 50) * 0.2);
                riskResult.riskScore = Math.min(100, riskResult.riskScore + graphBoost);
                riskResult.explanations.push({
                    label: `Connected to ${cluster.nodes.filter(n => n.type === 'website').length - 1} sites in cluster with avg risk ${Math.round(avgClusterRisk)} — graph-based risk propagation applied`,
                    weight: graphBoost,
                    type: 'ecosystem',
                });
            }
        }

        const scanDuration = `${((Date.now() - startTime) / 1000).toFixed(1)}s`;
        const clusterId = graphEngine.getClusterId(features.domain);

        res.json({
            url: cleanUrl,
            domain: features.domain,
            risk_score: riskResult.riskScore,
            category: riskResult.category,
            confidence: riskResult.confidence,
            probabilities: riskResult.probabilities,
            tier: riskResult.tier,
            status: riskResult.status,
            explanations: riskResult.explanations,
            markers: formatMarkers(features),
            redirect_chain: features.redirectChain,
            scan_duration: scanDuration,
            scanned_at: features.extractedAt,
            cluster_id: clusterId,
            rules_evaluated: riskResult.rulesEvaluated,
            rules_fired: riskResult.rulesFired,
            graph_boost: graphBoost,
            cached: false,
        });
    } catch (err) {
        console.error('Analysis error:', err);
        res.status(500).json({ error: 'Analysis failed', message: err.message });
    }
});

function formatMarkers(features) {
    return {
        infrastructure: [
            { key: 'IP Address', value: features.dns.ip },
            { key: 'Hosting / ASN', value: `${features.hosting.asn} — ${features.hosting.provider}, ${features.hosting.country}` },
            { key: 'TLS Certificate', value: `SHA256:${features.tls.fingerprint} (${features.tls.issuer})` },
            { key: 'TLS Self-Signed', value: features.tls.selfSigned ? 'Yes ⚠️' : 'No' },
            { key: 'Domain Age', value: `${features.domainAnalysis.domainAge.days} days (${features.domainAnalysis.domainAge.label})` },
            { key: 'DNS Resolution', value: features.dns.success ? 'Success' : 'Failed ⚠️' },
        ],
        tracking: [
            ...(features.trackers.gaId ? [{ key: 'Google Analytics', value: features.trackers.gaId }] : []),
            ...(features.trackers.fbPixel ? [{ key: 'Facebook Pixel', value: features.trackers.fbPixel }] : []),
            ...(features.trackers.ttPixel ? [{ key: 'TikTok Pixel', value: features.trackers.ttPixel }] : []),
            ...(features.trackers.affiliateParams ? [{ key: 'Affiliate Params', value: `aff_id=${features.trackers.affiliateParams.aff_id}, subid=${features.trackers.affiliateParams.subid}` }] : []),
        ],
        financial: [
            ...(features.financial.cryptoWallet ? [{ key: `Crypto Wallet (${features.financial.walletType})`, value: features.financial.cryptoWallet }] : []),
            ...(features.financial.paymentGateway ? [{ key: 'Payment Gateway', value: `${features.financial.paymentGateway} (${features.financial.gatewayLicensed ? 'Licensed' : 'Unlicensed ⚠️'})` }] : []),
        ],
        contacts: [
            ...(features.contacts.telegram ? [{ key: 'Telegram', value: features.contacts.telegram }] : []),
            ...(features.contacts.whatsapp ? [{ key: 'WhatsApp', value: features.contacts.whatsapp }] : []),
            ...(features.contacts.email ? [{ key: 'Email', value: features.contacts.email }] : []),
        ],
    };
}

export default router;
