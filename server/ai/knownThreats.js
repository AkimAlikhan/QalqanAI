// ===== KNOWN THREAT PATTERNS DATABASE =====
// This serves as the intelligence backbone for heuristic analysis.

export const suspiciousTLDs = new Set([
    'bet', 'casino', 'poker', 'slots', 'bingo', 'games',
    'xyz', 'top', 'click', 'club', 'buzz', 'surf', 'fun',
    'icu', 'cyou', 'cfd', 'sbs', 'rest', 'bond',
    'win', 'vip', 'pro', 'biz', 'info', 'site', 'online',
    'live', 'store', 'shop', 'work', 'monster', 'beauty',
]);

export const gamblingKeywords = [
    'casino', 'slot', 'slots', 'poker', 'blackjack', 'roulette',
    'jackpot', 'spin', 'bet', 'betting', 'gambl', 'wager',
    'lucky', 'fortune', 'bonus', 'freespin', 'megawin', 'bigwin',
    'playwin', 'goldslot', 'keno', 'baccarat', 'dice',
];

export const phishingKeywords = [
    'login', 'signin', 'sign-in', 'verify', 'verification',
    'account', 'secure', 'update', 'confirm', 'bank',
    'paypal', 'amazon', 'microsoft', 'apple', 'google',
    'netflix', 'facebook', 'instagram', 'whatsapp',
    'password', 'credential', 'suspend', 'locked', 'urgent',
    'alert', 'recover', 'restore', 'wallet',
];

export const scamKeywords = [
    'crypto', 'bitcoin', 'double', 'invest', 'profit',
    'earn', 'money', 'cash', 'income', 'passive',
    'rich', 'wealth', 'fast-money', 'guaranteed', 'return',
    'yield', 'multiplier', 'airdrop', 'giveaway', 'free-bitcoin',
    'mining', 'trader', 'trading', 'forex', 'binary',
];

export const pyramidKeywords = [
    'invest', 'fund', 'capital', 'profit', 'return',
    'diamond', 'gold', 'platinum', 'premium', 'elite',
    'partner', 'referral', 'affiliate', 'network', 'mlm',
    'passive-income', 'financial-freedom', 'opportunity',
    'master', 'academy', 'trading', 'forex',
];

export const knownBadASNs = new Set([
    'AS62005', 'AS202685', 'AS44477', 'AS209605', 'AS57724',
    'AS48693', 'AS213371', 'AS208091', 'AS44592', 'AS62282',
]);

export const knownBadHostingProviders = [
    'bulletproof', 'offshore', 'anonymous', 'privacy',
    'bluevps', 'hostkey', 'alexhost', 'itldc',
];

export const legitimateDomains = new Set([
    'google.com', 'youtube.com', 'facebook.com', 'twitter.com', 'x.com',
    'instagram.com', 'linkedin.com', 'reddit.com', 'wikipedia.org',
    'amazon.com', 'apple.com', 'microsoft.com', 'github.com',
    'stackoverflow.com', 'netflix.com', 'spotify.com', 'twitch.tv',
    'yahoo.com', 'bing.com', 'whatsapp.com', 'telegram.org',
    'zoom.us', 'slack.com', 'dropbox.com', 'adobe.com',
    'cloudflare.com', 'aws.amazon.com', 'azure.microsoft.com',
    'gov.kz', 'egov.kz', 'edu.kz', 'mail.ru', 'yandex.ru',
    'bbc.com', 'cnn.com', 'nytimes.com', 'reuters.com',
]);

// Brand names commonly impersonated
export const brandNames = [
    'google', 'facebook', 'apple', 'microsoft', 'amazon',
    'netflix', 'paypal', 'instagram', 'whatsapp', 'telegram',
    'twitter', 'linkedin', 'spotify', 'zoom', 'slack',
    'kaspi', 'halyk', 'forte', 'jusan',
];
