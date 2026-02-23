// ===== KNOWN THREATS DATABASE (Browser-compatible) =====

export const suspiciousTLDs = new Set([
    'bet', 'casino', 'poker', 'xyz', 'top', 'club', 'icu', 'buzz',
    'monster', 'click', 'link', 'tk', 'ml', 'ga', 'cf', 'gq',
    'work', 'cam', 'loan', 'racing', 'win', 'download', 'stream',
    'bid', 'trade', 'date', 'faith', 'review', 'party', 'science',
]);

export const gamblingKeywords = [
    'slot', 'casino', 'poker', 'jackpot', 'spin', 'roulette', 'bet',
    'gambl', 'lucky', 'bonus', 'freespin', 'megawin', 'bigwin',
    'aviator', '1xbet', 'mostbet', 'pinup', 'parimatch', 'melbet',
];

export const phishingKeywords = [
    'login', 'signin', 'verify', 'secure', 'account', 'update',
    'confirm', 'suspend', 'unlock', 'recover', 'alert', 'urgent',
    'bank', 'paypal', 'amazon', 'apple', 'microsoft', 'google',
    'facebook', 'instagram', 'netflix', 'whatsapp', 'telegram',
];

export const scamKeywords = [
    'free', 'prize', 'winner', 'gift', 'reward', 'claim', 'offer',
    'limited', 'hurry', 'act-now', 'congratulations', 'selected',
    'crypto', 'bitcoin', 'invest', 'profit', 'earn', 'income',
    'double', 'fast-money', 'rich', 'wealth', 'trading', 'forex',
];

export const pyramidKeywords = [
    'mlm', 'referral', 'affiliate', 'network', 'passive-income',
    'downline', 'upline', 'recruit', 'team-build', 'matrix',
    'binary', 'unilevel', 'cashback', 'revshare',
];

export const knownBadASNs = new Set([
    'AS48031', 'AS49505', 'AS62088', 'AS208091', 'AS60781',
    'AS394711', 'AS14061', 'AS62240', 'AS51167', 'AS35916',
]);

export const knownBadHostingProviders = [
    'bulletproof', 'hostkey', 'shinjiru', 'servidor',
    'offshorededi', 'ecatel', 'quasi', 'novogara',
];

export const legitimateDomains = new Set([
    'google.com', 'youtube.com', 'facebook.com', 'twitter.com',
    'instagram.com', 'linkedin.com', 'github.com', 'microsoft.com',
    'apple.com', 'amazon.com', 'netflix.com', 'reddit.com',
    'wikipedia.org', 'whatsapp.com', 'telegram.org', 'yahoo.com',
    'bing.com', 'zoom.us', 'twitch.tv', 'spotify.com',
    'stackoverflow.com', 'medium.com', 'cloudflare.com', 'mozilla.org',
    'wordpress.com', 'shopify.com', 'paypal.com', 'stripe.com',
    'slack.com', 'notion.so', 'figma.com', 'vercel.com',
]);

export const brandNames = [
    'google', 'apple', 'amazon', 'microsoft', 'facebook',
    'instagram', 'netflix', 'paypal', 'twitter', 'whatsapp',
    'telegram', 'youtube', 'linkedin', 'spotify', 'tiktok',
];
