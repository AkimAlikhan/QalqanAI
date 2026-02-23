import { NavLink, useLocation } from 'react-router-dom';
import {
    Shield,
    LayoutDashboard,
    ScanSearch,
    Network,
    BookOpen,
    FileText,
    ChevronRight,
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/analysis', label: 'Analysis', icon: ScanSearch },
    { path: '/ecosystem', label: 'Ecosystem', icon: Network },
    { path: '/how-it-works', label: 'How It Works', icon: BookOpen },
    { path: '/blocklist', label: 'Blocklist', icon: FileText },
];

export default function Sidebar() {
    const location = useLocation();

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="logo-icon">
                        <Shield size={24} />
                    </div>
                    <div className="logo-text">
                        <span className="logo-name">QalqanAI</span>
                        <span className="logo-tagline">Threat Intelligence</span>
                    </div>
                </div>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-label">Main Menu</div>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${isActive ? 'active' : ''}`}
                        >
                            <Icon size={18} />
                            <span className="nav-item-label">{item.label}</span>
                            {isActive && <ChevronRight size={14} className="nav-arrow" />}
                        </NavLink>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <div className="status-indicator">
                    <span className="status-dot"></span>
                    <span className="status-text">System Operational</span>
                </div>
                <div className="version-text">v2.4.1 — Build 2026.02</div>
            </div>
        </aside>
    );
}
