import { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Shield, ChevronDown, Search, Menu, X } from 'lucide-react';
import './Navbar.css';

const navItems = [
    {
        label: 'Products',
        children: [
            { label: 'URL Analyzer', desc: 'Deep-scan any website for threats', path: '/analysis' },
            { label: 'Ecosystem Map', desc: 'Visualize criminal infrastructure', path: '/ecosystem' },
            { label: 'Blocklist', desc: 'AI-classified threat database', path: '/blocklist' },
        ],
    },
    {
        label: 'Technology',
        children: [
            { label: 'How It Works', desc: 'Our AI detection pipeline', path: '/how-it-works' },
            { label: 'Digital DNA', desc: 'Infrastructure fingerprinting', path: '/how-it-works' },
            { label: 'Graph Engine', desc: 'Ecosystem cluster detection', path: '/ecosystem' },
        ],
    },
    {
        label: 'Company',
        children: [
            { label: 'About Us', desc: 'Our mission and vision', path: '/how-it-works' },
            { label: 'Contact', desc: 'Get in touch with our team', path: '/' },
            { label: 'Blog', desc: 'Latest news and updates', path: '/' },
        ],
    },
    { label: 'Pricing', path: '/' },
];

export default function Navbar() {
    const [openDropdown, setOpenDropdown] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Close dropdown on route change
    useEffect(() => {
        setOpenDropdown(null);
        setMobileOpen(false);
    }, [location]);

    // Scroll detection
    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handler);
        return () => window.removeEventListener('scroll', handler);
    }, []);

    const handleDropdownToggle = (label) => {
        setOpenDropdown(openDropdown === label ? null : label);
    };

    return (
        <header className={`navbar ${scrolled ? 'scrolled' : ''}`} ref={dropdownRef}>
            <div className="navbar-inner">
                {/* Logo */}
                <NavLink to="/" className="navbar-logo">
                    <div className="logo-shield">
                        <Shield size={20} />
                    </div>
                    <span className="logo-text">QalqanAI</span>
                </NavLink>

                {/* Desktop Nav */}
                <nav className="navbar-links">
                    {navItems.map((item) => (
                        <div key={item.label} className="nav-dropdown-wrapper">
                            {item.children ? (
                                <button
                                    className={`nav-link ${openDropdown === item.label ? 'active' : ''}`}
                                    onClick={() => handleDropdownToggle(item.label)}
                                >
                                    {item.label}
                                    <ChevronDown size={14} className={`chevron ${openDropdown === item.label ? 'open' : ''}`} />
                                </button>
                            ) : (
                                <NavLink to={item.path} className="nav-link">
                                    {item.label}
                                </NavLink>
                            )}

                            {/* Dropdown */}
                            {item.children && openDropdown === item.label && (
                                <div className="dropdown-panel">
                                    <div className="dropdown-content">
                                        {item.children.map((child) => (
                                            <NavLink
                                                key={child.label}
                                                to={child.path}
                                                className="dropdown-item"
                                                onClick={() => setOpenDropdown(null)}
                                            >
                                                <div className="dropdown-item-label">{child.label}</div>
                                                <div className="dropdown-item-desc">{child.desc}</div>
                                            </NavLink>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </nav>

                {/* Right */}
                <div className="navbar-actions">
                    <button className="btn-outline nav-cta" onClick={() => navigate('/analysis')}>
                        <Search size={14} />
                        Analyze URL
                    </button>
                </div>

                {/* Mobile toggle */}
                <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
                    {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="mobile-menu">
                    {navItems.map((item) => (
                        <div key={item.label}>
                            {item.children ? (
                                <>
                                    <div className="mobile-section-label">{item.label}</div>
                                    {item.children.map((child) => (
                                        <NavLink key={child.label} to={child.path} className="mobile-link" onClick={() => setMobileOpen(false)}>
                                            {child.label}
                                        </NavLink>
                                    ))}
                                </>
                            ) : (
                                <NavLink to={item.path} className="mobile-link" onClick={() => setMobileOpen(false)}>
                                    {item.label}
                                </NavLink>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </header>
    );
}
