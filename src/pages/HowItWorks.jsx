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
import { useLang } from '../i18n/LanguageContext';
import './HowItWorks.css';

const stepIcons = [Globe, Code2, Fingerprint, BarChart3, Network, ShieldAlert];
const stepColors = [
    'var(--accent-cyan)',
    'var(--accent-violet)',
    '#ff8c42',
    'var(--danger)',
    'var(--success)',
    '#ffd700',
];

const categoryIcons = [Server, Eye, GitBranch, Wallet, MessageCircle];

export default function HowItWorks() {
    const { t } = useLang();
    const steps = t('howItWorks.steps');

    return (
        <div className="how-it-works page-container">
            <div className="animate-in">
                <h1 className="page-title">{t('howItWorks.title')}</h1>
                <p className="page-subtitle">
                    {t('howItWorks.subtitle')}
                </p>
            </div>

            {/* Core Principle */}
            <div className="principle-card glass-card animate-in animate-in-delay-1">
                <div className="principle-icon">
                    <Fingerprint size={28} />
                </div>
                <div className="principle-content">
                    <h2 className="principle-title">{t('howItWorks.corePrinciple')}</h2>
                    <p className="principle-text">
                        {t('howItWorks.corePrincipleText')}
                    </p>
                </div>
            </div>

            {/* Comparison */}
            <div className="comparison-section animate-in animate-in-delay-2">
                <div className="comparison-card glass-card comparison-old">
                    <h3>{t('howItWorks.traditionalDetection')}</h3>
                    <ul>
                        {t('howItWorks.traditionalItems').map((item, i) => (
                            <li key={i} className="comparison-fail">{item}</li>
                        ))}
                    </ul>
                </div>
                <div className="comparison-vs">VS</div>
                <div className="comparison-card glass-card comparison-new">
                    <h3>{t('howItWorks.qalqanDetection')}</h3>
                    <ul>
                        {t('howItWorks.qalqanItems').map((item, i) => (
                            <li key={i} className="comparison-pass">{item}</li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Pipeline */}
            <div className="pipeline animate-in animate-in-delay-3">
                {steps.map((step, i) => {
                    const Icon = stepIcons[i];
                    const color = stepColors[i];
                    const num = String(i + 1).padStart(2, '0');
                    return (
                        <div key={num} className="pipeline-step">
                            <div className="step-connector">
                                <div className="step-num" style={{ background: `${color}15`, color: color, borderColor: `${color}40` }}>
                                    {num}
                                </div>
                                {i < steps.length - 1 && <div className="step-line"></div>}
                            </div>
                            <div className="step-card glass-card">
                                <div className="step-header">
                                    <div className="step-icon" style={{ background: `${color}15`, color: color }}>
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
                                            const CatIcon = categoryIcons[j];
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
                                            <span>{t('howItWorks.totalRiskScore')}</span>
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
                <h3 className="thesis-title">{t('howItWorks.whyInfraBeatsContent')}</h3>
                <p className="thesis-text">
                    {t('howItWorks.whyInfraText')}
                </p>
            </div>
        </div>
    );
}
