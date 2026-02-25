import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Search, Diamond } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handler);
        return () => window.removeEventListener('scroll', handler);
    }, []);

    const closeMobile = () => setMobileOpen(false);

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="navbar-inner">
                <NavLink to="/" className="navbar-logo" onClick={closeMobile}>
                    <span className="logo-icon">◈</span>
                    <span className="logo-text">QalqanAI</span>
                </NavLink>

                <div className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
                    <NavLink to="/" className="nav-link" onClick={closeMobile}>Dashboard</NavLink>
                    <NavLink to="/ecosystem" className="nav-link" onClick={closeMobile}>Ecosystem</NavLink>
                    <NavLink to="/blocklist" className="nav-link" onClick={closeMobile}>Blocklist</NavLink>
                    <NavLink to="/how-it-works" className="nav-link" onClick={closeMobile}>How It Works</NavLink>
                    <NavLink to="/contact" className="nav-link" onClick={closeMobile}>Contact</NavLink>
                </div>

                <div className="navbar-actions">
                    <button className="nav-cta" onClick={() => navigate('/')}>
                        <Search size={14} /> Scan URL
                    </button>
                    <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
                        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>
        </nav>
    );
}
