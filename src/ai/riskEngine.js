// ===== RISK SCORING ENGINE (Browser-compatible) =====

import {
    gamblingKeywords, phishingKeywords, scamKeywords, pyramidKeywords,
    brandNames, legitimateDomains, knownBadASNs, knownBadHostingProviders,
} from './knownThreats.js';

const rules = [
    {
        name: 'legitimate_domain',
        evaluate: (f) => {
            if (f.domainAnalysis.isLegitimate) {
                return { score: -80, explanation: `${f.domain} is a verified legitimate domain`, type: 'infrastructure', evidence: `Domain "${f.domain}" found in verified legitimate domains whitelist (${legitimateDomains.size} entries)` };
            }
            return null;
        },
    },
    {
        name: 'suspicious_tld',
        evaluate: (f) => {
            if (f.domainAnalysis.isSuspiciousTLD) {
                return { score: 12, explanation: `TLD ".${f.domainAnalysis.tld}" is commonly associated with malicious sites`, type: 'infrastructure', evidence: `Found in domain name: "${f.domain}" → TLD ".${f.domainAnalysis.tld}" matches suspicious TLD database` };
            }
            return null;
        },
    },
    {
        name: 'gambling_keywords',
        evaluate: (f) => {
            if (f.domainAnalysis.isLegitimate) return null;
            const domain = f.domain.toLowerCase();
            const matches = gamblingKeywords.filter(kw => domain.includes(kw));
            if (matches.length > 0) {
                return {
                    score: Math.min(matches.length * 10, 30),
                    explanation: `Domain contains gambling keywords: ${matches.join(', ')}`,
                    type: 'content', category: 'Casino',
                    evidence: `Found in domain name "${f.domain}": keywords [${matches.map(m => `"${m}" at position ${domain.indexOf(m)}`).join(', ')}]`,
                };
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
                return {
                    score: Math.min(matches.length * 12, 35),
                    explanation: `Domain contains phishing indicators: ${matches.join(', ')}`,
                    type: 'content', category: 'Phishing',
                    evidence: `Found in domain name "${f.domain}": phishing patterns [${matches.map(m => `"${m}" at position ${domain.indexOf(m)}`).join(', ')}]`,
                };
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
                return {
                    score: Math.min(matches.length * 10, 30),
                    explanation: `Domain contains scam-related terms: ${matches.join(', ')}`,
                    type: 'content', category: 'Scam',
                    evidence: `Found in domain name "${f.domain}": scam indicators [${matches.map(m => `"${m}"`).join(', ')}]`,
                };
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
                return {
                    score: Math.min(matches.length * 10, 25),
                    explanation: `Domain contains investment/MLM patterns: ${matches.join(', ')}`,
                    type: 'content', category: 'Pyramid',
                    evidence: `Found in domain name "${f.domain}": MLM/pyramid patterns [${matches.map(m => `"${m}"`).join(', ')}]`,
                };
            }
            return null;
        },
    },
    {
        name: 'brand_impersonation',
        evaluate: (f) => {
            const domain = f.domain.toLowerCase();
            for (const brand of brandNames) {
                if (domain.includes(brand) && !legitimateDomains.has(f.domain)) {
                    return {
                        score: 25,
                        explanation: `Domain impersonates brand "${brand}" — likely phishing attempt`,
                        type: 'content', category: 'Phishing',
                        evidence: `Found in domain name "${f.domain}": brand name "${brand}" used in non-official domain. Official domain is "${brand}.com"`,
                    };
                }
            }
            return null;
        },
    },
    {
        name: 'excessive_dashes',
        evaluate: (f) => {
            if (f.domainAnalysis.dashCount >= 3) {
                return {
                    score: 10,
                    explanation: `Domain uses ${f.domainAnalysis.dashCount} dashes — common in generated malicious domains`,
                    type: 'infrastructure',
                    evidence: `Found in domain structure: "${f.domain}" contains ${f.domainAnalysis.dashCount} hyphen characters, typical of algorithmically-generated domains`,
                };
            }
            return null;
        },
    },
    {
        name: 'excessive_numbers',
        evaluate: (f) => {
            if (f.domainAnalysis.numberCount >= 3) {
                return {
                    score: 8,
                    explanation: `Domain contains ${f.domainAnalysis.numberCount} numeric characters — suspicious pattern`,
                    type: 'infrastructure',
                    evidence: `Found in domain name: "${f.domain}" has ${f.domainAnalysis.numberCount} digits — numeric sequences in domains correlate with auto-generated malicious sites`,
                };
            }
            return null;
        },
    },
    {
        name: 'long_domain',
        evaluate: (f) => {
            if (f.domainAnalysis.length > 30) {
                return {
                    score: 6,
                    explanation: `Unusually long domain name (${f.domainAnalysis.length} chars)`,
                    type: 'infrastructure',
                    evidence: `Domain length: "${f.domain}" is ${f.domainAnalysis.length} characters. Average legitimate domain is 10-15 characters.`,
                };
            }
            return null;
        },
    },
    {
        name: 'new_domain',
        evaluate: (f) => {
            if (f.domainAnalysis.domainAge.risky) {
                return {
                    score: 15,
                    explanation: `Domain is very new (~${f.domainAnalysis.domainAge.days} days old) — high risk indicator`,
                    type: 'infrastructure',
                    evidence: `Found in WHOIS data: domain registered approximately ${f.domainAnalysis.domainAge.days} days ago. 78% of malicious domains are less than 90 days old.`,
                };
            }
            return null;
        },
    },
    {
        name: 'self_signed_cert',
        evaluate: (f) => {
            if (f.tls.selfSigned) {
                return {
                    score: 12,
                    explanation: 'TLS certificate is self-signed — no trusted CA verification',
                    type: 'infrastructure',
                    evidence: `Found in TLS certificate: issuer="${f.tls.issuer}", fingerprint="${f.tls.fingerprint.slice(0, 16)}...". Self-signed certificates bypass trusted CA validation.`,
                };
            }
            return null;
        },
    },
    {
        name: 'free_cert_on_suspicious',
        evaluate: (f) => {
            if (f.tls.issuer === "Let's Encrypt" && f.domainAnalysis.isSuspiciousTLD) {
                return {
                    score: 5,
                    explanation: "Free Let's Encrypt certificate on suspicious TLD — minimal investment in legitimacy",
                    type: 'infrastructure',
                    evidence: `Found in TLS certificate: free CA "Let's Encrypt" combined with suspicious TLD ".${f.domainAnalysis.tld}" — low-effort security setup typical of throwaway malicious sites`,
                };
            }
            return null;
        },
    },
    {
        name: 'suspicious_hosting',
        evaluate: (f) => {
            const provider = f.hosting.provider.toLowerCase();
            const isBad = knownBadHostingProviders.some(p => provider.includes(p));
            if (isBad || f.hosting.type === 'Bulletproof' || f.hosting.type === 'Offshore') {
                return {
                    score: 18,
                    explanation: `Hosted on ${f.hosting.provider} (${f.hosting.country}) — ${f.hosting.type} hosting provider`,
                    type: 'infrastructure',
                    evidence: `Found in hosting infrastructure: IP ${f.hosting.ip} → provider "${f.hosting.provider}" (${f.hosting.country}), ASN ${f.hosting.asn}. Classified as "${f.hosting.type}" hosting — known to ignore abuse complaints.`,
                };
            }
            return null;
        },
    },
    {
        name: 'known_bad_asn',
        evaluate: (f) => {
            if (knownBadASNs.has(f.hosting.asn)) {
                return {
                    score: 15,
                    explanation: `Hosting ASN ${f.hosting.asn} is associated with malicious activity`,
                    type: 'infrastructure',
                    evidence: `Found in network data: ASN ${f.hosting.asn} appears in threat intelligence databases as a network frequently hosting malicious content.`,
                };
            }
            return null;
        },
    },
    {
        name: 'has_affiliate_params',
        evaluate: (f) => {
            if (f.trackers.affiliateParams) {
                return {
                    score: 10,
                    explanation: `Affiliate tracking parameters detected (aff_id=${f.trackers.affiliateParams.aff_id})`,
                    type: 'tracking',
                    evidence: `Found in URL parameters: affiliate tracking IDs "aff_id=${f.trackers.affiliateParams.aff_id}", "subid=${f.trackers.affiliateParams.subid}" — indicates paid traffic acquisition typical of scam operations.`,
                };
            }
            return null;
        },
    },
    {
        name: 'multiple_trackers',
        evaluate: (f) => {
            const trackerList = [];
            if (f.trackers.gaId) trackerList.push(`Google Analytics: ${f.trackers.gaId}`);
            if (f.trackers.fbPixel) trackerList.push(`Facebook Pixel: ${f.trackers.fbPixel}`);
            if (f.trackers.ttPixel) trackerList.push(`TikTok Pixel: ${f.trackers.ttPixel}`);
            if (trackerList.length >= 2) {
                return {
                    score: 5,
                    explanation: `${trackerList.length} tracking pixels detected — aggressive marketing instrumentation`,
                    type: 'tracking',
                    evidence: `Found in page source: ${trackerList.join('; ')} — multi-platform ad tracking indicates aggressive paid promotion.`,
                };
            }
            return null;
        },
    },
    {
        name: 'crypto_wallet',
        evaluate: (f) => {
            if (f.financial.cryptoWallet) {
                return {
                    score: 15,
                    explanation: `Cryptocurrency wallet address detected (${f.financial.walletType}: ${f.financial.cryptoWallet.slice(0, 12)}...)`,
                    type: 'financial',
                    evidence: `Found in page source/meta tags: ${f.financial.walletType} wallet "${f.financial.cryptoWallet}" — cryptocurrency payments enable anonymous transactions often used by malicious sites.`,
                };
            }
            return null;
        },
    },
    {
        name: 'unlicensed_payment',
        evaluate: (f) => {
            if (f.financial.paymentGateway && !f.financial.gatewayLicensed) {
                return {
                    score: 12,
                    explanation: `Unlicensed payment gateway "${f.financial.paymentGateway}" detected`,
                    type: 'financial',
                    evidence: `Found in page scripts/forms: payment gateway "${f.financial.paymentGateway}" not found in licensed payment processor registries. Unlicensed gateways often enable fraud.`,
                };
            }
            return null;
        },
    },
    {
        name: 'complex_redirect',
        evaluate: (f) => {
            if (f.redirectChain.length >= 3) {
                return {
                    score: 10,
                    explanation: `Complex redirect chain with ${f.redirectChain.length} steps — conversion funnel detected`,
                    type: 'funnel',
                    evidence: `Found in HTTP response chain: ${f.redirectChain.length} redirects [${f.redirectChain.map(r => r.type).join(' → ')}]. Multi-step funnels are used to evade detection and track referrals.`,
                };
            }
            return null;
        },
    },
    {
        name: 'tracker_redirect',
        evaluate: (f) => {
            const has = f.redirectChain.some(r => r.type === 'Tracker Redirect');
            if (has) {
                return {
                    score: 8,
                    explanation: 'Redirect chain includes external tracker hop — affiliate funnel pattern',
                    type: 'funnel',
                    evidence: `Found at redirect step: one or more hops route through external tracking domains before landing. This pattern is used by affiliate scam networks to attribute conversions.`,
                };
            }
            return null;
        },
    },
];

function classifyCategory(firedRules) {
    const scores = { Casino: 0, Scam: 0, Phishing: 0, Pyramid: 0 };
    for (const r of firedRules) { if (r.category) scores[r.category] += r.score; }
    const general = firedRules.filter(r => !r.category).reduce((s, r) => s + Math.max(r.score, 0), 0);
    const detected = Object.entries(scores).filter(([, s]) => s > 0);
    if (detected.length > 0) {
        const bonus = general * 0.3 / detected.length;
        detected.forEach(([cat]) => { scores[cat] += bonus; });
    }
    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    if (total === 0) return { category: 'Unknown', confidence: 0, probabilities: scores };
    const prob = {};
    for (const [c, s] of sorted) prob[c] = Math.round((s / total) * 100) / 100;
    return {
        category: sorted[0][0],
        confidence: Math.round(Math.min(sorted[0][1] / total, 0.99) * 100) / 100,
        probabilities: prob,
    };
}

export function scoreRisk(features) {
    const firedRules = [];
    for (const rule of rules) {
        const result = rule.evaluate(features);
        if (result) firedRules.push({ name: rule.name, ...result });
    }
    const riskScore = Math.max(0, Math.min(100, firedRules.reduce((s, r) => s + r.score, 0)));

    if (features.domainAnalysis.isLegitimate || riskScore <= 5) {
        return {
            riskScore, category: 'Safe', confidence: 0.99,
            probabilities: { Casino: 0, Scam: 0, Phishing: 0, Pyramid: 0 },
            explanations: [], tier: 'C', status: 'Safe',
            rulesEvaluated: rules.length, rulesFired: firedRules.length,
        };
    }

    const cls = classifyCategory(firedRules);
    return {
        riskScore, category: cls.category, confidence: cls.confidence,
        probabilities: cls.probabilities,
        explanations: firedRules.filter(r => r.score > 0).sort((a, b) => b.score - a.score)
            .map(r => ({ label: r.explanation, weight: r.score, type: r.type, evidence: r.evidence })),
        tier: riskScore >= 80 ? 'A' : riskScore >= 50 ? 'B' : 'C',
        status: riskScore >= 80 ? 'Blocked' : riskScore >= 50 ? 'Under Review' : 'Monitoring',
        rulesEvaluated: rules.length, rulesFired: firedRules.length,
    };
}
