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
} from 'lucide-react';
import { getStats, getBlocklist } from '../api/client';
import './Dashboard.css';

const categoryColors = {
    Casino: '#ff6b81',
    Scam: '#ffa502',
    Phishing: '#ff4757',
    Pyramid: '#a855f7',
    Unknown: '#888',
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
        getStats()
            .then(setStats)
            .catch(() => {
                // Fallback stats if server isn't running
                setStats({ scannedToday: 14827, clustersFound: 342, threatsBlocked: 8291, activeMonitors: 1563 });
            });

        getBlocklist()
            .then((data) => {
                const items = (data.items || []).slice(0, 10).map((item, i) => ({
                    id: i + 1,
                    time: `${(i + 1) * 3} min ago`,
                    domain: item.domain,
                    category: item.category,
                    risk: item.risk,
                    action: item.status === 'Blocked' ? 'Auto-blocked' : item.status === 'Under Review' ? 'Under review' : 'Cluster detected',
                }));
                setThreatFeed(items);
            })
            .catch(() => {
                // Fallback feed
                setThreatFeed([
                    { id: 1, time: '2 min ago', domain: 'lucky-spin-777.bet', category: 'Casino', risk: 92, action: 'Auto-blocked' },
                    { id: 2, time: '5 min ago', domain: 'invest-gold-pro.xyz', category: 'Pyramid', risk: 87, action: 'Cluster detected' },
                    { id: 3, time: '8 min ago', domain: 'secure-bank-verify.com', category: 'Phishing', risk: 95, action: 'Auto-blocked' },
                ]);
            });
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
        { label: 'Scanned Today', value: (stats.scannedToday || 0).toLocaleString(), icon: Search, color: 'var(--accent-cyan)' },
        { label: 'Clusters Found', value: (stats.clustersFound || 0).toLocaleString(), icon: TrendingUp, color: 'var(--accent-violet)' },
        { label: 'Threats Blocked', value: (stats.threatsBlocked || 0).toLocaleString(), icon: Shield, color: 'var(--danger)' },
        { label: 'Active Monitors', value: (stats.activeMonitors || 0).toLocaleString(), icon: Eye, color: 'var(--success)' },
    ];

    const displayFeed = threatFeed.length > 0 ? [...threatFeed, ...threatFeed] : [];

    return (
        <div className="dashboard page-container">
            {/* Hero Section */}
            <section className="hero animate-in">
                <div className="hero-badge badge badge-cyan">
                    <Zap size={12} /> AI-Powered Detection
                </div>
                <h1 className="hero-title">
                    Detect Unsafe Websites
                    <br />
                    <span className="hero-title-accent">Before They Spread</span>
                </h1>
                <p className="hero-subtitle">
                    Infrastructure-level threat detection powered by digital fingerprinting,
                    behavioral analysis, and graph-based ecosystem mapping.
                </p>

                <form className="scan-form" onSubmit={handleAnalyze}>
                    <div className={`scan-input-wrapper ${isScanning ? 'scanning' : ''}`}>
                        <Globe size={20} className="scan-icon" />
                        <input
                            type="text"
                            className="scan-input"
                            placeholder="Enter website URL or domain to analyze..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            disabled={isScanning}
                        />
                        <button type="submit" className="btn-primary scan-btn" disabled={isScanning}>
                            {isScanning ? (
                                <>
                                    <Activity size={16} className="spin" /> Scanning...
                                </>
                            ) : (
                                <>
                                    <Search size={16} /> Analyze Website
                                </>
                            )}
                        </button>
                    </div>
                    {isScanning && (
                        <div className="scan-progress">
                            <div className="scan-progress-bar"></div>
                        </div>
                    )}
                </form>
            </section>

            {/* Stats */}
            <section className="stats-grid animate-in animate-in-delay-1">
                {statItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <div key={item.label} className="stat-card glass-card">
                            <div className="stat-icon" style={{ background: `${item.color}15`, color: item.color }}>
                                <Icon size={20} />
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">{item.value}</div>
                                <div className="stat-label">{item.label}</div>
                            </div>
                        </div>
                    );
                })}
            </section>

            {/* Live Threat Feed */}
            <section className="threat-feed-section animate-in animate-in-delay-2">
                <div className="section-header">
                    <div className="section-title-group">
                        <h2 className="section-title">
                            <Activity size={18} className="pulse-icon" />
                            Live Threat Feed
                        </h2>
                        <span className="live-badge">
                            <span className="live-dot"></span> LIVE
                        </span>
                    </div>
                </div>
                <div className="threat-feed glass-card" ref={feedRef}>
                    {displayFeed.map((item, i) => (
                        <div key={`${item.id}-${i}`} className="feed-item">
                            <div className="feed-time">{item.time}</div>
                            <div className="feed-domain">
                                <AlertTriangle size={14} style={{ color: categoryColors[item.category] || '#888' }} />
                                {item.domain}
                            </div>
                            <span
                                className="badge"
                                style={{
                                    background: `${(categoryColors[item.category] || '#888')}20`,
                                    color: categoryColors[item.category] || '#888',
                                    border: `1px solid ${(categoryColors[item.category] || '#888')}40`,
                                }}
                            >
                                {item.category}
                            </span>
                            <div className="feed-risk">
                                <div className="risk-bar-mini">
                                    <div
                                        className="risk-bar-mini-fill"
                                        style={{
                                            width: `${item.risk}%`,
                                            background: item.risk >= 85 ? 'var(--danger)' : 'var(--warning)',
                                        }}
                                    ></div>
                                </div>
                                <span>{item.risk}</span>
                            </div>
                            <span className={`feed-action ${item.action === 'Auto-blocked' ? 'blocked' : ''}`}>
                                {item.action}
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer tagline */}
            <div className="dashboard-footer animate-in animate-in-delay-3">
                <p className="footer-tagline">
                    QalqanAI does not chase websites. <span>It maps the infrastructure behind them.</span>
                </p>
            </div>
        </div>
    );
}
