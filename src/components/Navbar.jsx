import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Search } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext';
import './Navbar.css';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();
    const { lang, setLang, t } = useLang();

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
                    <img src={`${import.meta.env.BASE_URL}team-logo.png`} alt="Team Logo" className="logo-team" />
                    <span className="logo-divider">|</span>
                    <img src={`${import.meta.env.BASE_URL}qalqan-logo.png`} alt="QalqanAI" className="logo-qalqan" />
                </NavLink>

                <div className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
                    <NavLink to="/" className="nav-link" onClick={closeMobile}>{t('nav.dashboard')}</NavLink>
                    <NavLink to="/deep-analyze" className="nav-link" onClick={closeMobile}>{t('nav.deepAnalyze')}</NavLink>
                    <NavLink to="/ecosystem" className="nav-link" onClick={closeMobile}>{t('nav.ecosystem')}</NavLink>
                    <NavLink to="/blocklist" className="nav-link" onClick={closeMobile}>{t('nav.blocklist')}</NavLink>
                    <NavLink to="/how-it-works" className="nav-link" onClick={closeMobile}>{t('nav.howItWorks')}</NavLink>
                    <NavLink to="/contact" className="nav-link" onClick={closeMobile}>{t('nav.contact')}</NavLink>
                </div>

                <div className="navbar-actions">
                    <div className="lang-switcher">
                        <button
                            className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
                            onClick={() => setLang('en')}
                        >
                            EN
                        </button>
                        <span className="lang-divider">/</span>
                        <button
                            className={`lang-btn ${lang === 'ru' ? 'active' : ''}`}
                            onClick={() => setLang('ru')}
                        >
                            RU
                        </button>
                    </div>
                    <button className="nav-cta" onClick={() => navigate('/')}>
                        <Search size={14} /> {t('nav.scanUrl')}
                    </button>
                    <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
                        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>
        </nav>
    );
}
