import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    AlertTriangle,
    Server,
    BarChart3,
    Wallet,
    MessageCircle,
    ExternalLink,
    Clock,
    Network,
    ChevronRight,
    ChevronDown,
    Globe,
    ShieldX,
    FileSearch,
    User,
} from 'lucide-react';
import RiskGauge from '../components/RiskGauge';
import { analyzeWebsite as analyzeUrl } from '../ai/analyze';
import { useLang } from '../i18n/LanguageContext';
import './Analysis.css';

const categoryColors = {
    Casino: '#ff6b81',
    Scam: '#ffa502',
    Phishing: '#ff4757',
    Pyramid: '#a855f7',
    Unknown: '#888',
    Safe: '#22c55e',
    'Not Found': '#888',
};

export default function Analysis() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { t } = useLang();
    const url = searchParams.get('url') || '1xbet.com';
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusText, setStatusText] = useState('');
    const [expandedEvidence, setExpandedEvidence] = useState(new Set());

    useEffect(() => {
        setLoading(true);
        setError(null);
        setData(null);
        setStatusText(t('analysis.initScan'));

        const statuses = [
            t('analysis.statusChecking'),
            t('analysis.statusDNS'),
            t('analysis.statusTLS'),
            t('analysis.statusFingerprints'),
            t('analysis.statusHeuristic'),
            t('analysis.statusRisk'),
            t('analysis.statusEcosystem'),
        ];
        let statusIdx = 0;
        const statusInterval = setInterval(() => {
            if (statusIdx < statuses.length) {
                setStatusText(statuses[statusIdx]);
                statusIdx++;
            }
        }, 400);

        analyzeUrl(url)
            .then((result) => {
                clearInterval(statusInterval);
                setData(result);
                setLoading(false);
            })
            .catch((err) => {
                clearInterval(statusInterval);
                setError(err.message);
                setLoading(false);
            });

        return () => clearInterval(statusInterval);
    }, [url]);

    const toggleEvidence = (idx) => {
        setExpandedEvidence(prev => {
            const next = new Set(prev);
            if (next.has(idx)) next.delete(idx); else next.add(idx);
            return next;
        });
    };

    if (loading) {
        return (
            <div className="analysis page-container">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>{t('analysis.analyzing')} <strong>{url}</strong>...</p>
                    <p className="loading-sub">{statusText}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="analysis page-container">
                <div className="loading-state">
                    <AlertTriangle size={48} style={{ color: 'var(--danger)', marginBottom: '1rem' }} />
                    <p>{t('analysis.analysisFailed')} <strong>{url}</strong></p>
                    <p className="loading-sub">{error}</p>
                    <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/')}>
                        {t('analysis.backToDashboard')}
                    </button>
                </div>
            </div>
        );
    }

    if (!data) return null;

    // Domain not found state
    if (data.domainExists === false) {
        return (
            <div className="analysis page-container">
                <div className="analysis-header animate-in">
                    <div>
                        <h1 className="page-title">{t('analysis.title')}</h1>
                        <p className="page-subtitle">
                            <Clock size={14} /> {t('analysis.completedIn')} {data.scan_time}s
                        </p>
                    </div>
                </div>
                <div className="not-found-card glass-card animate-in animate-in-delay-1">
                    <ShieldX size={64} style={{ color: 'var(--text-dim)', marginBottom: 16 }} />
                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: 8 }}>{t('analysis.domainNotFound')}</h2>
                    <p className="url-text" style={{ fontSize: '1.1rem', marginBottom: 16 }}>{data.url}</p>
                    <div className="not-found-detail glass-card">
                        <Globe size={16} style={{ color: 'var(--text-muted)' }} />
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {t('analysis.dnsLookup')} <strong>NXDOMAIN</strong> {t('analysis.nxdomain')}
                        </p>
                    </div>
                    <button className="btn-primary" style={{ marginTop: 24 }} onClick={() => navigate('/')}>
                        {t('analysis.analyzeAnother')}
                    </button>
                </div>
            </div>
        );
    }

    const markerSections = [
        { key: 'infrastructure', title: t('analysis.infrastructure'), icon: Server, color: 'var(--accent-cyan)' },
        { key: 'tracking', title: t('analysis.tracking'), icon: BarChart3, color: 'var(--accent-violet)' },
        { key: 'financial', title: t('analysis.financial'), icon: Wallet, color: 'var(--warning)' },
        { key: 'contacts', title: t('analysis.contacts'), icon: MessageCircle, color: '#ff6b81' },
    ];

    const riskLabel = data.risk_score >= 80 ? t('analysis.highRisk') : data.risk_score >= 50 ? t('analysis.mediumRisk') : t('analysis.lowRisk');
    const riskBadgeClass = data.risk_score >= 80 ? 'badge-danger' : data.risk_score >= 50 ? 'badge-warning' : 'badge-cyan';

    return (
        <div className="analysis page-container">
            <div className="analysis-header animate-in">
                <div>
                    <h1 className="page-title">{t('analysis.title')}</h1>
                    <p className="page-subtitle">
                        <Clock size={14} /> {t('analysis.scannedIn')} {data.scan_time}s — {new Date(data.analyzed_at).toLocaleString()}
                        {data.cached && <span className="badge badge-cyan" style={{ marginLeft: 8, fontSize: 10 }}>CACHED</span>}
                    </p>
                </div>
                <button className="btn-primary" onClick={() => navigate(`/ecosystem?url=${encodeURIComponent(url)}`)}>
                    <Network size={16} /> {t('analysis.viewEcosystem')}
                </button>
            </div>

            {/* Top Row: Gauge + Summary */}
            <div className="analysis-top animate-in animate-in-delay-1">
                <div className="gauge-card glass-card">
                    <RiskGauge score={data.risk_score} size={220} />
                    <div
                        className="category-badge"
                        style={{
                            background: `${categoryColors[data.category] || categoryColors.Unknown}20`,
                            color: categoryColors[data.category] || categoryColors.Unknown,
                            border: `1px solid ${categoryColors[data.category] || categoryColors.Unknown}40`,
                        }}
                    >
                        <AlertTriangle size={14} />
                        {data.category}
                    </div>
                    {data.confidence > 0 && (
                        <div className="confidence-label" style={{ marginTop: 8, color: 'var(--text-muted)', fontSize: 12 }}>
                            {t('analysis.confidence')} {Math.round(data.confidence * 100)}%
                        </div>
                    )}
                </div>

                <div className="reasons-card glass-card">
                    <h3 className="card-title">
                        <FileSearch size={18} style={{ marginRight: 8 }} />
                        {data.risk_score >= 50 ? t('analysis.whyUnsafe') : t('analysis.whyAnalyzed')}
                    </h3>
                    <div className="reasons-list">
                        {data.explanations.length === 0 ? (
                            <div className="reason-item" style={{ color: 'var(--success)' }}>
                                {t('analysis.noRiskIndicators')}
                            </div>
                        ) : (
                            data.explanations.map((r, i) => (
                                <div key={i} className="reason-item-wrapper">
                                    <div className="reason-item" onClick={() => toggleEvidence(i)} style={{ cursor: 'pointer' }}>
                                        <div className="reason-weight">+{r.weight}</div>
                                        <div className="reason-label">{r.label}</div>
                                        <span className={`badge badge-${r.type === 'infrastructure' ? 'cyan' : r.type === 'tracking' ? 'violet' : r.type === 'financial' ? 'warning' : r.type === 'ecosystem' ? 'cyan' : 'danger'}`}>
                                            {r.type}
                                        </span>
                                        <ChevronDown size={14} className={`evidence-chevron ${expandedEvidence.has(i) ? 'rotated' : ''}`} />
                                    </div>
                                    {expandedEvidence.has(i) && r.evidence && (
                                        <div className="evidence-panel">
                                            <div className="evidence-label">
                                                <FileSearch size={12} /> {t('analysis.evidenceLocation')}
                                            </div>
                                            <p className="evidence-text">{r.evidence}</p>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* URL analyzed */}
            <div className="url-bar glass-card animate-in animate-in-delay-2">
                <ExternalLink size={16} className="url-icon" />
                <span className="url-text">{data.url}</span>
                <span className={`badge ${riskBadgeClass}`}>{riskLabel}</span>
                {data.cluster_id && (
                    <span className="badge badge-violet" style={{ marginLeft: 8 }}>{data.cluster_id}</span>
                )}
            </div>

            {/* Engine stats */}
            <div className="engine-stats animate-in animate-in-delay-2">
                <div className="glass-card" style={{ padding: '12px 20px', fontSize: 13, color: 'var(--text-muted)' }}>
                    {t('analysis.rulesEvaluated')} <strong style={{ color: 'var(--text-primary)' }}>{data.rules_evaluated}</strong>
                </div>
                <div className="glass-card" style={{ padding: '12px 20px', fontSize: 13, color: 'var(--text-muted)' }}>
                    {t('analysis.rulesTriggered')} <strong style={{ color: 'var(--text-primary)' }}>{data.rules_fired}</strong>
                </div>
            </div>

            {/* ML Model Classification */}
            {data.ml_prediction && (
                <div className="ml-prediction-card glass-card animate-in animate-in-delay-2" style={{ marginTop: 16, padding: 24 }}>
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <span style={{ fontSize: 18 }}>🧠</span>
                        {t('analysis.mlTitle')}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                        <div style={{
                            padding: '8px 16px',
                            borderRadius: 8,
                            fontWeight: 700,
                            fontSize: 14,
                            textTransform: 'uppercase',
                            letterSpacing: 1,
                            background: data.ml_prediction.prediction === 'benign' ? 'rgba(34,197,94,0.15)' :
                                data.ml_prediction.prediction === 'phishing' ? 'rgba(255,71,87,0.15)' :
                                    data.ml_prediction.prediction === 'malware' ? 'rgba(255,165,2,0.15)' :
                                        'rgba(168,85,247,0.15)',
                            color: data.ml_prediction.prediction === 'benign' ? '#22c55e' :
                                data.ml_prediction.prediction === 'phishing' ? '#ff4757' :
                                    data.ml_prediction.prediction === 'malware' ? '#ffa502' :
                                        '#a855f7',
                            border: `1px solid ${data.ml_prediction.prediction === 'benign' ? 'rgba(34,197,94,0.3)' :
                                data.ml_prediction.prediction === 'phishing' ? 'rgba(255,71,87,0.3)' :
                                    data.ml_prediction.prediction === 'malware' ? 'rgba(255,165,2,0.3)' :
                                        'rgba(168,85,247,0.3)'}`,
                        }}>
                            {data.ml_prediction.prediction}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                            {t('analysis.mlConfidence')} <strong style={{ color: 'var(--text-primary)' }}>{Math.round(data.ml_prediction.confidence * 100)}%</strong>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gap: 8 }}>
                        {Object.entries(data.ml_prediction.probabilities)
                            .sort(([, a], [, b]) => b - a)
                            .map(([cls, prob]) => {
                                const colors = {
                                    benign: '#22c55e',
                                    phishing: '#ff4757',
                                    malware: '#ffa502',
                                    defacement: '#a855f7',
                                };
                                return (
                                    <div key={cls} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <span style={{ width: 80, fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{cls}</span>
                                        <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.05)' }}>
                                            <div style={{
                                                width: `${prob * 100}%`,
                                                height: '100%',
                                                borderRadius: 4,
                                                background: colors[cls] || '#888',
                                                transition: 'width 0.6s ease',
                                                minWidth: prob > 0 ? 4 : 0,
                                            }} />
                                        </div>
                                        <span style={{ width: 44, fontSize: 12, color: 'var(--text-secondary)', textAlign: 'right' }}>{(prob * 100).toFixed(1)}%</span>
                                    </div>
                                );
                            })
                        }
                    </div>
                    <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-dim)', fontStyle: 'italic' }}>
                        {t('analysis.mlNote')}
                    </div>
                </div>
            )}

            {/* Redirect Chain */}
            {data.redirect_chain && data.redirect_chain.length > 0 && (
                <div className="redirect-section animate-in animate-in-delay-2">
                    <h3 className="section-title-sm">{t('analysis.redirectChain')}</h3>
                    <div className="redirect-chain">
                        {data.redirect_chain.map((step, i) => (
                            <div key={i} className="redirect-step">
                                <div className="redirect-step-num">{step.step}</div>
                                <div className="redirect-step-content glass-card">
                                    <div className="redirect-url">{step.url}</div>
                                    <div className="redirect-meta">
                                        <span className="badge badge-cyan">{step.type}</span>
                                        <span className="redirect-status">HTTP {step.status}</span>
                                    </div>
                                </div>
                                {i < data.redirect_chain.length - 1 && (
                                    <div className="redirect-arrow">
                                        <ChevronRight size={16} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Digital Markers */}
            <div className="markers-section animate-in animate-in-delay-3">
                <h3 className="section-title-sm">{t('analysis.extractedMarkers')}</h3>
                <div className="markers-grid">
                    {markerSections.map((section) => {
                        const Icon = section.icon;
                        const rawData = data.markers?.[section.key];
                        const items = rawData ? Object.entries(rawData)
                            .filter(([, v]) => v != null && v !== false)
                            .map(([k, v]) => ({ key: k, value: typeof v === 'object' ? JSON.stringify(v) : String(v) })) : [];
                        if (items.length === 0) return null;
                        return (
                            <div key={section.key} className="marker-card glass-card">
                                <div className="marker-header">
                                    <Icon size={18} style={{ color: section.color }} />
                                    <h4>{section.title}</h4>
                                    <span className="marker-count">{items.length}</span>
                                </div>
                                <div className="marker-items">
                                    {items.map((item, i) => (
                                        <div key={i} className="marker-item">
                                            <span className="marker-key">{item.key}</span>
                                            <span className="marker-value">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* WHOIS Info */}
            {data.domain_analysis?.whois && (
                <div className="whois-section animate-in animate-in-delay-3">
                    <h3 className="section-title-sm"><User size={16} /> {t('analysis.registration')}</h3>
                    <div className="glass-card" style={{ padding: 20 }}>
                        <div className="markers-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                            {Object.entries(data.domain_analysis.whois).map(([k, v]) => (
                                <div key={k} className="marker-item" style={{ padding: '8px 0' }}>
                                    <span className="marker-key">{k}</span>
                                    <span className="marker-value">{String(v)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
