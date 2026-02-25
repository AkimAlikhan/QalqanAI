import { Check, X, Sparkles, Shield, Zap, Building2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Pricing.css';

const plans = [
    {
        name: 'Free',
        price: '$0',
        period: 'forever',
        description: 'For individuals exploring website safety',
        color: 'var(--text-primary)',
        features: [
            { text: '10 scans per day', included: true },
            { text: 'Basic risk scoring (0–100)', included: true },
            { text: 'Threat categorization', included: true },
            { text: 'Redirect chain analysis', included: true },
            { text: 'Community threat feed', included: true },
            { text: 'Unlimited scans', included: false },
            { text: 'Full API access', included: false },
            { text: 'Cluster intelligence reports', included: false },
            { text: 'Priority threat alerts', included: false },
            { text: 'Custom blocklist export', included: false },
            { text: 'Dedicated support', included: false },
        ],
        cta: 'Get Started Free',
        ctaLink: '/',
        popular: false,
    },
    {
        name: 'Pro',
        price: '$29',
        period: '/month',
        description: 'For security teams and researchers',
        color: 'var(--accent-cyan)',
        features: [
            { text: 'Unlimited scans', included: true },
            { text: 'Advanced AI risk scoring', included: true },
            { text: 'Deep threat categorization', included: true },
            { text: 'Full redirect chain + funnel analysis', included: true },
            { text: 'Real-time threat feed', included: true },
            { text: 'Full REST API access', included: true },
            { text: 'Cluster intelligence reports', included: true },
            { text: 'Priority email & Telegram alerts', included: true },
            { text: 'CSV / JSON / STIX export', included: true },
            { text: 'WHOIS + registrar enrichment', included: true },
            { text: 'Priority support (< 4h)', included: true },
        ],
        cta: 'Start 14-Day Trial',
        ctaLink: '/contact',
        popular: true,
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        period: '',
        description: 'For regulators, ISPs, and government',
        color: 'var(--accent-violet)',
        features: [
            { text: 'Everything in Pro', included: true },
            { text: 'On-premise deployment', included: true },
            { text: 'Bulk domain scanning API', included: true },
            { text: 'Custom integration (SIEM, SOC)', included: true },
            { text: 'Regulatory compliance packs', included: true },
            { text: 'Dedicated account manager', included: true },
            { text: 'SLA-backed uptime guarantee', included: true },
            { text: 'Custom ML model training', included: true },
            { text: 'White-label option', included: true },
            { text: 'Unlimited users & teams', included: true },
            { text: '24/7 priority support', included: true },
        ],
        cta: 'Contact Sales',
        ctaLink: '/contact',
        popular: false,
    },
];

export default function Pricing() {
    return (
        <div className="pricing page-container">
            <div className="pricing-hero animate-in">
                <h1 className="page-title">Simple, Transparent Pricing</h1>
                <p className="page-subtitle">
                    QalqanAI is free for individuals. Pro and Enterprise plans fund ongoing AI model development,
                    infrastructure costs, and threat intelligence expansion.
                </p>
            </div>

            {/* Why Pricing */}
            <div className="pricing-why glass-card animate-in animate-in-delay-1">
                <h3><Sparkles size={18} /> Why Do We Offer Paid Plans?</h3>
                <div className="why-grid">
                    <div className="why-item">
                        <Zap size={16} style={{ color: 'var(--accent-cyan)' }} />
                        <div>
                            <strong>AI Infrastructure</strong>
                            <p>Running advanced heuristic analysis, DNS lookups, and graph clustering requires compute resources that grow with usage.</p>
                        </div>
                    </div>
                    <div className="why-item">
                        <Shield size={16} style={{ color: 'var(--danger)' }} />
                        <div>
                            <strong>Threat Intelligence</strong>
                            <p>Keeping our threat database current with new malicious domains, scam patterns, and phishing campaigns from all over the world.</p>
                        </div>
                    </div>
                    <div className="why-item">
                        <Building2 size={16} style={{ color: 'var(--accent-violet)' }} />
                        <div>
                            <strong>Sustainable Development</strong>
                            <p>Paid plans allow us to hire researchers, improve detection accuracy, and build features like API access and compliance reports.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Plans */}
            <div className="plans-grid animate-in animate-in-delay-2">
                {plans.map((plan) => (
                    <div key={plan.name} className={`plan-card glass-card ${plan.popular ? 'plan-popular' : ''}`}>
                        {plan.popular && <div className="popular-badge">Most Popular</div>}
                        <div className="plan-header">
                            <h2 className="plan-name" style={{ color: plan.color }}>{plan.name}</h2>
                            <div className="plan-price">
                                <span className="price-value">{plan.price}</span>
                                <span className="price-period">{plan.period}</span>
                            </div>
                            <p className="plan-desc">{plan.description}</p>
                        </div>
                        <ul className="plan-features">
                            {plan.features.map((f, i) => (
                                <li key={i} className={f.included ? 'feature-included' : 'feature-excluded'}>
                                    {f.included ? <Check size={14} /> : <X size={14} />}
                                    {f.text}
                                </li>
                            ))}
                        </ul>
                        <Link to={plan.ctaLink} className={`plan-cta ${plan.popular ? 'cta-primary' : 'cta-secondary'}`}>
                            {plan.cta} <ArrowRight size={14} />
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
