import { useState, useMemo, useEffect } from 'react';
import {
    Search,
    Download,
    Filter,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    FileText,
} from 'lucide-react';
import { getBlocklist } from '../ai/analyze';
import { useLang } from '../i18n/LanguageContext';
import './Blocklist.css';

const categoryColors = {
    Casino: '#ff6b81',
    Scam: '#ffa502',
    Phishing: '#ff4757',
    Pyramid: '#a855f7',
    Unknown: '#888',
};

export default function Blocklist() {
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [tierFilter, setTierFilter] = useState('All');
    const [sortField, setSortField] = useState('risk');
    const [sortDir, setSortDir] = useState('desc');
    const [blocklistData, setBlocklistData] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t } = useLang();

    useEffect(() => {
        try {
            const items = getBlocklist().map((item, i) => ({
                id: i + 1,
                ...item,
            }));
            setBlocklistData(items);
        } catch (e) {
            setBlocklistData([]);
        }
        setLoading(false);
    }, []);

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDir('desc');
        }
    };

    const SortIcon = ({ field }) => {
        if (sortField !== field) return null;
        return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
    };

    const filtered = useMemo(() => {
        let items = [...blocklistData];
        if (search) {
            const q = search.toLowerCase();
            items = items.filter(i => i.domain.toLowerCase().includes(q) || (i.cluster || '').toLowerCase().includes(q));
        }
        if (categoryFilter !== 'All') {
            items = items.filter(i => i.category === categoryFilter);
        }
        if (tierFilter !== 'All') {
            items = items.filter(i => i.tier === tierFilter);
        }
        items.sort((a, b) => {
            let va = a[sortField], vb = b[sortField];
            if (typeof va === 'string') va = va.toLowerCase();
            if (typeof vb === 'string') vb = vb.toLowerCase();
            if (va < vb) return sortDir === 'asc' ? -1 : 1;
            if (va > vb) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
        return items;
    }, [blocklistData, search, categoryFilter, tierFilter, sortField, sortDir]);

    const exportData = (format) => {
        let content, filename, type;
        if (format === 'csv') {
            const headers = 'Domain,Category,Risk,Tier,Status,Detected,Cluster,Markers\n';
            const rows = filtered.map(i => `${i.domain},${i.category},${i.risk},${i.tier},${i.status},${i.detectedDate},${i.cluster},${i.markers}`).join('\n');
            content = headers + rows;
            filename = 'qalqanai-blocklist.csv';
            type = 'text/csv';
        } else {
            content = JSON.stringify(filtered, null, 2);
            filename = 'qalqanai-blocklist.json';
            type = 'application/json';
        }
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const categories = ['All', ...new Set(blocklistData.map(i => i.category))];

    if (loading) {
        return (
            <div className="blocklist page-container">
                <h1 className="page-title">{t('blocklist.title')}</h1>
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>{t('blocklist.loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="blocklist page-container">
            <div className="blocklist-header animate-in">
                <div>
                    <h1 className="page-title">{t('blocklist.title')}</h1>
                    <p className="page-subtitle">
                        <FileText size={14} /> {filtered.length} {t('blocklist.of')} {blocklistData.length} {t('blocklist.subtitle')}
                    </p>
                </div>
                <div className="export-buttons">
                    <button className="btn-secondary" onClick={() => exportData('csv')}>
                        <Download size={14} /> {t('blocklist.exportCSV')}
                    </button>
                    <button className="btn-secondary" onClick={() => exportData('json')}>
                        <Download size={14} /> {t('blocklist.exportJSON')}
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="filter-bar glass-card animate-in animate-in-delay-1">
                <div className="search-wrapper">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder={t('blocklist.searchPlaceholder')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <Filter size={14} />
                    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select value={tierFilter} onChange={(e) => setTierFilter(e.target.value)}>
                        <option value="All">{t('blocklist.allTiers')}</option>
                        <option value="A">Tier A</option>
                        <option value="B">Tier B</option>
                        <option value="C">Tier C</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="blocklist-table-wrapper glass-card animate-in animate-in-delay-2">
                <table className="blocklist-table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('domain')}>{t('blocklist.domain')} <SortIcon field="domain" /></th>
                            <th onClick={() => handleSort('category')}>{t('blocklist.category')} <SortIcon field="category" /></th>
                            <th onClick={() => handleSort('risk')}>{t('blocklist.risk')} <SortIcon field="risk" /></th>
                            <th onClick={() => handleSort('tier')}>{t('blocklist.tier')} <SortIcon field="tier" /></th>
                            <th onClick={() => handleSort('status')}>{t('blocklist.status')} <SortIcon field="status" /></th>
                            <th onClick={() => handleSort('detectedDate')}>{t('blocklist.detected')} <SortIcon field="detectedDate" /></th>
                            <th>{t('blocklist.cluster')}</th>
                            <th>{t('blocklist.markers')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((item) => (
                            <tr key={item.id}>
                                <td className="td-domain">
                                    <AlertTriangle size={12} style={{ color: categoryColors[item.category] || '#888' }} />
                                    {item.domain}
                                </td>
                                <td>
                                    <span className="badge" style={{
                                        background: `${(categoryColors[item.category] || '#888')}20`,
                                        color: categoryColors[item.category] || '#888',
                                        border: `1px solid ${(categoryColors[item.category] || '#888')}40`,
                                    }}>
                                        {item.category}
                                    </span>
                                </td>
                                <td>
                                    <div className="risk-cell">
                                        <div className="risk-bar">
                                            <div
                                                className="risk-bar-fill"
                                                style={{
                                                    width: `${item.risk}%`,
                                                    background: item.risk >= 80 ? 'var(--danger)' : item.risk >= 50 ? 'var(--warning)' : 'var(--success)',
                                                }}
                                            ></div>
                                        </div>
                                        <span>{item.risk}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className={`tier-badge tier-${item.tier.toLowerCase()}`}>{item.tier}</span>
                                </td>
                                <td>
                                    <span className={`status-label status-${item.status.toLowerCase().replace(/\s/g, '-')}`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="td-date">{item.detectedDate}</td>
                                <td className="td-cluster">{item.cluster}</td>
                                <td className="td-markers">{item.markers}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Disclaimer */}
            <div className="blocklist-disclaimer animate-in animate-in-delay-3">
                <AlertTriangle size={14} />
                <p>
                    {t('blocklist.disclaimer')}
                </p>
            </div>
        </div>
    );
}
