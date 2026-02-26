// ===== KNOWN THREATS DATABASE (Browser-compatible) =====

export const suspiciousTLDs = new Set([
    // Gambling
    'bet', 'casino', 'poker', 'games', 'game',
    // Generic risky
    'xyz', 'top', 'club', 'icu', 'buzz', 'fun', 'online', 'site', 'live',
    'monster', 'click', 'link', 'pro', 'vip', 'biz', 'lol', 'sbs',
    // Free / throwaway
    'tk', 'ml', 'ga', 'cf', 'gq',
    // Suspicious activity
    'work', 'cam', 'loan', 'racing', 'win', 'download', 'stream',
    'bid', 'trade', 'date', 'faith', 'review', 'party', 'science',
    // Regional often abused
    'ru', 'su', 'cn', 'pw', 'cc', 'ws', 'to', 'gg',
    // Other
    'uno', 'rest', 'cfd', 'cyou', 'icu', 'autos', 'mom',
]);

export const gamblingKeywords = [
    // Core gambling terms
    'slot', 'slots', 'casino', 'poker', 'jackpot', 'spin', 'spins', 'roulette',
    'bet', 'bets', 'betting', 'gambl', 'gambling', 'lucky', 'bonus',
    'freespin', 'megawin', 'bigwin', 'wager', 'blackjack', 'baccarat',
    'craps', 'keno', 'lotto', 'lottery', 'bingo',
    // Common gambling brand keywords
    'aviator', '1xbet', 'mostbet', 'pinup', 'pin-up', 'parimatch', 'melbet',
    'vulkan', 'vulcan', 'joycasino', 'playfortuna', 'azino', 'fonbet',
    'betway', 'betfair', 'bet365', 'pokerstars', 'betsson', 'unibet',
    'linebet', 'betwinner', 'megapari', '22bet', 'dafabet', 'stake',
    // Common words in gambling domains
    'game', 'games', 'gaming', 'play', 'player', 'win', 'winner',
    'fortune', 'gold', 'golden', 'royal', 'king', 'queen', 'sultan',
    'dragon', 'tiger', 'lion', 'diamond', 'jewel', 'treasure',
    'vegas', 'monte', 'carlo', 'macau',
    'cash', 'money', 'coin', 'coins',
    'roll', 'dice', 'wheel', 'card', 'cards', 'deck',
    // Mobile gambling patterns
    'mob', 'mobile', 'app',
    // Mirrors / copies
    'mirror', 'zerkalo', 'zerkal', 'rabochee', 'vhod', 'vkhod',
    'official', 'oficialnyy', 'registration', 'registraciya',
    // Sports betting
    'sportsbet', 'sportbet', 'livescore', 'livebet', 'odds', 'tipster',
    'handicap', 'accumulator', 'parlay', 'bookmaker', 'bookie',
    // Esports / virtual
    'csgo', 'dota', 'esport', 'cybersport', 'virtual',
    // Scratchers / arcade
    'scratch', 'scratchcard', 'arcade', 'fruit', 'cherry', 'sevens',
    // Russian gambling terms
    'stavka', 'stavki', 'kazino', 'igra', 'igrat', 'igry', 'dengi',
    'vyigrysh', 'besplatno', 'avtomat', 'avtomaty',
    // More common domain patterns
    'joker', 'ace', 'wild', 'blazing', 'fire', 'hot', 'mega', 'super',
    'power', 'nitro', 'turbo', 'max', 'bull', 'rush', 'flash',
    'candy', 'sweet', 'pirate', 'pharaoh', 'cleopatra', 'zeus',
];

export const phishingKeywords = [
    'login', 'log-in', 'signin', 'sign-in', 'verify', 'verification',
    'secure', 'security', 'account', 'update', 'auth', 'authenticate',
    'confirm', 'confirmation', 'suspend', 'suspended', 'unlock',
    'recover', 'recovery', 'alert', 'urgent', 'warning',
    'password', 'passwd', 'credential', 'validate', 'expire', 'expired',
    'reactivate', 'deactivate', 'restrict', 'restricted', 'unusual',
    'unauthorized', 'compromise', 'compromised',
    // Brand targets
    'bank', 'banking', 'paypal', 'amazon', 'apple', 'microsoft', 'google',
    'facebook', 'instagram', 'netflix', 'whatsapp', 'telegram',
    'ebay', 'alibaba', 'aliexpress', 'dhl', 'fedex', 'usps', 'ups',
    'chase', 'wells-fargo', 'citibank', 'hsbc', 'barclays',
    'coinbase', 'binance', 'metamask', 'blockchain',
    'dropbox', 'icloud', 'onedrive',
];

export const scamKeywords = [
    'free', 'prize', 'winner', 'gift', 'reward', 'claim', 'offer',
    'limited', 'hurry', 'act-now', 'congratulations', 'selected',
    'crypto', 'bitcoin', 'btc', 'ethereum', 'eth', 'usdt', 'tether',
    'invest', 'investment', 'profit', 'earn', 'earning', 'income',
    'double', 'fast-money', 'rich', 'wealth', 'trading', 'forex',
    'guaranteed', 'risk-free', 'passive', 'autopilot',
    'withdraw', 'withdrawal', 'deposit', 'payout',
    'telegram-bot', 'signal', 'pump', 'moon', 'airdrop',
    'nft', 'token', 'defi', 'yield', 'staking', 'mining',
    'giveaway', 'survey', 'sweepstake',
];

export const pyramidKeywords = [
    'mlm', 'referral', 'affiliate', 'network', 'passive-income',
    'downline', 'upline', 'recruit', 'recruiting', 'team-build',
    'matrix', 'binary', 'unilevel', 'cashback', 'revshare',
    'level', 'tier', 'commission', 'partner', 'partners',
    'program', 'membership', 'subscription',
    'multi-level', 'network-marketing',
];

// Known malicious domains and patterns (exact or partial matches)
export const knownMaliciousDomains = new Set([
    // Gambling
    '1xbet', 'mostbet', 'melbet', 'pinup', 'pin-up', 'parimatch', 'linebet',
    'vulkanvegas', 'vulkanbet', 'vulkancasino', 'azino777', 'azino',
    'joycasino', 'playfortuna', 'fonbet', 'betway', 'pokerstars',
    '22bet', 'megapari', 'betwinner', 'dafabet', 'stake',
    'sultangames', 'sultanbet', 'sultanplay', 'sultancasino',
    // Streaming / piracy
    'rezka', 'hdrezka', 'kinogo', 'kinokrad', 'lordfilm', 'filmix',
    'seasonvar', 'baskino', 'gidonline', 'kinobar', 'enfilm',
    'kinozal', 'rutracker', 'nnmclub', 'rutor', 'torrentino',
    // Phishing / scam
    'fakebook', 'vkontakte-login', 'paypal-secure', 'apple-id',
    'amazon-alert', 'google-verify', 'microsoft-update',
    // Pyramid / scam platforms
    'binomo', 'iqoption', 'quotex', 'pocketoption', 'olymptrade',
    'expert-option', 'deriv',
]);

export const knownBadASNs = new Set([
    'AS48031', 'AS49505', 'AS62088', 'AS208091', 'AS60781',
    'AS394711', 'AS14061', 'AS62240', 'AS51167', 'AS35916',
    'AS16276', 'AS24940', 'AS44477', 'AS202448', 'AS9009',
]);

export const knownBadHostingProviders = [
    'bulletproof', 'hostkey', 'shinjiru', 'servidor',
    'offshorededi', 'ecatel', 'quasi', 'novogara',
    'deltahost', 'king-servers', 'blazingfast', 'ipvolume',
];

export const legitimateDomains = new Set([
    'google.com', 'youtube.com', 'facebook.com', 'twitter.com', 'x.com',
    'instagram.com', 'linkedin.com', 'github.com', 'microsoft.com',
    'apple.com', 'amazon.com', 'netflix.com', 'reddit.com',
    'wikipedia.org', 'whatsapp.com', 'telegram.org', 'yahoo.com',
    'bing.com', 'zoom.us', 'twitch.tv', 'spotify.com',
    'stackoverflow.com', 'medium.com', 'cloudflare.com', 'mozilla.org',
    'wordpress.com', 'shopify.com', 'paypal.com', 'stripe.com',
    'slack.com', 'notion.so', 'figma.com', 'vercel.com',
    'ebay.com', 'alibaba.com', 'tiktok.com', 'discord.com',
    'steam.com', 'steampowered.com', 'epicgames.com',
    'adobe.com', 'dropbox.com', 'pinterest.com',
    'cnn.com', 'bbc.com', 'nytimes.com',
    'samsung.com', 'sony.com', 'huawei.com',
]);

export const brandNames = [
    'google', 'apple', 'amazon', 'microsoft', 'facebook', 'meta',
    'instagram', 'netflix', 'paypal', 'twitter', 'whatsapp',
    'telegram', 'youtube', 'linkedin', 'spotify', 'tiktok',
    'steam', 'discord', 'twitch', 'snapchat', 'pinterest',
    'uber', 'airbnb', 'coinbase', 'binance', 'opensea',
    'chase', 'wellsfargo', 'citibank', 'hsbc', 'barclays',
    'samsung', 'huawei', 'sony',
];
