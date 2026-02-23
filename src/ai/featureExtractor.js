// ===== FEATURE EXTRACTOR (Browser-compatible) =====
// No Node.js DNS/TLS — uses deterministic hashing for all features.

import { suspiciousTLDs, legitimateDomains } from './knownThreats.js';

// Simple hash function for browser
function deterministicHash(input, length = 8) {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    const hex = Math.abs(hash).toString(16).padStart(length, '0');
    return hex.slice(0, length);
}

function parseDomain(urlString) {
    let cleaned = urlString.trim().toLowerCase();
    cleaned = cleaned.replace(/^https?:\/\//, '').replace(/^www\./, '');
    const domain = cleaned.split('/')[0].split('?')[0].split('#')[0];
    return domain;
}

function analyzeDomain(domain) {
    const parts = domain.split('.');
    const tld = parts[parts.length - 1];
    const name = parts.slice(0, -1).join('.');

    const dashCount = (name.match(/-/g) || []).length;
    const numberCount = (name.match(/\d/g) || []).length;
    const entropy = new Set(name.split('')).size / Math.max(name.length, 1);

    // Deterministic domain age based on hash
    const ageHash = parseInt(deterministicHash(domain + 'age', 4), 16);
    const ageDays = ageHash % 3000;

    return {
        tld,
        name,
        length: domain.length,
        dashCount,
        numberCount,
        entropy: Math.round(entropy * 100) / 100,
        isSuspiciousTLD: suspiciousTLDs.has(tld),
        isLegitimate: legitimateDomains.has(domain),
        domainAge: {
            days: ageDays,
            label: ageDays < 90 ? 'Very New' : ageDays < 365 ? 'Recent' : 'Established',
            risky: ageDays < 90,
        },
    };
}

function generateIP(domain) {
    const h = deterministicHash(domain + 'ip', 8);
    const o1 = (parseInt(h.slice(0, 2), 16) % 223) + 1;
    const o2 = parseInt(h.slice(2, 4), 16) % 256;
    const o3 = parseInt(h.slice(4, 6), 16) % 256;
    const o4 = parseInt(h.slice(6, 8), 16) % 256;
    return `${o1}.${o2}.${o3}.${o4}`;
}

function analyzeHosting(ip, domain) {
    const hash = deterministicHash(domain + 'hosting', 4);
    const idx = parseInt(hash, 16);

    const providers = [
        { name: 'Cloudflare', country: 'US', type: 'CDN' },
        { name: 'DigitalOcean', country: 'US', type: 'Cloud' },
        { name: 'Hetzner', country: 'DE', type: 'Dedicated' },
        { name: 'OVH', country: 'FR', type: 'Cloud' },
        { name: 'Hostkey', country: 'NL', type: 'Bulletproof' },
        { name: 'Shinjiru', country: 'MY', type: 'Offshore' },
        { name: 'Amazon AWS', country: 'US', type: 'Cloud' },
        { name: 'Google Cloud', country: 'US', type: 'Cloud' },
        { name: 'Quasi Networks', country: 'NL', type: 'Bulletproof' },
        { name: 'Linode', country: 'US', type: 'Cloud' },
    ];

    const provider = providers[idx % providers.length];
    const asnNum = 10000 + (idx % 90000);

    return {
        ip,
        provider: provider.name,
        country: provider.country,
        type: provider.type,
        asn: `AS${asnNum}`,
    };
}

function generateTLS(domain) {
    const fp = deterministicHash(domain + 'tls', 16);
    const issuers = ["Let's Encrypt", 'DigiCert', 'Comodo', 'GeoTrust', 'Sectigo', 'Self-Signed CA'];
    const idx = parseInt(deterministicHash(domain + 'issuer', 2), 16);
    const issuer = issuers[idx % issuers.length];

    return {
        fingerprint: fp,
        issuer,
        selfSigned: issuer === 'Self-Signed CA',
        valid: issuer !== 'Self-Signed CA',
    };
}

function generateTrackers(domain) {
    const h = deterministicHash(domain + 'track', 8);
    const hasGA = parseInt(h.slice(0, 2), 16) > 80;
    const hasFB = parseInt(h.slice(2, 4), 16) > 100;
    const hasTT = parseInt(h.slice(4, 6), 16) > 150;
    const hasAff = parseInt(h.slice(6, 8), 16) > 120;

    return {
        gaId: hasGA ? `UA-${parseInt(h.slice(0, 4), 16) % 90000000 + 10000000}` : null,
        fbPixel: hasFB ? `${parseInt(h.slice(2, 6), 16) % 900000000 + 100000000}` : null,
        ttPixel: hasTT ? `TT-${parseInt(h.slice(4, 8), 16) % 9000000 + 1000000}` : null,
        affiliateParams: hasAff ? {
            aff_id: parseInt(h.slice(0, 4), 16) % 10000,
            subid: deterministicHash(domain + 'sub', 6),
        } : null,
    };
}

function generateFinancialMarkers(domain) {
    const h = deterministicHash(domain + 'fin', 8);
    const hasCrypto = parseInt(h.slice(0, 2), 16) > 100;
    const hasPayment = parseInt(h.slice(2, 4), 16) > 90;

    const walletTypes = ['BTC', 'ETH', 'USDT'];
    const gateways = ['FreekKassa', 'PayAdmit', 'Cryptomus', 'Payeer'];

    return {
        cryptoWallet: hasCrypto ? `bc1q${deterministicHash(domain + 'wallet', 12)}` : null,
        walletType: walletTypes[parseInt(h.slice(0, 1), 16) % walletTypes.length],
        paymentGateway: hasPayment ? gateways[parseInt(h.slice(2, 3), 16) % gateways.length] : null,
        gatewayLicensed: parseInt(h.slice(4, 5), 16) > 10,
    };
}

function generateContactMarkers(domain) {
    const h = deterministicHash(domain + 'contact', 8);
    const hasTG = parseInt(h.slice(0, 2), 16) > 80;
    const hasWA = parseInt(h.slice(2, 4), 16) > 140;
    const hasEmail = parseInt(h.slice(4, 6), 16) > 100;

    return {
        telegram: hasTG ? `@${domain.split('.')[0]}_support_bot` : null,
        whatsapp: hasWA ? `+7${parseInt(h.slice(2, 6), 16) % 9000000000 + 1000000000}` : null,
        email: hasEmail ? `support@${domain}` : null,
    };
}

function generateRedirectChain(domain, domainAnalysis) {
    const h = deterministicHash(domain + 'redirect', 4);
    const chainLength = domainAnalysis.isSuspiciousTLD ? 3 + (parseInt(h.slice(0, 1), 16) % 3) : 1 + (parseInt(h.slice(0, 1), 16) % 2);

    const types = ['HTTP Redirect', 'JS Redirect', 'Meta Refresh', 'Tracker Redirect', 'Landing Page'];
    const chain = [];

    for (let i = 0; i < chainLength; i++) {
        const stepHash = deterministicHash(domain + `step${i}`, 6);
        chain.push({
            step: i + 1,
            url: i === 0 ? `https://${domain}/` :
                i === chainLength - 1 ? `https://${domain}/landing?ref=${stepHash}` :
                    `https://trk-${stepHash}.${domainAnalysis.tld}/go`,
            status: i < chainLength - 1 ? 302 : 200,
            type: types[i % types.length],
        });
    }

    return chain;
}

export function extractFeatures(urlString) {
    const domain = parseDomain(urlString);
    const domainAnalysis = analyzeDomain(domain);
    const ip = generateIP(domain);
    const hosting = analyzeHosting(ip, domain);
    const tlsInfo = generateTLS(domain);
    const trackers = generateTrackers(domain);
    const financial = generateFinancialMarkers(domain);
    const contacts = generateContactMarkers(domain);
    const redirectChain = generateRedirectChain(domain, domainAnalysis);

    return {
        url: urlString,
        domain,
        domainAnalysis,
        dns: { success: true, ip, reverse: `${deterministicHash(domain, 6)}.host.net` },
        tls: tlsInfo,
        hosting,
        trackers,
        financial,
        contacts,
        redirectChain,
        extractedAt: new Date().toISOString(),
    };
}
