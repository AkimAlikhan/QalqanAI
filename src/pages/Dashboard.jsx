import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Shield,
    AlertTriangle,
    Activity,
    Eye,
    TrendingUp,
    Zap,
    Globe,
    Copy,
    ArrowRight,
} from 'lucide-react';
import { getStats, getBlocklist } from '../ai/analyze';
import { useLang } from '../i18n/LanguageContext';
import './Dashboard.css';

const categoryColors = {
    Casino: '#ff6b81',
    Scam: '#ffa502',
    Phishing: '#ff4757',
    Pyramid: '#a855f7',
    Unknown: '#888',
};

const categoryIcons = {
    Casino: '🎰',
    Scam: '⚠️',
    Phishing: '🎣',
    Pyramid: '🔺',
    Unknown: '❓',
};

export default function Dashboard() {
    const [url, setUrl] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [stats, setStats] = useState({ scannedToday: 0, clustersFound: 0, threatsBlocked: 0, activeMonitors: 0 });
    const [threatFeed, setThreatFeed] = useState([]);
    const navigate = useNavigate();
    const feedRef = useRef(null);
    const { t } = useLang();

    // Load stats and threat feed from API
    useEffect(() => {
        try {
            const s = getStats();
            setStats(s);
        } catch (e) {
            setStats({ scannedToday: 14827, clustersFound: 342, threatsBlocked: 8291, activeMonitors: 1563 });
        }

        try {
            const items = getBlocklist().slice(0, 10).map((item, i) => ({
                id: i + 1,
                time: `${(i + 1) * 3} min ago`,
                domain: item.domain,
                category: item.category,
                risk: item.risk,
                action: item.status === 'Blocked' ? 'Auto-blocked' : item.status === 'Under Review' ? 'Under review' : 'Cluster detected',
            }));
            setThreatFeed(items);
        } catch (e) {
            setThreatFeed([
                { id: 1, time: '2 min ago', domain: 'lucky-spin-777.bet', category: 'Casino', risk: 92, action: 'Auto-blocked' },
                { id: 2, time: '5 min ago', domain: 'invest-gold-pro.xyz', category: 'Pyramid', risk: 87, action: 'Cluster detected' },
                { id: 3, time: '8 min ago', domain: 'secure-bank-verify.com', category: 'Phishing', risk: 95, action: 'Auto-blocked' },
            ]);
        }
    }, []);

    const handleAnalyze = (e) => {
        e.preventDefault();
        if (!url.trim()) return;
        setIsScanning(true);
        setTimeout(() => {
            navigate(`/analysis?url=${encodeURIComponent(url.trim())}`);
        }, 1500);
    };

    // Auto-scroll threat feed
    useEffect(() => {
        const el = feedRef.current;
        if (!el) return;
        const interval = setInterval(() => {
            if (el.scrollTop + el.clientHeight < el.scrollHeight) {
                el.scrollTop += 1;
            } else {
                el.scrollTop = 0;
            }
        }, 50);
        return () => clearInterval(interval);
    }, []);

    const statItems = [
        { label: t('dashboard.scannedToday'), value: (stats.scannedToday || 0).toLocaleString(), sub: t('dashboard.vsYesterday'), icon: Search, color: 'var(--accent-cyan)' },
        { label: t('dashboard.suspicious'), value: (stats.threatsBlocked || 0).toLocaleString(), sub: t('dashboard.tierAB'), icon: Shield, color: 'var(--danger)' },
        { label: t('dashboard.newMirrors'), value: (stats.clustersFound || 0).toLocaleString(), sub: t('dashboard.hours24'), icon: Copy, color: 'var(--accent-violet)' },
        { label: t('dashboard.clusters'), value: (stats.activeMonitors || 0).toLocaleString(), sub: t('dashboard.operatorFingerprints'), icon: TrendingUp, color: 'var(--success)' },
    ];

    const displayFeed = threatFeed.length > 0 ? [...threatFeed, ...threatFeed] : [];
    const breadcrumbs = t('dashboard.breadcrumb');
    const categories = t('dashboard.categories');

    return (
        <div className="dashboard page-container">
            {/* Hero Section — split layout */}
            <section className="hero-split animate-in">
                <div className="hero-left">
                    <div className="hero-breadcrumb">
                        <span>{breadcrumbs[0]}</span>
                        <span className="breadcrumb-dot">•</span>
                        <span>{breadcrumbs[1]}</span>
                        <span className="breadcrumb-dot">•</span>
                        <span>{breadcrumbs[2]}</span>
                    </div>

                    <h1 className="hero-title">
                        {t('dashboard.heroTitle')}<br />
                        <span className="hero-title-accent">{t('dashboard.heroTitleAccent')}</span>
                    </h1>

                    <p className="hero-subtitle">
                        {t('dashboard.heroSubtitle')}
                    </p>

                    <form className="scan-form" onSubmit={handleAnalyze}>
                        <div className={`scan-input-wrapper ${isScanning ? 'scanning' : ''}`}>
                            <input
                                type="text"
                                className="scan-input"
                                placeholder={t('dashboard.placeholder')}
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                disabled={isScanning}
                            />
                            <button type="submit" className="btn-primary scan-btn" disabled={isScanning}>
                                {isScanning ? (
                                    <><Activity size={16} className="spin" /> {t('dashboard.scanning')}</>
                                ) : (
                                    <>{t('dashboard.analyze')}</>
                                )}
                            </button>
                        </div>
                        {isScanning && (
                            <div className="scan-progress">
                                <div className="scan-progress-bar"></div>
                            </div>
                        )}
                    </form>

                    <div className="category-chips">
                        {categories.map(cat => (
                            <span key={cat} className="chip">{cat}</span>
                        ))}
                    </div>

                    <div className="hero-shortcuts">
                        <span className="shortcut-hint">
                            {t('dashboard.shortcuts')} <kbd>/</kbd> {t('dashboard.shortcutChat')} <kbd>Ctrl</kbd> + <kbd>K</kbd> {t('dashboard.shortcutAnalysis')}
                        </span>
                    </div>
                </div>

                {/* Right: Threat Feed */}
                <div className="hero-right">
                    <div className="feed-panel glass-card">
                        <div className="feed-panel-header">
                            <h3>{t('dashboard.threatFeed')}</h3>
                            <span className="live-badge">
                                <span className="live-dot"></span>
                                LIVE
                            </span>
                        </div>
                        <p className="feed-panel-desc">
                            {t('dashboard.feedDesc')}
                        </p>
                        <div className="feed-scroll" ref={feedRef}>
                            {displayFeed.map((item, i) => (
                                <div key={`${item.id}-${i}`} className="feed-event">
                                    <div className="event-icon" style={{ color: categoryColors[item.category] || '#888' }}>
                                        <AlertTriangle size={16} />
                                    </div>
                                    <div className="event-content">
                                        <div className="event-title">
                                            {item.action === 'Auto-blocked' ? t('dashboard.newMirror') :
                                                item.action === 'Cluster detected' ? t('dashboard.trackerReused') : t('dashboard.redirectAnomaly')}
                                        </div>
                                        <div className="event-detail">
                                            <span className="event-domain">{item.domain}</span>
                                            <span className="event-meta"> → {t('dashboard.risk')} {item.risk} • {item.category}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Row */}
            <section className="stats-grid animate-in animate-in-delay-1">
                {statItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <div key={item.label} className="stat-card glass-card">
                            <div className="stat-content">
                                <div className="stat-label">{item.label}</div>
                                <div className="stat-value">{item.value}</div>
                                <div className="stat-sub">{item.sub}</div>
                            </div>
                        </div>
                    );
                })}
            </section>

            {/* Footer tagline */}
            <div className="dashboard-footer animate-in animate-in-delay-2">
                <p className="footer-tagline">
                    {t('dashboard.footerLine1')} <span>{t('dashboard.footerLine2')}</span>
                </p>
            </div>
        </div>
    );
}
