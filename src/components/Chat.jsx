import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { analyzeWebsite } from '../ai/analyze';
import './Chat.css';

const SYSTEM_GREETING = {
    role: 'assistant',
    content: "Hello! I'm QalqanAI's Analyst Copilot. I can help you:\n\n• Analyze any website for threats\n• Explain risk decisions\n• Investigate infrastructure clusters\n• Generate evidence summaries\n\nTry asking me: **\"Analyze lucky-spin-777.bet\"** or **\"Why is this site risky?\"**",
};

export default function Chat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([SYSTEM_GREETING]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [lastAnalysis, setLastAnalysis] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const generateResponse = async (userMessage) => {
        const lower = userMessage.toLowerCase().trim();

        // Analyze URL command
        const analyzeMatch = lower.match(/(?:analyze|scan|check)\s+(.+)/);
        if (analyzeMatch) {
            const url = analyzeMatch[1].replace(/['"]/g, '').trim();
            try {
                const result = await analyzeWebsite(url);
                setLastAnalysis(result);

                const riskEmoji = result.risk_score >= 80 ? '🔴' : result.risk_score >= 50 ? '🟡' : '🟢';
                const explanationList = result.explanations.length > 0
                    ? result.explanations.slice(0, 5).map(e => `  • **+${e.weight}** ${e.label}`).join('\n')
                    : '  • No risk indicators detected';

                return `## ${riskEmoji} Analysis: ${result.url}\n\n**Risk Score:** ${result.risk_score}/100\n**Category:** ${result.category}\n**Confidence:** ${Math.round(result.confidence * 100)}%\n**Status:** ${result.status}\n\n### Key Findings:\n${explanationList}\n\n**Hosting:** ${result.hosting.provider} (${result.hosting.country})\n**TLS:** ${result.tls.issuer}${result.tls.selfSigned ? ' ⚠️ Self-signed' : ''}\n${result.cluster_id ? `**Cluster:** ${result.cluster_id}` : ''}\n\nAsk me to explain any finding or investigate further.`;
            } catch (err) {
                return `I couldn't analyze that URL. Please provide a valid domain like \`example.com\`.`;
            }
        }

        // Explanation queries
        if (lower.includes('why') && (lower.includes('risky') || lower.includes('unsafe') || lower.includes('dangerous'))) {
            if (lastAnalysis) {
                const top = lastAnalysis.explanations.slice(0, 3);
                if (top.length === 0) return `Based on my analysis, **${lastAnalysis.url}** shows no significant risk indicators. It appears to be safe.`;
                return `**${lastAnalysis.url}** scored **${lastAnalysis.risk_score}/100** because:\n\n${top.map((e, i) => `${i + 1}. **${e.label}** (+${e.weight} risk points, ${e.type})`).join('\n')}\n\nThese signals combined indicate a **${lastAnalysis.category}** operation.`;
            }
            return 'Please analyze a URL first so I can explain the findings. Try: **"Analyze example.com"**';
        }

        // Related domains
        if (lower.includes('related') || lower.includes('cluster') || lower.includes('connected')) {
            if (lastAnalysis && lastAnalysis.cluster_id) {
                return `**${lastAnalysis.url}** belongs to cluster **${lastAnalysis.cluster_id}**.\n\nThis means it shares infrastructure markers (IPs, trackers, wallets, or certificates) with other detected websites.\n\nVisit the **Ecosystem** page to see the full graph visualization.`;
            }
            return 'Analyze a URL first to discover cluster relationships.';
        }

        // Block recommendation
        if (lower.includes('block') || lower.includes('should')) {
            if (lastAnalysis) {
                if (lastAnalysis.risk_score >= 80) return `**Recommendation: BLOCK** ⛔\n\n${lastAnalysis.url} (risk ${lastAnalysis.risk_score}) qualifies for Tier A auto-blocking. ${lastAnalysis.explanations.length} risk signals detected.`;
                if (lastAnalysis.risk_score >= 50) return `**Recommendation: REVIEW** ⚠️\n\n${lastAnalysis.url} (risk ${lastAnalysis.risk_score}) falls into Tier B — requires human analyst review before enforcement.`;
                return `**Recommendation: MONITOR** ✅\n\n${lastAnalysis.url} (risk ${lastAnalysis.risk_score}) is currently classified as low-risk. Continue monitoring.`;
            }
            return 'Please analyze a URL first.';
        }

        // Evidence summary
        if (lower.includes('evidence') || lower.includes('summary') || lower.includes('report')) {
            if (lastAnalysis) {
                return `## Evidence Report: ${lastAnalysis.url}\n\n| Indicator | Value |\n|---|---|\n| Risk Score | ${lastAnalysis.risk_score}/100 |\n| Category | ${lastAnalysis.category} |\n| Hosting | ${lastAnalysis.hosting.provider} (${lastAnalysis.hosting.country}) |\n| TLS Issuer | ${lastAnalysis.tls.issuer} |\n| Redirects | ${lastAnalysis.redirect_chain.length} hops |\n| Rules Fired | ${lastAnalysis.rules_fired}/${lastAnalysis.rules_evaluated} |\n| Cluster | ${lastAnalysis.cluster_id || 'None'} |\n\nExport a full report from the **Blocklist** page.`;
            }
            return 'Analyze a URL first to generate an evidence report.';
        }

        // Help
        if (lower.includes('help') || lower === 'hi' || lower === 'hello') {
            return SYSTEM_GREETING.content;
        }

        // Mirror detection
        if (lower.includes('mirror')) {
            return 'Mirror detection works by comparing **Digital DNA** — shared TLS certs, tracking pixels, crypto wallets, and hosting infrastructure. Even if the content looks different, shared markers reveal the same operator.\n\nAnalyze a URL to check for mirrors.';
        }

        // General fallback
        return "I can help with:\n\n• **\"Analyze [url]\"** — Deep-scan a website\n• **\"Why is this risky?\"** — Explain the last analysis\n• **\"Show related domains\"** — Find connected sites\n• **\"Generate evidence summary\"** — Create a report\n• **\"Should this be blocked?\"** — Get blocking recommendation\n\nWhat would you like to investigate?";
    };

    const handleSend = async () => {
        const userMsg = input.trim();
        if (!userMsg) return;

        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput('');
        setIsTyping(true);

        // Simulate thinking delay
        await new Promise(r => setTimeout(r, 500 + Math.random() * 700));

        const response = await generateResponse(userMsg);
        setIsTyping(false);
        setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Floating button */}
            <button className={`chat-fab ${isOpen ? 'hidden' : ''}`} onClick={() => setIsOpen(true)}>
                <Sparkles size={22} />
            </button>

            {/* Chat panel */}
            {isOpen && (
                <div className="chat-panel">
                    <div className="chat-header">
                        <div className="chat-header-info">
                            <Bot size={18} />
                            <div>
                                <div className="chat-title">Analyst Copilot</div>
                                <div className="chat-status">QalqanAI Intelligence</div>
                            </div>
                        </div>
                        <button className="chat-close" onClick={() => setIsOpen(false)}>
                            <X size={18} />
                        </button>
                    </div>

                    <div className="chat-messages">
                        {messages.map((msg, i) => (
                            <div key={i} className={`chat-message ${msg.role}`}>
                                <div className="chat-avatar">
                                    {msg.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
                                </div>
                                <div className="chat-bubble" dangerouslySetInnerHTML={{
                                    __html: msg.content
                                        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                                        .replace(/`(.+?)`/g, '<code>$1</code>')
                                        .replace(/^## (.+)$/gm, '<h4>$1</h4>')
                                        .replace(/^### (.+)$/gm, '<h5>$1</h5>')
                                        .replace(/\n/g, '<br/>')
                                }} />
                            </div>
                        ))}
                        {isTyping && (
                            <div className="chat-message assistant">
                                <div className="chat-avatar"><Bot size={14} /></div>
                                <div className="chat-bubble typing">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chat-input-area">
                        <input
                            type="text"
                            placeholder="Ask about threats, analyze URLs..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button className="chat-send" onClick={handleSend} disabled={!input.trim()}>
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
