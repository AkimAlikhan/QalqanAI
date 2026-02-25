import { Mail, Github, Linkedin, Send, MapPin, Clock, Shield } from 'lucide-react';
import { useState } from 'react';
import { useLang } from '../i18n/LanguageContext';
import './Contact.css';

export default function Contact() {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [submitted, setSubmitted] = useState(false);
    const { t } = useLang();

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 4000);
        setForm({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <div className="contact page-container">
            <div className="contact-hero animate-in">
                <h1 className="page-title">{t('contact.title')}</h1>
                <p className="page-subtitle">
                    {t('contact.subtitle')}
                </p>
            </div>

            <div className="contact-grid animate-in animate-in-delay-1">
                {/* Contact Info */}
                <div className="contact-info">
                    <div className="info-card glass-card">
                        <div className="info-icon"><Mail size={20} /></div>
                        <div>
                            <h3>{t('contact.email')}</h3>
                            <a href="mailto:team@qalqanai.com">team@qalqanai.com</a>
                        </div>
                    </div>
                    <div className="info-card glass-card">
                        <div className="info-icon"><Github size={20} /></div>
                        <div>
                            <h3>{t('contact.github')}</h3>
                            <a href="https://github.com/AkimAlikhan/QalqanAI" target="_blank" rel="noreferrer">AkimAlikhan/QalqanAI</a>
                        </div>
                    </div>
                    <div className="info-card glass-card">
                        <div className="info-icon"><MapPin size={20} /></div>
                        <div>
                            <h3>{t('contact.location')}</h3>
                            <p>{t('contact.locationValue')}</p>
                        </div>
                    </div>
                    <div className="info-card glass-card">
                        <div className="info-icon"><Clock size={20} /></div>
                        <div>
                            <h3>{t('contact.responseTime')}</h3>
                            <p>{t('contact.responseTimeValue')}</p>
                        </div>
                    </div>

                    {/* Team */}
                    <div className="team-card glass-card">
                        <h3 className="team-title"><Shield size={16} /> {t('contact.coreTeam')}</h3>
                        {t('contact.team').map((member, i) => (
                            <div key={i} className="team-member">
                                <div className="member-avatar">{member.initials}</div>
                                <div>
                                    <h4>{member.name}</h4>
                                    <p>{member.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact Form */}
                <div className="contact-form-card glass-card">
                    <h2 className="form-title">{t('contact.sendMessage')}</h2>
                    {submitted ? (
                        <div className="form-success animate-in">
                            <Send size={32} style={{ color: 'var(--success)' }} />
                            <h3>{t('contact.messageSent')}</h3>
                            <p>{t('contact.messageReply')}</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>{t('contact.name')}</label>
                                    <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={t('contact.namePlaceholder')} required />
                                </div>
                                <div className="form-group">
                                    <label>{t('contact.emailLabel')}</label>
                                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder={t('contact.emailPlaceholder')} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>{t('contact.subject')}</label>
                                <input type="text" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder={t('contact.subjectPlaceholder')} required />
                            </div>
                            <div className="form-group">
                                <label>{t('contact.message')}</label>
                                <textarea rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder={t('contact.messagePlaceholder')} required />
                            </div>
                            <button type="submit" className="btn-primary submit-btn">
                                <Send size={16} /> {t('contact.send')}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
