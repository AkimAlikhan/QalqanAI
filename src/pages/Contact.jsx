import { Mail, Github, Linkedin, Send, MapPin, Clock, Shield } from 'lucide-react';
import { useState } from 'react';
import './Contact.css';

export default function Contact() {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 4000);
        setForm({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <div className="contact page-container">
            <div className="contact-hero animate-in">
                <h1 className="page-title">Get In Touch</h1>
                <p className="page-subtitle">
                    Have questions about QalqanAI? Want to partner with us? We'd love to hear from you.
                </p>
            </div>

            <div className="contact-grid animate-in animate-in-delay-1">
                {/* Contact Info */}
                <div className="contact-info">
                    <div className="info-card glass-card">
                        <div className="info-icon"><Mail size={20} /></div>
                        <div>
                            <h3>Email</h3>
                            <a href="mailto:team@qalqanai.com">team@qalqanai.com</a>
                        </div>
                    </div>
                    <div className="info-card glass-card">
                        <div className="info-icon"><Github size={20} /></div>
                        <div>
                            <h3>GitHub</h3>
                            <a href="https://github.com/AkimAlikhan/QalqanAI" target="_blank" rel="noreferrer">AkimAlikhan/QalqanAI</a>
                        </div>
                    </div>
                    <div className="info-card glass-card">
                        <div className="info-icon"><MapPin size={20} /></div>
                        <div>
                            <h3>Location</h3>
                            <p>Astana, Kazakhstan</p>
                        </div>
                    </div>
                    <div className="info-card glass-card">
                        <div className="info-icon"><Clock size={20} /></div>
                        <div>
                            <h3>Response Time</h3>
                            <p>Within 24 hours</p>
                        </div>
                    </div>

                    {/* Team */}
                    <div className="team-card glass-card">
                        <h3 className="team-title"><Shield size={16} /> Core Team</h3>
                        <div className="team-member">
                            <div className="member-avatar">AA</div>
                            <div>
                                <h4>Akim Alikhan</h4>
                                <p>Founder & Lead Developer</p>
                                <div className="member-links">
                                    <a href="https://github.com/AkimAlikhan" target="_blank" rel="noreferrer"><Github size={14} /></a>
                                    <a href="https://linkedin.com/in/akimalikhan" target="_blank" rel="noreferrer"><Linkedin size={14} /></a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="contact-form-card glass-card">
                    <h2 className="form-title">Send a Message</h2>
                    {submitted ? (
                        <div className="form-success animate-in">
                            <Send size={32} style={{ color: 'var(--success)' }} />
                            <h3>Message Sent!</h3>
                            <p>We'll get back to you within 24 hours.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Name</label>
                                    <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" required />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Subject</label>
                                <input type="text" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="What's this about?" required />
                            </div>
                            <div className="form-group">
                                <label>Message</label>
                                <textarea rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Tell us more..." required />
                            </div>
                            <button type="submit" className="btn-primary submit-btn">
                                <Send size={16} /> Send Message
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
