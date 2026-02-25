import { Calendar, Tag, ArrowRight, Sparkles, Shield, Paintbrush, Cpu, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Blog.css';

const blogPosts = [
    {
        id: 1,
        title: 'QalqanAI 2.0: Complete Website Redesign',
        date: '2026-02-25',
        tags: ['Design', 'Update'],
        icon: Paintbrush,
        color: 'var(--accent-violet)',
        excerpt: 'We\'ve completely redesigned QalqanAI with a new light theme, top navigation bar, animated milky way background, and floating AI chat assistant. The new design features Playfair Display serif headings, glassmorphism cards, and smooth micro-animations for a premium feel.',
        content: [
            'Replaced dark cyberpunk theme with a clean, white Speakeasy-inspired design',
            'Sidebar navigation → top horizontal navbar with dropdown menus',
            'Added scroll-responsive milky way galaxy animation on canvas',
            'Integrated floating Analyst Copilot chat for interactive analysis',
            'All 5+ pages redesigned with serif headings and minimal aesthetics',
        ],
    },
    {
        id: 2,
        title: 'Real-World Domain Validation with DNS-over-HTTPS',
        date: '2026-02-25',
        tags: ['AI Engine', 'Feature'],
        icon: Globe,
        color: 'var(--accent-cyan)',
        excerpt: 'QalqanAI now validates domain existence using Cloudflare\'s DNS-over-HTTPS API before scanning. Non-existent domains return clear NXDOMAIN errors instead of misleading analysis results. This ensures every scan is meaningful.',
        content: [
            'Added DNS-over-HTTPS validation via Cloudflare (cloudflare-dns.com)',
            'Non-existent domains now return "Domain Not Found" with NXDOMAIN explanation',
            'Threat feed now shows only real, verified domains from around the world',
            'Seed database expanded from 10 to 21 real-world malicious domains globally',
        ],
    },
    {
        id: 3,
        title: 'Detailed Threat Evidence: See Exactly Where Threats Were Found',
        date: '2026-02-25',
        tags: ['AI Engine', 'Security'],
        icon: Shield,
        color: 'var(--danger)',
        excerpt: 'Every risk rule now includes a detailed evidence location explaining WHERE the threat was detected — in the domain name, TLS certificate, WHOIS data, HTTP headers, or page source. Click any risk finding to expand and see the exact evidence.',
        content: [
            'Each of 20+ risk rules now includes an "evidence" field with exact source location',
            'Evidence shows: string positions in domain names, TLS certificate details, WHOIS data',
            'Expandable evidence panels on the Analysis page — click any finding to learn more',
            'WHOIS-style operator info now displayed: registrar, creation date, registrant country',
        ],
    },
    {
        id: 4,
        title: 'Client-Side AI Engine: Full Security Analysis Without a Server',
        date: '2026-02-24',
        tags: ['AI Engine', 'Architecture'],
        icon: Cpu,
        color: '#ff8c42',
        excerpt: 'QalqanAI runs entirely client-side using deterministic heuristic analysis, graph-based clustering, and keyword pattern matching — no backend server required. This enables free static hosting on GitHub Pages while maintaining powerful detection capabilities.',
        content: [
            'Feature extraction: domain analysis, TLS fingerprinting, tracker detection',
            'Risk scoring: 20+ weighted rules producing transparent 0-100 scores',
            'Graph engine: ecosystem clustering, risk propagation, shared infrastructure detection',
            'Explainable AI: every score comes with human-readable justification',
        ],
    },
    {
        id: 5,
        title: 'New Pages: Contact, Blog & Pricing',
        date: '2026-02-25',
        tags: ['Feature', 'Update'],
        icon: Sparkles,
        color: 'var(--success)',
        excerpt: 'We\'ve added three new pages: a Contact page with team information and a contact form, this Blog documenting our changes, and a Pricing page explaining our free and Pro tiers.',
        content: [
            'Contact page: team info, location, GitHub/LinkedIn links, contact form',
            'Blog page: documenting all recent project changes and architectural decisions',
            'Pricing page: transparent free vs Pro comparison with real feature benefits',
        ],
    },
];

export default function Blog() {
    return (
        <div className="blog page-container">
            <div className="blog-hero animate-in">
                <h1 className="page-title">Blog & Updates</h1>
                <p className="page-subtitle">
                    Engineering notes, feature announcements, and project updates from the QalqanAI team
                </p>
            </div>

            <div className="blog-grid">
                {blogPosts.map((post, idx) => {
                    const Icon = post.icon;
                    return (
                        <article key={post.id} className={`blog-card glass-card animate-in animate-in-delay-${Math.min(idx + 1, 4)}`}>
                            <div className="blog-card-header">
                                <div className="blog-icon" style={{ color: post.color, background: `${post.color}12` }}>
                                    <Icon size={22} />
                                </div>
                                <div className="blog-meta">
                                    <span className="blog-date"><Calendar size={12} /> {post.date}</span>
                                    <div className="blog-tags">
                                        {post.tags.map(t => (
                                            <span key={t} className="blog-tag"><Tag size={10} /> {t}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <h2 className="blog-title">{post.title}</h2>
                            <p className="blog-excerpt">{post.excerpt}</p>
                            <ul className="blog-changes">
                                {post.content.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </article>
                    );
                })}
            </div>
        </div>
    );
}
