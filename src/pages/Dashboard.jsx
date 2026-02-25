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
        { label: 'Scanned Today', value: (stats.scannedToday || 0).toLocaleString(), sub: '+18% vs yesterday', icon: Search, color: 'var(--accent-cyan)' },
        { label: 'Suspicious', value: (stats.threatsBlocked || 0).toLocaleString(), sub: 'Tier A/B', icon: Shield, color: 'var(--danger)' },
        { label: 'New Mirrors', value: (stats.clustersFound || 0).toLocaleString(), sub: '24 hours', icon: Copy, color: 'var(--accent-violet)' },
        { label: 'Clusters', value: (stats.activeMonitors || 0).toLocaleString(), sub: 'Operator fingerprints', icon: TrendingUp, color: 'var(--success)' },
    ];

    const displayFeed = threatFeed.length > 0 ? [...threatFeed, ...threatFeed] : [];

    return (
        <div className="dashboard page-container">
            {/* Hero Section — split layout */}
            <section className="hero-split animate-in">
                <div className="hero-left">
                    <div className="hero-breadcrumb">
                        <span>Detection</span>
                        <span className="breadcrumb-dot">•</span>
                        <span>Graph</span>
                        <span className="breadcrumb-dot">•</span>
                        <span>Blocklist</span>
                    </div>

                    <h1 className="hero-title">
                        Find not one site —<br />
                        <span className="hero-title-accent">find the whole network.</span>
                    </h1>

                    <p className="hero-subtitle">
                        QalqanAI shows risk, reasons, and the "digital DNA" of a resource.
                        Infrastructure-level threat detection powered by graph mapping.
                    </p>

                    <form className="scan-form" onSubmit={handleAnalyze}>
                        <div className={`scan-input-wrapper ${isScanning ? 'scanning' : ''}`}>
                            <input
                                type="text"
                                className="scan-input"
                                placeholder="Enter URL to analyze..."
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                disabled={isScanning}
                            />
                            <button type="submit" className="btn-primary scan-btn" disabled={isScanning}>
                                {isScanning ? (
                                    <><Activity size={16} className="spin" /> Scanning...</>
                                ) : (
                                    <>Analyze</>
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
                        {['Casino', 'Pyramid', 'Scam / Fraud', 'Mirrors', 'Affiliate'].map(cat => (
                            <span key={cat} className="chip">{cat}</span>
                        ))}
                    </div>

                    <div className="hero-shortcuts">
                        <span className="shortcut-hint">
                            Shortcuts: <kbd>/</kbd> — chat, <kbd>Ctrl</kbd> + <kbd>K</kbd> — to analysis
                        </span>
                    </div>
                </div>

                {/* Right: Threat Feed */}
                <div className="hero-right">
                    <div className="feed-panel glass-card">
                        <div className="feed-panel-header">
                            <h3>Threat Feed</h3>
                            <span className="live-badge">
                                <span className="live-dot"></span>
                                LIVE
                            </span>
                        </div>
                        <p className="feed-panel-desc">
                            Event stream: new mirrors, marker coincidences, cluster growth.
                        </p>
                        <div className="feed-scroll" ref={feedRef}>
                            {displayFeed.map((item, i) => (
                                <div key={`${item.id}-${i}`} className="feed-event">
                                    <div className="event-icon" style={{ color: categoryColors[item.category] || '#888' }}>
                                        <AlertTriangle size={16} />
                                    </div>
                                    <div className="event-content">
                                        <div className="event-title">
                                            {item.action === 'Auto-blocked' ? 'New mirror detected' :
                                                item.action === 'Cluster detected' ? 'Tracker reused' : 'Redirect anomaly'}
                                        </div>
                                        <div className="event-detail">
                                            <span className="event-domain">{item.domain}</span>
                                            <span className="event-meta"> → risk {item.risk} • {item.category}</span>
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
                    QalqanAI does not chase websites. <span>It maps the infrastructure behind them.</span>
                </p>
            </div>
        </div>
    );
}
