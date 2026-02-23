// ===== CLIENT-SIDE ANALYSIS ORCHESTRATOR =====
// Replaces the backend API for GitHub Pages static hosting.

import { extractFeatures } from './featureExtractor.js';
import { scoreRisk } from './riskEngine.js';
import graphEngine from './graphEngine.js';

const analysisCache = new Map();

export async function analyzeWebsite(url) {
    const domain = url.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

    if (analysisCache.has(domain)) {
        const cached = analysisCache.get(domain);
        return { ...cached, cached: true, scanTime: 0.0 };
    }

    const startTime = performance.now();

    // Simulate progressive scanning delay for UX
    await new Promise(r => setTimeout(r, 300 + Math.random() * 700));

    const features = extractFeatures(url);
    const riskResult = scoreRisk(features);
    const graphId = graphEngine.insertAnalysis(domain, features, riskResult);
    const clusterId = graphEngine.getClusterId(domain);
    const scanTime = ((performance.now() - startTime) / 1000).toFixed(1);

    const result = {
        url: domain,
        risk_score: riskResult.riskScore,
        category: riskResult.category,
        confidence: riskResult.confidence,
        probabilities: riskResult.probabilities,
        status: riskResult.status,
        tier: riskResult.tier,
        explanations: riskResult.explanations,
        rules_evaluated: riskResult.rulesEvaluated,
        rules_fired: riskResult.rulesFired,
        markers: {
            trackers: features.trackers,
            financial: features.financial,
            contacts: features.contacts,
        },
        redirect_chain: features.redirectChain,
        hosting: features.hosting,
        tls: features.tls,
        dns: features.dns,
        domain_analysis: features.domainAnalysis,
        cluster_id: clusterId,
        graph_id: graphId,
        scan_time: parseFloat(scanTime),
        analyzed_at: new Date().toISOString(),
        cached: false,
    };

    analysisCache.set(domain, result);
    return result;
}

export function getCluster(domain) {
    if (domain) {
        return graphEngine.getCluster(domain);
    }
    return graphEngine.getFullGraph();
}

export function getBlocklist() {
    return graphEngine.getBlocklist();
}

export function getStats() {
    return graphEngine.getStats();
}

export function getThreatFeed() {
    const blocklist = graphEngine.getBlocklist();
    return blocklist.slice(0, 10).map((entry, i) => ({
        domain: entry.domain,
        category: entry.category,
        risk: entry.risk,
        time: `${(i + 1) * 3} min ago`,
        action: entry.risk >= 80 ? 'Auto-blocked' : 'Flagged',
    }));
}
