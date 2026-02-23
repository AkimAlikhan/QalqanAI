import {
    Globe,
    Code2,
    Fingerprint,
    BarChart3,
    Network,
    ShieldAlert,
    ArrowDown,
    Server,
    Eye,
    Wallet,
    MessageCircle,
    GitBranch,
} from 'lucide-react';
import './HowItWorks.css';

const steps = [
    {
        num: '01',
        title: 'URL Intake',
        icon: Globe,
        color: 'var(--accent-cyan)',
        description: 'A user submits a website URL or domain name. The system begins a controlled, read-only, non-intrusive scan. No interaction with the target site beyond what a normal browser would do.',
        details: ['Website URL submission', 'Domain name lookup', 'Controlled read-only scanning', 'No intrusive probing'],
    },
    {
        num: '02',
        title: 'Full Page Rendering',
        icon: Code2,
        color: 'var(--accent-violet)',
        description: 'Many scam and casino sites hide content behind JavaScript. QalqanAI loads the site as a real browser, captures the final rendered HTML, and records redirect chains and hidden scripts.',
        details: ['Headless browser rendering', 'JavaScript execution capture', 'Redirect chain recording', 'Hidden script detection'],
    },
    {
        num: '03',
        title: 'Digital Marker Extraction',
        icon: Fingerprint,
        color: '#ff8c42',
        description: 'The system extracts hard-to-fake digital identifiers grouped into categories: infrastructure markers, tracking IDs, funnel patterns, financial indicators, and operator signals.',
        categories: [
            { icon: Server, label: 'Infrastructure', items: ['IP address', 'Hosting / ASN', 'TLS certificate', 'CDN behavior'] },
            { icon: Eye, label: 'Tracking', items: ['Google Analytics ID', 'Facebook Pixel', 'TikTok Pixel', 'Affiliate params'] },
            { icon: GitBranch, label: 'Funnel Patterns', items: ['Redirect count', 'Landing → pre-landing', 'Conversion sequence'] },
            { icon: Wallet, label: 'Financial', items: ['Crypto wallets', 'Payment gateways', 'Card top-up flows'] },
            { icon: MessageCircle, label: 'Contact Signals', items: ['Telegram handles', 'WhatsApp numbers', 'Email reuse'] },
        ],
    },
    {
        num: '04',
        title: 'Risk Scoring (Explainable AI)',
        icon: BarChart3,
        color: 'var(--danger)',
        description: 'Each extracted marker adds weighted risk. The system produces a transparent score from 0–100, a threat category, and a human-readable explanation. No "black box" decisions.',
        scoreExample: [
            { reason: 'Shared TLS fingerprint with known scam', weight: '+25' },
            { reason: 'Reused GA ID across 10 domains', weight: '+30' },
            { reason: 'Crypto wallet detected', weight: '+15' },
            { reason: 'Aggressive conversion language', weight: '+10' },
        ],
    },
    {
        num: '05',
        title: 'Graph & Ecosystem Detection',
        icon: Network,
        color: 'var(--success)',
        description: 'All analyzed sites are stored as nodes in a graph database. Shared markers create edges between nodes. This reveals mirror sites, operator clusters, affiliate networks, and infrastructure reuse.',
        details: ['Mirror site detection', 'Operator clustering', 'Affiliate network mapping', 'Risk propagation through clusters'],
    },
    {
        num: '06',
        title: 'Action Output',
        icon: ShieldAlert,
        color: '#ffd700',
        description: 'The system generates structured blocklists, evidence packs, cluster reports, and monitoring alerts for new mirrors. Results are ready for regulatory action or automated blocking.',
        details: ['Structured blocklists', 'Evidence documentation', 'Cluster reports', 'New mirror alerts'],
    },
];

export default function HowItWorks() {
    return (
        <div className="how-it-works page-container">
            <div className="animate-in">
                <h1 className="page-title">How It Works</h1>
                <p className="page-subtitle">
                    Understanding QalqanAI&apos;s infrastructure-level detection methodology
                </p>
            </div>

            {/* Core Principle */}
            <div className="principle-card glass-card animate-in animate-in-delay-1">
                <div className="principle-icon">
                    <Fingerprint size={28} />
                </div>
                <div className="principle-content">
                    <h2 className="principle-title">Core Principle</h2>
                    <p className="principle-text">
                        Unsafe platforms can change their appearance, but they <strong>cannot easily change their entire digital infrastructure</strong>.
                        QalqanAI detects shared technical fingerprints, repeated trackers, reused payment endpoints, identical redirect funnels,
                        and operator behavior patterns — revealing entire illegal ecosystems, not single sites.
                    </p>
                </div>
            </div>

            {/* Comparison */}
            <div className="comparison-section animate-in animate-in-delay-2">
                <div className="comparison-card glass-card comparison-old">
                    <h3>Traditional Detection</h3>
                    <ul>
                        <li className="comparison-fail">Analyzes page text</li>
                        <li className="comparison-fail">Keyword matching</li>
                        <li className="comparison-fail">Static blacklists</li>
                        <li className="comparison-fail">Fails when content changes</li>
                    </ul>
                </div>
                <div className="comparison-vs">VS</div>
                <div className="comparison-card glass-card comparison-new">
                    <h3>QalqanAI Detection</h3>
                    <ul>
                        <li className="comparison-pass">Infrastructure fingerprinting</li>
                        <li className="comparison-pass">Behavioral analysis</li>
                        <li className="comparison-pass">Graph-based clustering</li>
                        <li className="comparison-pass">Resistant to evasion</li>
                    </ul>
                </div>
            </div>

            {/* Pipeline */}
            <div className="pipeline animate-in animate-in-delay-3">
                {steps.map((step, i) => {
                    const Icon = step.icon;
                    return (
                        <div key={step.num} className="pipeline-step">
                            <div className="step-connector">
                                <div className="step-num" style={{ background: `${step.color}15`, color: step.color, borderColor: `${step.color}40` }}>
                                    {step.num}
                                </div>
                                {i < steps.length - 1 && <div className="step-line"></div>}
                            </div>
                            <div className="step-card glass-card">
                                <div className="step-header">
                                    <div className="step-icon" style={{ background: `${step.color}15`, color: step.color }}>
                                        <Icon size={20} />
                                    </div>
                                    <h3 className="step-title">{step.title}</h3>
                                </div>
                                <p className="step-description">{step.description}</p>

                                {step.details && (
                                    <div className="step-details">
                                        {step.details.map((d, j) => (
                                            <span key={j} className="step-detail-tag">{d}</span>
                                        ))}
                                    </div>
                                )}

                                {step.categories && (
                                    <div className="step-categories">
                                        {step.categories.map((cat, j) => {
                                            const CatIcon = cat.icon;
                                            return (
                                                <div key={j} className="category-block">
                                                    <div className="category-header">
                                                        <CatIcon size={14} />
                                                        <span>{cat.label}</span>
                                                    </div>
                                                    <div className="category-items">
                                                        {cat.items.map((item, k) => (
                                                            <span key={k} className="category-item">{item}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {step.scoreExample && (
                                    <div className="score-example">
                                        {step.scoreExample.map((s, j) => (
                                            <div key={j} className="score-row">
                                                <span className="score-reason">{s.reason}</span>
                                                <span className="score-weight">{s.weight}</span>
                                            </div>
                                        ))}
                                        <div className="score-total">
                                            <span>Total Risk Score</span>
                                            <span className="score-total-value">80 / 100</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom thesis */}
            <div className="thesis-section glass-card animate-in animate-in-delay-4">
                <h3 className="thesis-title">Why Infrastructure Beats Content</h3>
                <p className="thesis-text">
                    Content is cheap to change — a scam site can rewrite its text in minutes.
                    But infrastructure is expensive and complex: IP addresses, TLS certificates,
                    tracking IDs, payment integrations, and redirect architectures are deeply embedded.
                    By targeting these invariants, QalqanAI detects threats that evade every content-based system.
                </p>
            </div>
        </div>
    );
}
