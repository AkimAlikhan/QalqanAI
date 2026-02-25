// ===== CLIENT-SIDE ANALYSIS ORCHESTRATOR =====
// Replaces the backend API for GitHub Pages static hosting.

import { extractFeatures } from './featureExtractor.js';
import { scoreRisk } from './riskEngine.js';
import graphEngine from './graphEngine.js';
import { legitimateDomains } from './knownThreats.js';

const analysisCache = new Map();
const ML_API_URL = 'http://localhost:5001/api/ml/predict';

// Call the Python ML model server for secondary classification
async function fetchMLPrediction(url) {
    try {
        const resp = await fetch(ML_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
            signal: AbortSignal.timeout(5000), // 5s timeout
        });
        if (!resp.ok) return null;
        return await resp.json();
    } catch {
        // ML server not available — not critical
        return null;
    }
}

// Check if domain actually exists using DNS-over-HTTPS
async function checkDomainExists(domain) {
    try {
        const resp = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=A`, {
            headers: { 'Accept': 'application/dns-json' },
        });
        if (!resp.ok) return { exists: true, method: 'fallback' }; // assume exists if API fails
        const data = await resp.json();
        // Status 3 = NXDOMAIN (domain doesn't exist)
        if (data.Status === 3) return { exists: false, method: 'dns' };
        // Status 0 = NOERROR with answers means domain exists
        if (data.Status === 0 && data.Answer && data.Answer.length > 0) {
            return { exists: true, method: 'dns', ip: data.Answer[0].data };
        }
        // Status 0 but no answers — domain exists but no A record
        if (data.Status === 0) return { exists: true, method: 'dns', noRecord: true };
        return { exists: true, method: 'fallback' };
    } catch {
        // If DNS check fails, still allow analysis (offline mode)
        return { exists: true, method: 'fallback' };
    }
}

export async function analyzeWebsite(url) {
    const domain = url.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

    // Validate domain format
    if (!domain || !domain.includes('.') || domain.length < 4) {
        throw new Error('Invalid domain format. Please enter a valid domain like "example.com".');
    }

    if (analysisCache.has(domain)) {
        const cached = analysisCache.get(domain);
        return { ...cached, cached: true, scanTime: 0.0 };
    }

    const startTime = performance.now();

    // Check if domain exists (real DNS lookup)
    const dnsCheck = await checkDomainExists(domain);

    if (!dnsCheck.exists) {
        const result = {
            url: domain,
            domainExists: false,
            risk_score: 0,
            category: 'Not Found',
            confidence: 1.0,
            probabilities: { Casino: 0, Scam: 0, Phishing: 0, Pyramid: 0 },
            status: 'Domain Not Found',
            tier: 'N/A',
            explanations: [{
                label: `Domain "${domain}" does not exist — DNS lookup returned NXDOMAIN`,
                weight: 0,
                type: 'dns',
                evidence: 'Cloudflare DNS-over-HTTPS returned Status 3 (NXDOMAIN)',
            }],
            rules_evaluated: 0,
            rules_fired: 0,
            markers: { trackers: {}, financial: {}, contacts: {} },
            redirect_chain: [],
            hosting: {},
            tls: {},
            dns: { success: false, error: 'NXDOMAIN' },
            domain_analysis: {},
            cluster_id: null,
            graph_id: null,
            scan_time: parseFloat(((performance.now() - startTime) / 1000).toFixed(1)),
            analyzed_at: new Date().toISOString(),
            cached: false,
        };
        return result;
    }

    // Simulate progressive scanning delay for UX
    await new Promise(r => setTimeout(r, 300 + Math.random() * 700));

    // Run ML prediction in parallel with feature extraction
    const mlPromise = fetchMLPrediction(domain);

    const features = extractFeatures(url, dnsCheck.ip);
    const riskResult = scoreRisk(features);
    const graphId = graphEngine.insertAnalysis(domain, features, riskResult);
    const clusterId = graphEngine.getClusterId(domain);
    const mlResult = await mlPromise;
    const scanTime = ((performance.now() - startTime) / 1000).toFixed(1);

    const result = {
        url: domain,
        domainExists: true,
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
            infrastructure: {
                ip: features.hosting.ip,
                provider: features.hosting.provider,
                country: features.hosting.country,
                type: features.hosting.type,
                asn: features.hosting.asn,
                tls_issuer: features.tls.issuer,
                tls_fingerprint: features.tls.fingerprint,
            },
            tracking: features.trackers,
            financial: features.financial,
            contacts: features.contacts,
        },
        redirect_chain: features.redirectChain,
        hosting: features.hosting,
        tls: features.tls,
        dns: features.dns,
        domain_analysis: {
            ...features.domainAnalysis,
            whois: features.whois,
        },
        cluster_id: clusterId,
        graph_id: graphId,
        scan_time: parseFloat(scanTime),
        analyzed_at: new Date().toISOString(),
        cached: false,
        ml_prediction: mlResult || null,
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
        country: entry.country,
        time: `${(i + 1) * 3} min ago`,
        action: entry.risk >= 80 ? 'Auto-blocked' : 'Flagged',
    }));
}
