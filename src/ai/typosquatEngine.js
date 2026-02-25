// ===== TYPOSQUATTING ENGINE =====
// Generates domain variants and checks DNS existence via Cloudflare DoH.

// ---- Homoglyph map ----
const HOMOGLYPHS = {
    'a': ['4', '@', 'à', 'á', 'â', 'ã', 'ä', 'å', 'ā', 'ă'],
    'b': ['d', '6', 'ḃ'],
    'c': ['k', 'ç', 'ć', 'č'],
    'd': ['b', 'cl', 'ď'],
    'e': ['3', 'è', 'é', 'ê', 'ë', 'ē', 'ĕ', 'ė'],
    'f': ['ph'],
    'g': ['9', 'q', 'ğ', 'ġ'],
    'h': ['n', 'ħ'],
    'i': ['1', 'l', '!', '|', 'í', 'ì', 'î', 'ï', 'ı'],
    'j': ['ĵ'],
    'k': ['c', 'ķ'],
    'l': ['1', 'i', '|', 'ł'],
    'm': ['rn', 'nn', 'ṁ'],
    'n': ['m', 'ñ', 'ń', 'ņ'],
    'o': ['0', 'ø', 'ö', 'ò', 'ó', 'ô', 'õ', 'ō'],
    'p': ['q', 'ṗ'],
    'q': ['p', 'g'],
    'r': ['ŗ', 'ř'],
    's': ['5', '$', 'ś', 'š', 'ş', 'ṡ'],
    't': ['7', '+', 'ţ', 'ť', 'ṫ'],
    'u': ['v', 'ù', 'ú', 'û', 'ü', 'ū', 'ŭ'],
    'v': ['u', 'ṿ'],
    'w': ['vv', 'ŵ', 'ẁ', 'ẃ'],
    'x': ['×', 'ẋ'],
    'y': ['ý', 'ÿ', 'ŷ'],
    'z': ['2', 'ź', 'ž', 'ż'],
};

// ---- QWERTY adjacency map ----
const QWERTY_ADJACENT = {
    'a': ['q', 'w', 's', 'z'],
    'b': ['v', 'g', 'h', 'n'],
    'c': ['x', 'd', 'f', 'v'],
    'd': ['s', 'e', 'r', 'f', 'c', 'x'],
    'e': ['w', 's', 'd', 'r'],
    'f': ['d', 'r', 't', 'g', 'v', 'c'],
    'g': ['f', 't', 'y', 'h', 'b', 'v'],
    'h': ['g', 'y', 'u', 'j', 'n', 'b'],
    'i': ['u', 'j', 'k', 'o'],
    'j': ['h', 'u', 'i', 'k', 'm', 'n'],
    'k': ['j', 'i', 'o', 'l', 'm'],
    'l': ['k', 'o', 'p'],
    'm': ['n', 'j', 'k'],
    'n': ['b', 'h', 'j', 'm'],
    'o': ['i', 'k', 'l', 'p'],
    'p': ['o', 'l'],
    'q': ['w', 'a'],
    'r': ['e', 'd', 'f', 't'],
    's': ['a', 'w', 'e', 'd', 'x', 'z'],
    't': ['r', 'f', 'g', 'y'],
    'u': ['y', 'h', 'j', 'i'],
    'v': ['c', 'f', 'g', 'b'],
    'w': ['q', 'a', 's', 'e'],
    'x': ['z', 's', 'd', 'c'],
    'y': ['t', 'g', 'h', 'u'],
    'z': ['a', 's', 'x'],
};

// ---- TLDs ----
const TLDS = [
    'com', 'net', 'org', 'info', 'xyz', 'top', 'ru', 'cn', 'tk',
    'ml', 'ga', 'cf', 'gq', 'io', 'co', 'me', 'biz', 'pro',
    'site', 'online', 'live', 'club', 'app', 'dev', 'store',
    'shop', 'tech', 'space', 'fun', 'website', 'link', 'click',
    'win', 'bid', 'trade', 'loan', 'download', 'stream', 'racing',
    'review', 'party', 'date', 'faith', 'science', 'work', 'rocks',
    'pw', 'cc', 'ws', 'mobi', 'asia', 'in', 'uk', 'de', 'fr',
    'es', 'it', 'br', 'kz', 'ua', 'by',
];

// ---- Prefixes and suffixes ----
const PREFIXES = [
    'secure-', 'login-', 'my-', 'www-', 'official-', 'real-',
    'account-', 'verify-', 'auth-', 'signin-', 'update-',
];

const SUFFIXES = [
    '-login', '-secure', '-verify', '-official', '-online',
    '-app', '-portal', '-web', '-site', '-info', '-help',
];


// ===== VARIANT GENERATION =====

function splitDomain(domain) {
    const parts = domain.split('.');
    if (parts.length < 2) return { name: domain, tld: 'com' };
    const tld = parts.slice(-1)[0];
    const name = parts.slice(0, -1).join('.');
    return { name, tld };
}

// Strategy 1: Homoglyph substitution — replace one char at a time
function* genHomoglyphs(name) {
    for (let i = 0; i < name.length; i++) {
        const ch = name[i];
        const subs = HOMOGLYPHS[ch];
        if (!subs) continue;
        for (const sub of subs) {
            yield name.slice(0, i) + sub + name.slice(i + 1);
        }
    }
}

// Strategy 2: Character omission
function* genOmissions(name) {
    for (let i = 0; i < name.length; i++) {
        if (name[i] === '.' || name[i] === '-') continue;
        yield name.slice(0, i) + name.slice(i + 1);
    }
}

// Strategy 3: Adjacent key swaps (QWERTY typos)
function* genKeyboardTypos(name) {
    for (let i = 0; i < name.length; i++) {
        const ch = name[i];
        const adj = QWERTY_ADJACENT[ch];
        if (!adj) continue;
        for (const swap of adj) {
            yield name.slice(0, i) + swap + name.slice(i + 1);
        }
    }
}

// Strategy 4: Character transposition
function* genTranspositions(name) {
    for (let i = 0; i < name.length - 1; i++) {
        if (name[i] === name[i + 1]) continue;
        yield name.slice(0, i) + name[i + 1] + name[i] + name.slice(i + 2);
    }
}

// Strategy 5: Character duplication
function* genDuplications(name) {
    for (let i = 0; i < name.length; i++) {
        if (name[i] === '.' || name[i] === '-') continue;
        yield name.slice(0, i) + name[i] + name[i] + name.slice(i + 1);
    }
}

// Strategy 6: Hyphen insertion
function* genHyphenInsertions(name) {
    for (let i = 1; i < name.length; i++) {
        if (name[i] === '.' || name[i - 1] === '.' || name[i] === '-' || name[i - 1] === '-') continue;
        yield name.slice(0, i) + '-' + name.slice(i);
    }
}

// Strategy 7: TLD swap
function* genTLDVariants(name, originalTld) {
    for (const tld of TLDS) {
        if (tld === originalTld) continue;
        yield { fullDomain: `${name}.${tld}`, strategy: 'TLD swap' };
    }
}

// Strategy 8: Prefix/suffix
function* genPrefixSuffix(name) {
    for (const prefix of PREFIXES) {
        yield prefix + name;
    }
    for (const suffix of SUFFIXES) {
        yield name + suffix;
    }
}

// Strategy 9: Double homoglyphs (combine two substitutions)
function* genDoubleHomoglyphs(name) {
    const chars = name.split('');
    const positions = [];
    for (let i = 0; i < chars.length; i++) {
        if (HOMOGLYPHS[chars[i]]) positions.push(i);
    }
    // Pick pairs of positions
    for (let a = 0; a < positions.length; a++) {
        for (let b = a + 1; b < positions.length; b++) {
            const ia = positions[a], ib = positions[b];
            const subsA = HOMOGLYPHS[chars[ia]];
            const subsB = HOMOGLYPHS[chars[ib]];
            if (!subsA.length || !subsB.length) continue;
            // Only use first substitution for each to limit explosion
            const newChars = [...chars];
            newChars[ia] = subsA[0];
            newChars[ib] = subsB[0];
            yield newChars.join('');
        }
    }
}

// Strategy 10: Vowel swap
function* genVowelSwaps(name) {
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    for (let i = 0; i < name.length; i++) {
        if (vowels.includes(name[i])) {
            for (const v of vowels) {
                if (v === name[i]) continue;
                yield name.slice(0, i) + v + name.slice(i + 1);
            }
        }
    }
}


// ===== MAIN GENERATOR =====

export function generateVariants(domain, maxCount = 10000) {
    const { name, tld } = splitDomain(domain);
    const seen = new Set();
    seen.add(domain); // Exclude original

    const variants = [];

    function add(variant, strategy) {
        // variant is just the name part — combine with TLD
        const full = `${variant}.${tld}`;
        if (full.length < 3 || full.length > 63) return;
        if (seen.has(full)) return;
        // Only allow valid-ish domain chars (ASCII for DNS)
        if (!/^[a-z0-9][a-z0-9.-]*[a-z0-9]$/i.test(full)) return;
        seen.add(full);
        variants.push({ domain: full, strategy });
    }

    function addFull(fullDomain, strategy) {
        if (fullDomain.length < 3 || fullDomain.length > 63) return;
        if (seen.has(fullDomain)) return;
        if (!/^[a-z0-9][a-z0-9.-]*[a-z0-9]$/i.test(fullDomain)) return;
        seen.add(fullDomain);
        variants.push({ domain: fullDomain, strategy });
    }

    // Run all strategies
    const strategies = [
        { gen: genHomoglyphs(name), label: 'Homoglyph' },
        { gen: genOmissions(name), label: 'Omission' },
        { gen: genKeyboardTypos(name), label: 'Keyboard typo' },
        { gen: genTranspositions(name), label: 'Transposition' },
        { gen: genDuplications(name), label: 'Duplication' },
        { gen: genHyphenInsertions(name), label: 'Hyphen insertion' },
        { gen: genPrefixSuffix(name), label: 'Prefix/Suffix' },
        { gen: genDoubleHomoglyphs(name), label: 'Double homoglyph' },
        { gen: genVowelSwaps(name), label: 'Vowel swap' },
    ];

    for (const { gen, label } of strategies) {
        for (const v of gen) {
            add(v, label);
            if (variants.length >= maxCount) return variants;
        }
    }

    // TLD variants (these return full domains)
    for (const { fullDomain, strategy } of genTLDVariants(name, tld)) {
        addFull(fullDomain, strategy);
        if (variants.length >= maxCount) return variants;
    }

    // Cross-strategy: homoglyphs × TLD
    if (variants.length < maxCount) {
        for (const v of genHomoglyphs(name)) {
            for (const crossTld of TLDS.slice(0, 20)) {
                if (crossTld === tld) continue;
                addFull(`${v}.${crossTld}`, 'Homoglyph + TLD');
                if (variants.length >= maxCount) return variants;
            }
        }
    }

    // Cross-strategy: keyboard typos × TLD
    if (variants.length < maxCount) {
        for (const v of genKeyboardTypos(name)) {
            for (const crossTld of TLDS.slice(0, 15)) {
                if (crossTld === tld) continue;
                addFull(`${v}.${crossTld}`, 'Typo + TLD');
                if (variants.length >= maxCount) return variants;
            }
        }
    }

    // Cross-strategy: omissions × TLD
    if (variants.length < maxCount) {
        for (const v of genOmissions(name)) {
            for (const crossTld of TLDS.slice(0, 15)) {
                if (crossTld === tld) continue;
                addFull(`${v}.${crossTld}`, 'Omission + TLD');
                if (variants.length >= maxCount) return variants;
            }
        }
    }

    // Cross-strategy: duplications × TLD
    if (variants.length < maxCount) {
        for (const v of genDuplications(name)) {
            for (const crossTld of TLDS.slice(0, 15)) {
                if (crossTld === tld) continue;
                addFull(`${v}.${crossTld}`, 'Duplication + TLD');
                if (variants.length >= maxCount) return variants;
            }
        }
    }

    // Cross-strategy: transpositions × TLD
    if (variants.length < maxCount) {
        for (const v of genTranspositions(name)) {
            for (const crossTld of TLDS.slice(0, 15)) {
                if (crossTld === tld) continue;
                addFull(`${v}.${crossTld}`, 'Transposition + TLD');
                if (variants.length >= maxCount) return variants;
            }
        }
    }

    // Cross-strategy: vowel swaps × TLD
    if (variants.length < maxCount) {
        for (const v of genVowelSwaps(name)) {
            for (const crossTld of TLDS.slice(0, 15)) {
                if (crossTld === tld) continue;
                addFull(`${v}.${crossTld}`, 'Vowel + TLD');
                if (variants.length >= maxCount) return variants;
            }
        }
    }

    return variants;
}


// ===== DNS CHECKER =====

async function checkDNS(domain) {
    try {
        const resp = await fetch(
            `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=A`,
            { headers: { 'Accept': 'application/dns-json' } }
        );
        if (!resp.ok) return null; // skip on error
        const data = await resp.json();

        if (data.Status === 3) return null; // NXDOMAIN — doesn't exist
        if (data.Status === 0 && data.Answer && data.Answer.length > 0) {
            const aRecord = data.Answer.find(a => a.type === 1);
            return { ip: aRecord ? aRecord.data : 'unknown' };
        }
        if (data.Status === 0) return { ip: 'no-A-record' };
        return null;
    } catch {
        return null; // network error — skip
    }
}


// ===== BATCH SCANNER =====

/**
 * Scans domain variants in batches, calling onProgress and onFound callbacks.
 * @param {string} domain - The original domain to scan variants for.
 * @param {object} callbacks - { onProgress(checked, total), onFound(result), onComplete(results) }
 * @param {AbortSignal} signal - Optional abort signal to cancel the scan.
 * @returns {Promise<Array>} - Array of found domains.
 */
export async function deepScan(domain, { onProgress, onFound, onComplete }, signal) {
    const variants = generateVariants(domain, 10000);
    const total = variants.length;
    const found = [];
    let checked = 0;
    const CONCURRENCY = 15;

    // Process in batches
    for (let i = 0; i < total; i += CONCURRENCY) {
        if (signal?.aborted) break;

        const batch = variants.slice(i, i + CONCURRENCY);
        const results = await Promise.allSettled(
            batch.map(async (v) => {
                if (signal?.aborted) return null;
                const dns = await checkDNS(v.domain);
                return dns ? { ...v, ...dns } : null;
            })
        );

        for (const r of results) {
            checked++;
            if (r.status === 'fulfilled' && r.value) {
                // Calculate a simple risk score based on strategy
                const riskWeights = {
                    'Homoglyph': 85,
                    'Omission': 70,
                    'Keyboard typo': 65,
                    'Transposition': 60,
                    'Duplication': 55,
                    'Hyphen insertion': 50,
                    'TLD swap': 75,
                    'Prefix/Suffix': 80,
                    'Double homoglyph': 90,
                    'Vowel swap': 60,
                    'Homoglyph + TLD': 92,
                    'Typo + TLD': 72,
                    'Omission + TLD': 68,
                    'Duplication + TLD': 58,
                    'Transposition + TLD': 62,
                    'Vowel + TLD': 58,
                };
                const baseRisk = riskWeights[r.value.strategy] || 50;
                // Add some variance
                const risk = Math.min(99, baseRisk + Math.floor(Math.random() * 10) - 3);
                const result = { ...r.value, risk };
                found.push(result);
                onFound?.(result);
            }
        }

        onProgress?.(Math.min(checked, total), total);

        // Small delay between batches to avoid hammering DNS
        if (i + CONCURRENCY < total && !signal?.aborted) {
            await new Promise(r => setTimeout(r, 50));
        }
    }

    onComplete?.(found);
    return found;
}
