// ===== RISK SCORING ENGINE =====
// Deterministic, explainable risk scoring using heuristic rules + pattern analysis.

import {
    gamblingKeywords,
    phishingKeywords,
    scamKeywords,
    pyramidKeywords,
    brandNames,
    legitimateDomains,
    knownBadASNs,
    knownBadHostingProviders,
} from './knownThreats.js';

// --- Rule definitions ---
// Each rule is a function that takes features and returns { score, explanation, type } or null

const rules = [
    // ===== WHITELIST (negative scores for legitimate sites) =====
    {
        name: 'legitimate_domain',
        evaluate: (f) => {
            if (f.domainAnalysis.isLegitimate) {
                return { score: -80, explanation: `${f.domain} is a verified legitimate domain`, type: 'infrastructure' };
            }
            return null;
        },
    },

    // ===== TLD ANALYSIS =====
    {
        name: 'suspicious_tld',
        evaluate: (f) => {
            if (f.domainAnalysis.isSuspiciousTLD) {
                return { score: 12, explanation: `TLD ".${f.domainAnalysis.tld}" is commonly associated with malicious sites`, type: 'infrastructure' };
            }
            return null;
        },
    },

    // ===== DOMAIN NAME PATTERN ANALYSIS =====
    {
        name: 'gambling_keywords',
        evaluate: (f) => {
            if (f.domainAnalysis.isLegitimate) return null;
            const domain = f.domain.toLowerCase();
            const matches = gamblingKeywords.filter(kw => domain.includes(kw));
            if (matches.length > 0) {
                const score = Math.min(matches.length * 10, 30);
                return { score, explanation: `Domain contains gambling keywords: ${matches.join(', ')}`, type: 'content', category: 'Casino' };
            }
            return null;
        },
    },
    {
        name: 'phishing_keywords',
        evaluate: (f) => {
            if (f.domainAnalysis.isLegitimate) return null;
            const domain = f.domain.toLowerCase();
            const matches = phishingKeywords.filter(kw => domain.includes(kw));
            if (matches.length > 0) {
                const score = Math.min(matches.length * 12, 35);
                return { score, explanation: `Domain contains phishing indicators: ${matches.join(', ')}`, type: 'content', category: 'Phishing' };
            }
            return null;
        },
    },
    {
        name: 'scam_keywords',
        evaluate: (f) => {
            if (f.domainAnalysis.isLegitimate) return null;
            const domain = f.domain.toLowerCase();
            const matches = scamKeywords.filter(kw => domain.includes(kw));
            if (matches.length > 0) {
                const score = Math.min(matches.length * 10, 30);
                return { score, explanation: `Domain contains scam-related terms: ${matches.join(', ')}`, type: 'content', category: 'Scam' };
            }
            return null;
        },
    },
    {
        name: 'pyramid_keywords',
        evaluate: (f) => {
            if (f.domainAnalysis.isLegitimate) return null;
            const domain = f.domain.toLowerCase();
            const matches = pyramidKeywords.filter(kw => domain.includes(kw));
            if (matches.length > 0) {
                const score = Math.min(matches.length * 10, 25);
                return { score, explanation: `Domain contains investment/MLM patterns: ${matches.join(', ')}`, type: 'content', category: 'Pyramid' };
            }
            return null;
        },
    },

    // ===== BRAND IMPERSONATION =====
    {
        name: 'brand_impersonation',
        evaluate: (f) => {
            const domain = f.domain.toLowerCase();
            for (const brand of brandNames) {
                if (domain.includes(brand) && !legitimateDomains.has(f.domain)) {
                    return { score: 25, explanation: `Domain impersonates brand "${brand}" — likely phishing attempt`, type: 'content', category: 'Phishing' };
                }
            }
            return null;
        },
    },

    // ===== DOMAIN STRUCTURE =====
    {
        name: 'excessive_dashes',
        evaluate: (f) => {
            if (f.domainAnalysis.dashCount >= 3) {
                return { score: 10, explanation: `Domain uses ${f.domainAnalysis.dashCount} dashes — common in generated malicious domains`, type: 'infrastructure' };
            }
            return null;
        },
    },
    {
        name: 'excessive_numbers',
        evaluate: (f) => {
            if (f.domainAnalysis.numberCount >= 3) {
                return { score: 8, explanation: `Domain contains ${f.domainAnalysis.numberCount} numeric characters — suspicious pattern`, type: 'infrastructure' };
            }
            return null;
        },
    },
    {
        name: 'long_domain',
        evaluate: (f) => {
            if (f.domainAnalysis.length > 30) {
                return { score: 6, explanation: `Unusually long domain name (${f.domainAnalysis.length} chars)`, type: 'infrastructure' };
            }
            return null;
        },
    },

    // ===== DOMAIN AGE =====
    {
        name: 'new_domain',
        evaluate: (f) => {
            if (f.domainAnalysis.domainAge.risky) {
                return { score: 15, explanation: `Domain is very new (~${f.domainAnalysis.domainAge.days} days old) — high risk indicator`, type: 'infrastructure' };
            }
            return null;
        },
    },

    // ===== TLS CERTIFICATE =====
    {
        name: 'self_signed_cert',
        evaluate: (f) => {
            if (f.tls.selfSigned) {
                return { score: 12, explanation: 'TLS certificate is self-signed — no trusted CA verification', type: 'infrastructure' };
            }
            return null;
        },
    },
    {
        name: 'free_cert_on_suspicious',
        evaluate: (f) => {
            if (f.tls.issuer === "Let's Encrypt" && f.domainAnalysis.isSuspiciousTLD) {
                return { score: 5, explanation: "Free Let's Encrypt certificate on suspicious TLD — minimal investment in legitimacy", type: 'infrastructure' };
            }
            return null;
        },
    },

    // ===== HOSTING =====
    {
        name: 'suspicious_hosting',
        evaluate: (f) => {
            const provider = f.hosting.provider.toLowerCase();
            const isBad = knownBadHostingProviders.some(p => provider.includes(p));
            if (isBad || f.hosting.type === 'Bulletproof' || f.hosting.type === 'Offshore') {
                return { score: 18, explanation: `Hosted on ${f.hosting.provider} (${f.hosting.country}) — ${f.hosting.type} hosting provider`, type: 'infrastructure' };
            }
            return null;
        },
    },
    {
        name: 'known_bad_asn',
        evaluate: (f) => {
            if (knownBadASNs.has(f.hosting.asn)) {
                return { score: 15, explanation: `Hosting ASN ${f.hosting.asn} is associated with malicious activity`, type: 'infrastructure' };
            }
            return null;
        },
    },

    // ===== TRACKING =====
    {
        name: 'has_affiliate_params',
        evaluate: (f) => {
            if (f.trackers.affiliateParams) {
                return { score: 10, explanation: `Affiliate tracking parameters detected (aff_id=${f.trackers.affiliateParams.aff_id})`, type: 'tracking' };
            }
            return null;
        },
    },
    {
        name: 'multiple_trackers',
        evaluate: (f) => {
            const count = [f.trackers.gaId, f.trackers.fbPixel, f.trackers.ttPixel].filter(Boolean).length;
            if (count >= 2) {
                return { score: 5, explanation: `${count} tracking pixels detected — aggressive marketing instrumentation`, type: 'tracking' };
            }
            return null;
        },
    },

    // ===== FINANCIAL =====
    {
        name: 'crypto_wallet',
        evaluate: (f) => {
            if (f.financial.cryptoWallet) {
                return { score: 15, explanation: `Cryptocurrency wallet address detected (${f.financial.walletType}: ${f.financial.cryptoWallet.slice(0, 12)}...)`, type: 'financial' };
            }
            return null;
        },
    },
    {
        name: 'unlicensed_payment',
        evaluate: (f) => {
            if (f.financial.paymentGateway && !f.financial.gatewayLicensed) {
                return { score: 12, explanation: `Unlicensed payment gateway "${f.financial.paymentGateway}" detected`, type: 'financial' };
            }
            return null;
        },
    },

    // ===== REDIRECT CHAIN =====
    {
        name: 'complex_redirect',
        evaluate: (f) => {
            if (f.redirectChain.length >= 3) {
                return { score: 10, explanation: `Complex redirect chain with ${f.redirectChain.length} steps — conversion funnel detected`, type: 'funnel' };
            }
            return null;
        },
    },
    {
        name: 'tracker_redirect',
        evaluate: (f) => {
            const hasTrackerRedirect = f.redirectChain.some(r => r.type === 'Tracker Redirect');
            if (hasTrackerRedirect) {
                return { score: 8, explanation: 'Redirect chain includes external tracker hop — affiliate funnel pattern', type: 'funnel' };
            }
            return null;
        },
    },

    // ===== DNS =====
    {
        name: 'dns_resolution_failed',
        evaluate: (f) => {
            if (!f.dns.success) {
                return { score: 5, explanation: 'Domain DNS resolution failed — domain may be recently registered or parked', type: 'infrastructure' };
            }
            return null;
        },
    },
];

// ===== CATEGORY CLASSIFIER =====
function classifyCategory(firedRules) {
    const categoryScores = { Casino: 0, Scam: 0, Phishing: 0, Pyramid: 0 };

    for (const rule of firedRules) {
        if (rule.category) {
            categoryScores[rule.category] += rule.score;
        }
    }

    // Add base scores from general signals
    const generalScore = firedRules
        .filter(r => !r.category)
        .reduce((sum, r) => sum + Math.max(r.score, 0), 0);

    // Distribute general risk across detected categories
    const detectedCategories = Object.entries(categoryScores).filter(([, s]) => s > 0);
    if (detectedCategories.length > 0) {
        const bonus = generalScore * 0.3 / detectedCategories.length;
        detectedCategories.forEach(([cat]) => { categoryScores[cat] += bonus; });
    }

    // Find primary category
    const total = Object.values(categoryScores).reduce((a, b) => a + b, 0);
    const sorted = Object.entries(categoryScores).sort((a, b) => b[1] - a[1]);

    if (total === 0) {
        return { category: 'Unknown', confidence: 0, probabilities: categoryScores };
    }

    const primary = sorted[0];
    const confidence = Math.min(primary[1] / Math.max(total, 1), 0.99);
    const probabilities = {};
    for (const [cat, score] of sorted) {
        probabilities[cat] = Math.round((score / Math.max(total, 1)) * 100) / 100;
    }

    return {
        category: primary[0],
        confidence: Math.round(confidence * 100) / 100,
        probabilities,
    };
}

// ===== MAIN SCORING FUNCTION =====
export function scoreRisk(features) {
    const firedRules = [];

    for (const rule of rules) {
        const result = rule.evaluate(features);
        if (result) {
            firedRules.push({ name: rule.name, ...result });
        }
    }

    // Calculate raw score
    let rawScore = firedRules.reduce((sum, r) => sum + r.score, 0);

    // Clamp to 0-100
    const riskScore = Math.max(0, Math.min(100, rawScore));

    // If legitimate domain, override to Safe
    if (features.domainAnalysis.isLegitimate || riskScore <= 5) {
        return {
            riskScore,
            category: 'Safe',
            confidence: 0.99,
            probabilities: { Casino: 0, Scam: 0, Phishing: 0, Pyramid: 0 },
            explanations: [],
            tier: 'C',
            status: 'Safe',
            rulesEvaluated: rules.length,
            rulesFired: firedRules.length,
        };
    }

    // Get category classification
    const classification = classifyCategory(firedRules);

    // Build explanations (sorted by weight, only positive scores)
    const explanations = firedRules
        .filter(r => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(r => ({
            label: r.explanation,
            weight: r.score,
            type: r.type,
        }));

    // Risk tier
    const tier = riskScore >= 80 ? 'A' : riskScore >= 50 ? 'B' : 'C';
    const status = riskScore >= 80 ? 'Blocked' : riskScore >= 50 ? 'Under Review' : 'Monitoring';

    return {
        riskScore,
        category: classification.category,
        confidence: classification.confidence,
        probabilities: classification.probabilities,
        explanations,
        tier,
        status,
        rulesEvaluated: rules.length,
        rulesFired: firedRules.length,
    };
}
