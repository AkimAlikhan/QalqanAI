// ===== MOCK DATA FOR QALQANAI =====

export const mockThreatFeed = [
  { id: 1, time: '2 min ago', domain: 'lucky-spin-777.bet', category: 'Casino', risk: 92, action: 'Auto-blocked' },
  { id: 2, time: '5 min ago', domain: 'invest-gold-pro.xyz', category: 'Pyramid', risk: 87, action: 'Cluster detected' },
  { id: 3, time: '8 min ago', domain: 'secure-bank-verify.com', category: 'Phishing', risk: 95, action: 'Auto-blocked' },
  { id: 4, time: '12 min ago', domain: 'crypto-double-fast.io', category: 'Scam', risk: 89, action: 'Under review' },
  { id: 5, time: '15 min ago', domain: 'mega-jackpot-win.net', category: 'Casino', risk: 91, action: 'Auto-blocked' },
  { id: 6, time: '18 min ago', domain: 'profit-x-trading.com', category: 'Pyramid', risk: 78, action: 'Cluster detected' },
  { id: 7, time: '22 min ago', domain: 'account-verify-now.org', category: 'Phishing', risk: 96, action: 'Auto-blocked' },
  { id: 8, time: '25 min ago', domain: 'fast-money-guru.biz', category: 'Scam', risk: 84, action: 'Under review' },
  { id: 9, time: '30 min ago', domain: 'slot-empire-vip.casino', category: 'Casino', risk: 88, action: 'Auto-blocked' },
  { id: 10, time: '33 min ago', domain: 'diamond-fund-invest.co', category: 'Pyramid', risk: 82, action: 'Cluster detected' },
];

export const mockStats = {
  scannedToday: 14827,
  clustersFound: 342,
  threatsBlocked: 8291,
  activeMonitors: 1563,
};

export const generateAnalysisResult = (url) => {
  const categories = ['Casino', 'Scam', 'Phishing', 'Pyramid'];
  const category = categories[Math.floor(Math.random() * categories.length)];
  const riskScore = Math.floor(Math.random() * 35) + 65;

  return {
    url: url || 'lucky-spin-777.bet',
    riskScore,
    category,
    scanDuration: '4.2s',
    lastScanned: new Date().toISOString(),
    reasons: [
      { label: 'Shared TLS certificate with 3 known scam domains', weight: 25, type: 'infrastructure' },
      { label: 'Reused Google Analytics ID (UA-38291746) across 12 domains', weight: 30, type: 'tracking' },
      { label: 'Cryptocurrency wallet address detected on payment page', weight: 15, type: 'financial' },
      { label: 'Aggressive conversion language patterns detected', weight: 10, type: 'content' },
      { label: 'Redirect chain matches known funnel template', weight: 12, type: 'funnel' },
      { label: 'Domain registered 6 days ago via privacy proxy', weight: 8, type: 'infrastructure' },
    ],
    markers: {
      infrastructure: [
        { key: 'IP Address', value: '185.234.72.18' },
        { key: 'Hosting / ASN', value: 'AS62005 — BlueVPS, NL' },
        { key: 'TLS Certificate', value: 'SHA256:a3f8...c91d (shared with 3 domains)' },
        { key: 'CDN', value: 'Cloudflare (Free Tier)' },
        { key: 'Domain Age', value: '6 days' },
        { key: 'Registrar', value: 'Namecheap (Privacy Proxy)' },
      ],
      tracking: [
        { key: 'Google Analytics', value: 'UA-38291746-1' },
        { key: 'Facebook Pixel', value: '948271635201847' },
        { key: 'TikTok Pixel', value: 'C5KFAJ2E7V8...' },
        { key: 'Affiliate Params', value: 'aff_id=8827, subid=kz_casino_1' },
      ],
      financial: [
        { key: 'Crypto Wallet (BTC)', value: 'bc1qxy2kgdyg...p0ct2e9' },
        { key: 'Payment Gateway', value: 'PayKassma (unlicensed)' },
        { key: 'Card Top-Up', value: 'Detected (Visa/MC)' },
      ],
      contacts: [
        { key: 'Telegram', value: '@lucky_support_bot' },
        { key: 'WhatsApp', value: '+7 (700) ***-**-88' },
        { key: 'Support Email', value: 'support@luckyspin.help' },
        { key: 'Live Chat Widget', value: 'Tawk.to (ID: 5f3a...)' },
      ],
    },
    redirectChain: [
      { step: 1, url: 'lucky-spin-777.bet', type: 'Landing Page', status: 200 },
      { step: 2, url: 'trk.spin-offers.click/r/8827', type: 'Tracker Redirect', status: 302 },
      { step: 3, url: 'promo.lucky-spin-777.bet/bonus', type: 'Pre-Landing', status: 200 },
      { step: 4, url: 'app.lucky-spin-777.bet/register', type: 'Conversion Page', status: 200 },
    ],
  };
};

export const mockGraphData = {
  nodes: [
    // Websites
    { id: 'w1', label: 'lucky-spin-777.bet', type: 'website', risk: 92 },
    { id: 'w2', label: 'mega-jackpot-win.net', type: 'website', risk: 91 },
    { id: 'w3', label: 'slot-empire-vip.casino', type: 'website', risk: 88 },
    { id: 'w4', label: 'golden-slots-kz.com', type: 'website', risk: 85 },
    { id: 'w5', label: 'spin-bonus-pro.bet', type: 'website', risk: 79 },
    // Domains / IPs
    { id: 'd1', label: '185.234.72.18', type: 'domain', risk: 80 },
    { id: 'd2', label: '91.215.85.102', type: 'domain', risk: 75 },
    // Trackers
    { id: 't1', label: 'UA-38291746', type: 'tracker', risk: 70 },
    { id: 't2', label: 'FB:948271635', type: 'tracker', risk: 65 },
    // Certificates
    { id: 'c1', label: 'TLS:a3f8...c91d', type: 'certificate', risk: 60 },
    { id: 'c2', label: 'TLS:b7e2...84fa', type: 'certificate', risk: 55 },
    // Wallets
    { id: 'p1', label: 'bc1qxy2k...', type: 'wallet', risk: 50 },
    // Contacts
    { id: 'ct1', label: '@lucky_support_bot', type: 'contact', risk: 40 },
  ],
  edges: [
    // Website → IP
    { source: 'w1', target: 'd1', label: 'hosted on' },
    { source: 'w2', target: 'd1', label: 'hosted on' },
    { source: 'w3', target: 'd2', label: 'hosted on' },
    { source: 'w4', target: 'd1', label: 'hosted on' },
    { source: 'w5', target: 'd2', label: 'hosted on' },
    // Website → Tracker
    { source: 'w1', target: 't1', label: 'uses tracker' },
    { source: 'w2', target: 't1', label: 'uses tracker' },
    { source: 'w4', target: 't1', label: 'uses tracker' },
    { source: 'w1', target: 't2', label: 'uses pixel' },
    { source: 'w3', target: 't2', label: 'uses pixel' },
    // Website → Certificate
    { source: 'w1', target: 'c1', label: 'shares cert' },
    { source: 'w2', target: 'c1', label: 'shares cert' },
    { source: 'w3', target: 'c2', label: 'shares cert' },
    { source: 'w5', target: 'c2', label: 'shares cert' },
    // Website → Wallet
    { source: 'w1', target: 'p1', label: 'uses wallet' },
    { source: 'w4', target: 'p1', label: 'uses wallet' },
    // Website → Contact
    { source: 'w1', target: 'ct1', label: 'same operator' },
    { source: 'w2', target: 'ct1', label: 'same operator' },
    { source: 'w5', target: 'ct1', label: 'same operator' },
  ],
};

export const mockBlocklist = [
  { id: 1, domain: 'lucky-spin-777.bet', category: 'Casino', risk: 92, tier: 'A', status: 'Blocked', detectedDate: '2026-02-23', cluster: 'CLS-0042', markers: 8 },
  { id: 2, domain: 'mega-jackpot-win.net', category: 'Casino', risk: 91, tier: 'A', status: 'Blocked', detectedDate: '2026-02-23', cluster: 'CLS-0042', markers: 7 },
  { id: 3, domain: 'invest-gold-pro.xyz', category: 'Pyramid', risk: 87, tier: 'A', status: 'Blocked', detectedDate: '2026-02-22', cluster: 'CLS-0038', markers: 6 },
  { id: 4, domain: 'secure-bank-verify.com', category: 'Phishing', risk: 95, tier: 'A', status: 'Blocked', detectedDate: '2026-02-22', cluster: 'CLS-0041', markers: 9 },
  { id: 5, domain: 'crypto-double-fast.io', category: 'Scam', risk: 89, tier: 'A', status: 'Under Review', detectedDate: '2026-02-22', cluster: 'CLS-0039', markers: 5 },
  { id: 6, domain: 'slot-empire-vip.casino', category: 'Casino', risk: 88, tier: 'A', status: 'Blocked', detectedDate: '2026-02-21', cluster: 'CLS-0042', markers: 7 },
  { id: 7, domain: 'profit-x-trading.com', category: 'Pyramid', risk: 78, tier: 'B', status: 'Blocked', detectedDate: '2026-02-21', cluster: 'CLS-0038', markers: 4 },
  { id: 8, domain: 'account-verify-now.org', category: 'Phishing', risk: 96, tier: 'A', status: 'Blocked', detectedDate: '2026-02-20', cluster: 'CLS-0041', markers: 10 },
  { id: 9, domain: 'fast-money-guru.biz', category: 'Scam', risk: 84, tier: 'B', status: 'Under Review', detectedDate: '2026-02-20', cluster: 'CLS-0040', markers: 5 },
  { id: 10, domain: 'diamond-fund-invest.co', category: 'Pyramid', risk: 82, tier: 'B', status: 'Blocked', detectedDate: '2026-02-19', cluster: 'CLS-0038', markers: 4 },
  { id: 11, domain: 'golden-slots-kz.com', category: 'Casino', risk: 85, tier: 'A', status: 'Blocked', detectedDate: '2026-02-19', cluster: 'CLS-0042', markers: 6 },
  { id: 12, domain: 'spin-bonus-pro.bet', category: 'Casino', risk: 79, tier: 'B', status: 'Monitoring', detectedDate: '2026-02-18', cluster: 'CLS-0042', markers: 4 },
  { id: 13, domain: 'trade-master-ai.pro', category: 'Pyramid', risk: 72, tier: 'B', status: 'Monitoring', detectedDate: '2026-02-18', cluster: 'CLS-0037', markers: 3 },
  { id: 14, domain: 'free-bitcoin-daily.net', category: 'Scam', risk: 68, tier: 'C', status: 'Monitoring', detectedDate: '2026-02-17', cluster: 'CLS-0036', markers: 3 },
  { id: 15, domain: 'login-bank-kz.info', category: 'Phishing', risk: 93, tier: 'A', status: 'Blocked', detectedDate: '2026-02-17', cluster: 'CLS-0041', markers: 8 },
];

export const nodeColors = {
  website: '#00f0ff',
  domain: '#a855f7',
  tracker: '#ff8c42',
  certificate: '#2ed573',
  wallet: '#ffd700',
  contact: '#ff6b81',
};

export const categoryColors = {
  Casino: '#ff6b81',
  Scam: '#ffa502',
  Phishing: '#ff4757',
  Pyramid: '#a855f7',
};
