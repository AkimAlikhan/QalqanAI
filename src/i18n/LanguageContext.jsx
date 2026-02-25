import { createContext, useContext, useState, useEffect } from 'react';
import translations from './translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [lang, setLang] = useState(() => {
        return localStorage.getItem('qalqanai-lang') || 'en';
    });

    useEffect(() => {
        localStorage.setItem('qalqanai-lang', lang);
        document.documentElement.lang = lang;
    }, [lang]);

    const t = (path) => {
        const keys = path.split('.');
        let val = translations[lang];
        for (const k of keys) {
            val = val?.[k];
        }
        return val ?? path;
    };

    const toggleLang = () => setLang(l => l === 'en' ? 'ru' : 'en');

    return (
        <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLang() {
    return useContext(LanguageContext);
}
