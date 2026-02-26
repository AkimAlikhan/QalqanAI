// ===== CLONE / VARIANT DOMAIN DETECTOR =====
// Generates candidate similar domains and checks if they actually exist via DNS.
// Strategies: TLD swap, typosquatting, character substitution, prefix/suffix.

// Common TLDs to try when swapping
const COMMON_TLDS = ['com', 'net', 'org', 'io', 'xyz', 'site', 'online', 'info', 'co', 'biz', 'me', 'pro', 'app', 'dev', 'ru', 'ua', 'kz', 'uk', 'de', 'fr', 'ag', 'tv', 'cc', 'gg', 'bet', 'casino', 'live', 'fun', 'club', 'top', 'shop', 'tech'];

// Keyboard proximity map for typosquatting
const KEYBOARD_NEIGHBORS = {
    a: 'sqwz', b: 'vngh', c: 'xvdf', d: 'sfce', e: 'rdws', f: 'dgcv',
    g: 'fhbv', h: 'gjbn', i: 'ujok', j: 'hknm', k: 'jloi', l: 'kop',
    m: 'njk', n: 'bmhj', o: 'iklp', p: 'ol', q: 'wa', r: 'etdf',
    s: 'adwxz', t: 'rfgy', u: 'yihj', v: 'cbfg', w: 'qeas', x: 'zsdc',
    y: 'tugh', z: 'xas',
};

// Character substitution map (lookalikes)
const CHAR_SUBSTITUTIONS = {
    a: ['4', '@'], e: ['3'], i: ['1', 'l'], o: ['0'], s: ['5', 'z'],
    l: ['1', 'i'], t: ['7'], b: ['d'], g: ['q'], n: ['m'],
    z: ['s'], k: ['c'], c: ['k'],
};

/**
 * Generate candidate similar domains for a given domain.
 * Returns a unique set of candidate domain strings.
 */
export function generateCandidates(domain) {
    const parts = domain.split('.');
    if (parts.length < 2) return [];

    const name = parts.slice(0, -1).join('.'); // e.g. "rezka" from "rezka.ag"
    const tld = parts[parts.length - 1];       // e.g. "ag"
    const candidates = new Set();

    // === Strategy 1: TLD Swapping ===
    // rezka.ag → rezka.com, rezka.net, rezka.org, ...
    for (const newTld of COMMON_TLDS) {
        if (newTld !== tld) {
            candidates.add(`${name}.${newTld}`);
        }
    }

    // === Strategy 2: Typosquatting (keyboard neighbors) ===
    // rezka → reska, rexka, rwzka, ...
    for (let i = 0; i < name.length; i++) {
        const ch = name[i];
        if (ch === '.' || ch === '-') continue;
        const neighbors = KEYBOARD_NEIGHBORS[ch] || '';
        for (const neighbor of neighbors) {
            const typo = name.slice(0, i) + neighbor + name.slice(i + 1);
            candidates.add(`${typo}.${tld}`);
            // Also try typo + common TLDs
            candidates.add(`${typo}.com`);
        }
    }

    // === Strategy 3: Character duplication ===
    // rezka → rezzka, rezkka, rezkaa
    for (let i = 0; i < name.length; i++) {
        const ch = name[i];
        if (ch === '.' || ch === '-') continue;
        const doubled = name.slice(0, i) + ch + name.slice(i);
        candidates.add(`${doubled}.${tld}`);
        candidates.add(`${doubled}.com`);
    }

    // === Strategy 4: Character omission ===
    // rezka → rzka, reka, reza, rezk
    if (name.length > 3) {
        for (let i = 0; i < name.length; i++) {
            if (name[i] === '.' || name[i] === '-') continue;
            const omitted = name.slice(0, i) + name.slice(i + 1);
            if (omitted.length >= 2) {
                candidates.add(`${omitted}.${tld}`);
                candidates.add(`${omitted}.com`);
            }
        }
    }

    // === Strategy 5: Character substitution (lookalikes) ===
    // rezka → r3zka, rezk4
    for (let i = 0; i < name.length; i++) {
        const ch = name[i];
        const subs = CHAR_SUBSTITUTIONS[ch];
        if (subs) {
            for (const sub of subs) {
                const swapped = name.slice(0, i) + sub + name.slice(i + 1);
                candidates.add(`${swapped}.${tld}`);
                candidates.add(`${swapped}.com`);
            }
        }
    }

    // === Strategy 6: Common prefixes/suffixes ===
    const prefixes = ['my-', 'the-', 'get-', 'go-', 'new-', 'real-', 'official-'];
    const suffixes = ['-online', '-pro', '-official', '-mirror', '-new', '-live'];
    for (const pre of prefixes) {
        candidates.add(`${pre}${name}.${tld}`);
        candidates.add(`${pre}${name}.com`);
    }
    for (const suf of suffixes) {
        candidates.add(`${name}${suf}.${tld}`);
        candidates.add(`${name}${suf}.com`);
    }

    // === Strategy 7: Hyphen insertion/removal ===
    // 1xbet → 1x-bet, 1-xbet
    if (name.includes('-')) {
        candidates.add(`${name.replace(/-/g, '')}.${tld}`);
        candidates.add(`${name.replace(/-/g, '')}.com`);
    } else if (name.length >= 4) {
        for (let i = 2; i < name.length - 1; i++) {
            const hyphenated = name.slice(0, i) + '-' + name.slice(i);
            candidates.add(`${hyphenated}.${tld}`);
            candidates.add(`${hyphenated}.com`);
        }
    }

    // Remove the original domain itself
    candidates.delete(domain);

    return Array.from(candidates);
}

/**
 * Check if a domain exists using Cloudflare DNS-over-HTTPS.
 * Returns { domain, exists, ip? }.
 */
async function dnsCheck(domain) {
    try {
        const resp = await fetch(
            `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=A`,
            { headers: { Accept: 'application/dns-json' }, signal: AbortSignal.timeout(3000) },
        );
        if (!resp.ok) return { domain, exists: false };
        const data = await resp.json();
        if (data.Status === 0 && data.Answer && data.Answer.length > 0) {
            return { domain, exists: true, ip: data.Answer[0].data };
        }
        return { domain, exists: false };
    } catch {
        return { domain, exists: false };
    }
}

/**
 * Find real clone/variant domains for a given domain.
 * Generates candidates, DNS-checks them in parallel batches, returns found ones.
 * 
 * @param {string} domain - The original domain to find clones of
 * @param {number} maxResults - Maximum number of found clones to return (default: 4)
 * @returns {Promise<Array<{domain: string, ip: string}>>}
 */
export async function findClones(domain, maxResults = 4) {
    const allCandidates = generateCandidates(domain);

    // Shuffle to get variety, then check in batches
    const shuffled = allCandidates.sort(() => Math.random() - 0.5);

    const found = [];
    const BATCH_SIZE = 15; // DNS queries in parallel per batch

    for (let i = 0; i < shuffled.length && found.length < maxResults; i += BATCH_SIZE) {
        const batch = shuffled.slice(i, i + BATCH_SIZE);
        const results = await Promise.all(batch.map(d => dnsCheck(d)));

        for (const r of results) {
            if (r.exists && found.length < maxResults) {
                found.push({ domain: r.domain, ip: r.ip });
            }
        }

        // If we already found enough, stop early
        if (found.length >= maxResults) break;
    }

    console.log(`🔍 Clone scan: ${allCandidates.length} candidates → ${found.length} live variants found for ${domain}`);
    return found;
}
