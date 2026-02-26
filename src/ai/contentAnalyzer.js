// ===== LIVE WEBSITE CONTENT ANALYZER =====
// Fetches real website HTML via CORS proxy and scans for threat indicators.
// This dramatically improves risk accuracy by analyzing actual page content,
// not just the domain name.

import {
    gamblingKeywords, phishingKeywords, scamKeywords, pyramidKeywords,
} from './knownThreats.js';

const CORS_PROXIES = [
    (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

/**
 * Fetch website HTML content via CORS proxy.
 * Tries multiple proxies for reliability.
 */
async function fetchContent(url) {
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;

    for (const proxyFn of CORS_PROXIES) {
        try {
            const proxyUrl = proxyFn(fullUrl);
            const resp = await fetch(proxyUrl, {
                signal: AbortSignal.timeout(8000),
                headers: { 'Accept': 'text/html' },
            });
            if (!resp.ok) continue;
            const text = await resp.text();
            if (text && text.length > 100) {
                console.log(`✓ Fetched ${text.length} chars of content for ${url}`);
                return text;
            }
        } catch {
            continue;
        }
    }

    // Try HTTP fallback
    try {
        const httpUrl = `http://${url.replace(/^https?:\/\//, '')}`;
        const proxyUrl = CORS_PROXIES[0](httpUrl);
        const resp = await fetch(proxyUrl, { signal: AbortSignal.timeout(6000) });
        if (resp.ok) {
            const text = await resp.text();
            if (text && text.length > 100) return text;
        }
    } catch { /* ignore */ }

    console.warn(`⚠ Could not fetch content for ${url}`);
    return null;
}

/**
 * Extract meaningful text and metadata from raw HTML.
 */
function parseHTML(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Title
    const title = doc.querySelector('title')?.textContent?.trim() || '';

    // Meta description
    const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() || '';

    // Meta keywords
    const metaKeywords = doc.querySelector('meta[name="keywords"]')?.getAttribute('content')?.trim() || '';

    // OG tags
    const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content')?.trim() || '';
    const ogDesc = doc.querySelector('meta[property="og:description"]')?.getAttribute('content')?.trim() || '';

    // Visible body text (strip scripts, styles, noscript)
    const bodyClone = doc.body?.cloneNode(true);
    if (bodyClone) {
        bodyClone.querySelectorAll('script, style, noscript, svg, iframe').forEach(el => el.remove());
    }
    const bodyText = bodyClone?.textContent?.replace(/\s+/g, ' ')?.trim() || '';

    // Extract script sources
    const scripts = Array.from(doc.querySelectorAll('script[src]')).map(s => s.getAttribute('src')).filter(Boolean);

    // Extract links
    const links = Array.from(doc.querySelectorAll('a[href]')).map(a => a.getAttribute('href')).filter(Boolean);

    // Extract iframes
    const iframes = Array.from(doc.querySelectorAll('iframe')).map(f => f.getAttribute('src') || 'hidden iframe');

    // Extract forms
    const forms = Array.from(doc.querySelectorAll('form')).map(f => ({
        action: f.getAttribute('action') || '',
        method: f.getAttribute('method') || 'get',
        hasPassword: f.querySelector('input[type="password"]') !== null,
        hasEmail: f.querySelector('input[type="email"]') !== null,
    }));

    // Detect tracking pixels / analytics
    const trackingPixels = [];
    const gaMatch = html.match(/UA-\d{4,10}-\d{1,4}/g) || html.match(/G-[A-Z0-9]{10,12}/g);
    if (gaMatch) trackingPixels.push(...gaMatch);
    const fbMatch = html.match(/fbq\(['"]init['"],\s*['"](\d+)['"]/g);
    if (fbMatch) trackingPixels.push(...fbMatch);

    // Detect crypto wallet addresses
    const cryptoWallets = [];
    const btcMatch = html.match(/\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b/g);
    if (btcMatch) cryptoWallets.push(...btcMatch.slice(0, 3));
    const ethMatch = html.match(/\b0x[a-fA-F0-9]{40}\b/g);
    if (ethMatch) cryptoWallets.push(...ethMatch.slice(0, 3));

    return {
        title,
        metaDesc,
        metaKeywords,
        ogTitle,
        ogDesc,
        bodyText: bodyText.slice(0, 5000), // cap at 5000 chars
        bodyLength: bodyText.length,
        scripts,
        links,
        iframes,
        forms,
        trackingPixels,
        cryptoWallets,
    };
}

/**
 * Scan text content for keyword matches across all threat categories.
 */
function scanKeywords(text) {
    const lower = text.toLowerCase();
    const results = {
        gambling: [],
        phishing: [],
        scam: [],
        pyramid: [],
    };

    for (const kw of gamblingKeywords) {
        if (lower.includes(kw)) results.gambling.push(kw);
    }
    for (const kw of phishingKeywords) {
        if (lower.includes(kw)) results.phishing.push(kw);
    }
    for (const kw of scamKeywords) {
        if (lower.includes(kw)) results.scam.push(kw);
    }
    for (const kw of pyramidKeywords) {
        if (lower.includes(kw)) results.pyramid.push(kw);
    }

    return results;
}

/**
 * Analyze website content and return a structured risk assessment.
 * @param {string} domain - The domain to analyze
 * @returns {Promise<object|null>} Content analysis results
 */
export async function analyzeContent(domain) {
    const html = await fetchContent(domain);
    if (!html) return null;

    const parsed = parseHTML(html);
    const allText = [parsed.title, parsed.metaDesc, parsed.metaKeywords, parsed.ogTitle, parsed.ogDesc, parsed.bodyText].join(' ');
    const keywordHits = scanKeywords(allText);

    // Calculate content risk score
    let contentScore = 0;
    let category = 'Unknown';
    const findings = [];

    // Keyword-based scoring
    if (keywordHits.gambling.length >= 3) {
        const pts = Math.min(keywordHits.gambling.length * 5, 35);
        contentScore += pts;
        category = 'Casino';
        findings.push({
            type: 'gambling_content',
            score: pts,
            detail: `Page contains ${keywordHits.gambling.length} gambling terms: ${keywordHits.gambling.slice(0, 8).join(', ')}`,
        });
    }

    if (keywordHits.phishing.length >= 2) {
        const pts = Math.min(keywordHits.phishing.length * 6, 35);
        contentScore += pts;
        if (category === 'Unknown') category = 'Phishing';
        findings.push({
            type: 'phishing_content',
            score: pts,
            detail: `Page contains ${keywordHits.phishing.length} phishing indicators: ${keywordHits.phishing.slice(0, 8).join(', ')}`,
        });
    }

    if (keywordHits.scam.length >= 2) {
        const pts = Math.min(keywordHits.scam.length * 5, 30);
        contentScore += pts;
        if (category === 'Unknown') category = 'Scam';
        findings.push({
            type: 'scam_content',
            score: pts,
            detail: `Page contains ${keywordHits.scam.length} scam terms: ${keywordHits.scam.slice(0, 8).join(', ')}`,
        });
    }

    if (keywordHits.pyramid.length >= 2) {
        const pts = Math.min(keywordHits.pyramid.length * 5, 25);
        contentScore += pts;
        if (category === 'Unknown') category = 'Pyramid';
        findings.push({
            type: 'pyramid_content',
            score: pts,
            detail: `Page contains ${keywordHits.pyramid.length} MLM/pyramid terms: ${keywordHits.pyramid.slice(0, 8).join(', ')}`,
        });
    }

    // Password login form on non-legitimate site
    if (parsed.forms.some(f => f.hasPassword)) {
        contentScore += 15;
        findings.push({
            type: 'login_form',
            score: 15,
            detail: 'Page contains a password input form — potential credential harvesting',
        });
    }

    // Hidden iframes
    if (parsed.iframes.length > 0) {
        const pts = Math.min(parsed.iframes.length * 5, 15);
        contentScore += pts;
        findings.push({
            type: 'hidden_iframes',
            score: pts,
            detail: `Page embeds ${parsed.iframes.length} iframe(s) — may load malicious content`,
        });
    }

    // Crypto wallets in page
    if (parsed.cryptoWallets.length > 0) {
        contentScore += 15;
        findings.push({
            type: 'crypto_wallets',
            score: 15,
            detail: `Found ${parsed.cryptoWallets.length} crypto wallet address(es) in page content`,
        });
    }

    // Very short body (cloaking / redirect page)
    if (parsed.bodyLength < 200 && parsed.scripts.length > 3) {
        contentScore += 10;
        findings.push({
            type: 'cloaking',
            score: 10,
            detail: `Minimal visible content (${parsed.bodyLength} chars) with ${parsed.scripts.length} scripts — possible cloaking/redirect`,
        });
    }

    // Cap at 60 (content is supplementary to domain-based scoring)
    contentScore = Math.min(contentScore, 60);

    const result = {
        fetched: true,
        title: parsed.title,
        metaDesc: parsed.metaDesc,
        bodyPreview: parsed.bodyText.slice(0, 200),
        bodyLength: parsed.bodyLength,
        keywordHits,
        totalKeywords: keywordHits.gambling.length + keywordHits.phishing.length + keywordHits.scam.length + keywordHits.pyramid.length,
        iframeCount: parsed.iframes.length,
        formCount: parsed.forms.length,
        hasLoginForm: parsed.forms.some(f => f.hasPassword),
        cryptoWallets: parsed.cryptoWallets,
        trackingPixels: parsed.trackingPixels,
        scriptCount: parsed.scripts.length,
        linkCount: parsed.links.length,
        contentScore,
        contentCategory: category,
        findings,
    };

    console.log(`✓ Content analysis for ${domain}: score=${contentScore}, category=${category}, keywords=${result.totalKeywords}`);
    return result;
}
