import { useState, useRef, useCallback } from 'react';
import {
    Search,
    Shield,
    AlertTriangle,
    Globe,
    Activity,
    Eye,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Zap,
    Target,
    Server,
} from 'lucide-react';
import { deepScan, generateVariants } from '../ai/typosquatEngine';
import './DeepAnalyze.css';

const RISK_COLOR = (risk) => {
    if (risk >= 80) return 'var(--danger)';
    if (risk >= 60) return 'var(--warning)';
    return 'var(--success)';
};

const STRATEGY_ICONS = {
    'Homoglyph': '🔤',
    'Double homoglyph': '🔤🔤',
    'Omission': '✂️',
    'Keyboard typo': '⌨️',
    'Transposition': '🔀',
    'Duplication': '📋',
    'Hyphen insertion': '➖',
    'TLD swap': '🌐',
    'Prefix/Suffix': '🏷️',
    'Vowel swap': '🔠',
    'Homoglyph + TLD': '🔤🌐',
    'Typo + TLD': '⌨️🌐',
    'Omission + TLD': '✂️🌐',
    'Duplication + TLD': '📋🌐',
    'Transposition + TLD': '🔀🌐',
    'Vowel + TLD': '🔠🌐',
};

export default function DeepAnalyze() {
    const [url, setUrl] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [progress, setProgress] = useState({ checked: 0, total: 0 });
    const [results, setResults] = useState([]);
    const [hasScanned, setHasScanned] = useState(false);
    const [sortBy, setSortBy] = useState('risk'); // 'risk' | 'domain' | 'strategy'
    const [sortDir, setSortDir] = useState('desc');
    const [filterStrategy, setFilterStrategy] = useState('all');
    const abortRef = useRef(null);

    const handleScan = useCallback(async (e) => {
        e.preventDefault();
        const domain = url.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
        if (!domain || !domain.includes('.')) return;

        setIsScanning(true);
        setResults([]);
        setProgress({ checked: 0, total: 0 });
        setHasScanned(true);

        const controller = new AbortController();
        abortRef.current = controller;

        // Pre-calculate total
        const variants = generateVariants(domain, 10000);
        setProgress({ checked: 0, total: variants.length });

        try {
            await deepScan(domain, {
                onProgress: (checked, total) => {
                    setProgress({ checked, total });
                },
                onFound: (result) => {
                    setResults(prev => [...prev, result]);
                },
                onComplete: () => {
                    setIsScanning(false);
                },
            }, controller.signal);
        } catch {
            setIsScanning(false);
        }
    }, [url]);

    const handleStop = () => {
        abortRef.current?.abort();
        setIsScanning(false);
    };

    // Sort and filter
    const filtered = filterStrategy === 'all'
        ? results
        : results.filter(r => r.strategy === filterStrategy);

    const sorted = [...filtered].sort((a, b) => {
        const dir = sortDir === 'asc' ? 1 : -1;
        if (sortBy === 'risk') return (b.risk - a.risk) * dir;
        if (sortBy === 'domain') return a.domain.localeCompare(b.domain) * dir;
        if (sortBy === 'strategy') return a.strategy.localeCompare(b.strategy) * dir;
        return 0;
    });

    const toggleSort = (field) => {
        if (sortBy === field) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortDir('desc');
        }
    };

    // Unique strategies for filter dropdown
    const strategies = [...new Set(results.map(r => r.strategy))];

    const pct = progress.total > 0 ? (progress.checked / progress.total * 100).toFixed(1) : 0;
    const dangerCount = results.filter(r => r.risk >= 80).length;
    const warningCount = results.filter(r => r.risk >= 60 && r.risk < 80).length;

    return (
        <div className="deep-analyze page-container">
            {/* Header */}
            <header className="da-header animate-in">
                <div>
                    <h1 className="page-title">Deep Analyze</h1>
                    <p className="page-subtitle">
                        <Target size={14} />
                        Typosquatting & homoglyph scanner — find malicious clones of any domain
                    </p>
                </div>
            </header>

            {/* Search */}
            <section className="da-search animate-in animate-in-delay-1">
                <form className="da-form" onSubmit={handleScan}>
                    <div className="da-input-wrapper glass-card">
                        <Globe size={18} className="da-input-icon" />
                        <input
                            type="text"
                            className="da-input"
                            placeholder="Enter domain to scan (e.g. google.com, paypal.com)"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            disabled={isScanning}
                        />
                        {isScanning ? (
                            <button type="button" className="da-stop-btn" onClick={handleStop}>
                                <Activity size={16} className="spin" /> Stop
                            </button>
                        ) : (
                            <button type="submit" className="btn-primary da-scan-btn" disabled={!url.trim()}>
                                <Zap size={16} /> Deep Scan
                            </button>
                        )}
                    </div>
                </form>

                <div className="da-info-chips">
                    <span className="da-chip">
                        <Search size={12} /> Checks up to 10,000 domain variants
                    </span>
                    <span className="da-chip">
                        <Shield size={12} /> Real DNS verification via Cloudflare
                    </span>
                    <span className="da-chip">
                        <Eye size={12} /> Homoglyphs, typos, TLD swaps & more
                    </span>
                </div>
            </section>

            {/* Progress */}
            {(isScanning || hasScanned) && (
                <section className="da-progress animate-in animate-in-delay-2">
                    <div className="da-progress-bar-wrapper glass-card">
                        <div className="da-progress-header">
                            <div className="da-progress-stats">
                                <span className="da-progress-label">
                                    {isScanning ? 'Scanning...' : 'Scan Complete'}
                                </span>
                                <span className="da-progress-count">
                                    {progress.checked.toLocaleString()} / {progress.total.toLocaleString()} variants
                                </span>
                            </div>
                            <span className="da-progress-pct">{pct}%</span>
                        </div>
                        <div className="da-progress-track">
                            <div
                                className={`da-progress-fill ${isScanning ? 'scanning' : ''}`}
                                style={{ width: `${pct}%` }}
                            />
                        </div>

                        {/* Summary badges */}
                        <div className="da-summary-row">
                            <div className="da-summary-badge">
                                <Globe size={14} />
                                <span className="da-summary-value">{results.length}</span>
                                <span className="da-summary-label">Found Alive</span>
                            </div>
                            <div className="da-summary-badge danger">
                                <AlertTriangle size={14} />
                                <span className="da-summary-value">{dangerCount}</span>
                                <span className="da-summary-label">High Risk</span>
                            </div>
                            <div className="da-summary-badge warning">
                                <Shield size={14} />
                                <span className="da-summary-value">{warningCount}</span>
                                <span className="da-summary-label">Medium Risk</span>
                            </div>
                            <div className="da-summary-badge safe">
                                <Eye size={14} />
                                <span className="da-summary-value">{results.length - dangerCount - warningCount}</span>
                                <span className="da-summary-label">Low Risk</span>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Results */}
            {results.length > 0 && (
                <section className="da-results animate-in animate-in-delay-3">
                    <div className="da-results-header">
                        <h2 className="da-results-title">
                            <AlertTriangle size={20} />
                            Found Domains ({filtered.length})
                        </h2>
                        <div className="da-results-filters">
                            <select
                                className="da-filter-select"
                                value={filterStrategy}
                                onChange={(e) => setFilterStrategy(e.target.value)}
                            >
                                <option value="all">All Strategies</option>
                                {strategies.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="da-results-table-wrapper glass-card">
                        <table className="da-results-table">
                            <thead>
                                <tr>
                                    <th onClick={() => toggleSort('domain')}>
                                        Domain {sortBy === 'domain' && (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                                    </th>
                                    <th onClick={() => toggleSort('strategy')}>
                                        Strategy {sortBy === 'strategy' && (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                                    </th>
                                    <th onClick={() => toggleSort('risk')}>
                                        Risk {sortBy === 'risk' && (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                                    </th>
                                    <th>IP</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {sorted.map((r, i) => (
                                    <tr key={r.domain + i} className="da-result-row">
                                        <td className="da-cell-domain">
                                            <span className="da-domain-text">{r.domain}</span>
                                        </td>
                                        <td className="da-cell-strategy">
                                            <span className="da-strategy-badge">
                                                {STRATEGY_ICONS[r.strategy] || '🔍'} {r.strategy}
                                            </span>
                                        </td>
                                        <td className="da-cell-risk">
                                            <div className="da-risk-indicator">
                                                <span className="da-risk-value" style={{ color: RISK_COLOR(r.risk) }}>
                                                    {r.risk}
                                                </span>
                                                <div className="da-risk-bar">
                                                    <div
                                                        className="da-risk-bar-fill"
                                                        style={{
                                                            width: `${r.risk}%`,
                                                            background: RISK_COLOR(r.risk),
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="da-cell-ip">
                                            <span className="da-ip-text">
                                                <Server size={12} /> {r.ip}
                                            </span>
                                        </td>
                                        <td className="da-cell-action">
                                            <a
                                                href={`#/analysis?url=${encodeURIComponent(r.domain)}`}
                                                className="da-analyze-link"
                                                title="Analyze this domain"
                                            >
                                                <ExternalLink size={14} />
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {/* Empty state */}
            {hasScanned && !isScanning && results.length === 0 && (
                <div className="da-empty animate-in">
                    <Shield size={48} />
                    <h3>No clones found</h3>
                    <p>None of the generated domain variants resolved to an active IP address. This domain appears clean.</p>
                </div>
            )}
        </div>
    );
}
