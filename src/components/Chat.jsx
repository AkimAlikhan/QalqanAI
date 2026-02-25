import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { analyzeWebsite } from '../ai/analyze';
import { useLang } from '../i18n/LanguageContext';
import './Chat.css';

const SYSTEM_PROMPT = `You are QalqanAI's Analyst Copilot — an AI assistant specialized in cybersecurity, website threat detection, phishing analysis, and online fraud investigation.

Your capabilities:
- Explain website risk scores and threat categories
- Discuss phishing, scam, casino, and pyramid scheme detection
- Help users understand infrastructure fingerprinting
- Explain how mirror/clone site detection works
- Discuss TLS certificates, hosting analysis, and tracker identification
- Provide cybersecurity advice and best practices

Keep responses concise (2-4 paragraphs max). Use markdown formatting: **bold** for emphasis, \`code\` for technical terms. Be professional but approachable.

If a user asks to analyze a specific URL/domain, tell them you'll run the analysis now.
If asked about topics unrelated to cybersecurity, briefly answer but guide the conversation back to security topics.`;

export default function Chat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [lastAnalysis, setLastAnalysis] = useState(null);
    const messagesEndRef = useRef(null);
    const { t, lang } = useLang();

    // Set greeting on mount / language change
    useEffect(() => {
        setMessages([{
            role: 'assistant',
            content: lang === 'ru'
                ? "Привет! Я Аналитик-Копилот QalqanAI. Я могу помочь вам:\n\n• Анализировать любой сайт на угрозы\n• Объяснять решения о рисках\n• Исследовать инфраструктурные кластеры\n• Отвечать на вопросы о кибербезопасности\n\nПопробуйте спросить: **\"Проанализируй lucky-spin-777.bet\"** или **\"Что такое фишинг?\"**"
                : "Hello! I'm QalqanAI's Analyst Copilot. I can help you:\n\n• Analyze any website for threats\n• Explain risk decisions\n• Investigate infrastructure clusters\n• Answer cybersecurity questions\n\nTry asking me: **\"Analyze lucky-spin-777.bet\"** or **\"What is phishing?\"**",
        }]);
    }, [lang]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Check if the message is an analyze command
    const getAnalyzeUrl = (text) => {
        const lower = text.toLowerCase().trim();
        const match = lower.match(/(?:analyze|scan|check|проанализируй|сканируй|проверь)\s+(.+)/);
        if (match) return match[1].replace(/['"]/g, '').trim();
        return null;
    };

    // Format analysis result as a readable message
    const formatAnalysis = (result) => {
        const riskEmoji = result.risk_score >= 80 ? '🔴' : result.risk_score >= 50 ? '🟡' : '🟢';
        const explanationList = result.explanations.length > 0
            ? result.explanations.slice(0, 5).map(e => `  • **+${e.weight}** ${e.label}`).join('\n')
            : '  • No risk indicators detected';

        return `## ${riskEmoji} Analysis: ${result.url}\n\n**Risk Score:** ${result.risk_score}/100\n**Category:** ${result.category}\n**Confidence:** ${Math.round(result.confidence * 100)}%\n**Status:** ${result.status}\n\n### Key Findings:\n${explanationList}\n\n**Hosting:** ${result.hosting.provider} (${result.hosting.country})\n**TLS:** ${result.tls.issuer}${result.tls.selfSigned ? ' ⚠️ Self-signed' : ''}\n${result.cluster_id ? `**Cluster:** ${result.cluster_id}` : ''}\n\nAsk me to explain any finding or investigate further.`;
    };

    // Call Puter.js AI for general chat
    const callAI = async (conversationHistory) => {
        try {
            // Build messages array for the AI
            const aiMessages = [
                { role: 'system', content: SYSTEM_PROMPT + (lang === 'ru' ? '\n\nIMPORTANT: The user is speaking Russian. Always respond in Russian.' : '') },
                ...conversationHistory.map(m => ({
                    role: m.role,
                    content: m.content
                }))
            ];

            // Use Puter.js AI chat (free, no API key)
            const response = await window.puter.ai.chat(aiMessages, {
                model: 'gpt-4o-mini',
            });

            return response?.message?.content || response?.toString() || 'I couldn\'t generate a response. Please try again.';
        } catch (err) {
            console.error('AI Chat error:', err);
            return lang === 'ru'
                ? 'Произошла ошибка при подключении к AI. Попробуйте ещё раз.'
                : 'An error occurred connecting to AI. Please try again.';
        }
    };

    const handleSend = async () => {
        const userMsg = input.trim();
        if (!userMsg || isTyping) return;

        const newMessages = [...messages, { role: 'user', content: userMsg }];
        setMessages(newMessages);
        setInput('');
        setIsTyping(true);

        try {
            // Check if it's an analyze command
            const analyzeUrl = getAnalyzeUrl(userMsg);

            if (analyzeUrl) {
                try {
                    const result = await analyzeWebsite(analyzeUrl);
                    setLastAnalysis(result);
                    const analysisText = formatAnalysis(result);
                    setMessages(prev => [...prev, { role: 'assistant', content: analysisText }]);
                } catch (err) {
                    const errorMsg = lang === 'ru'
                        ? 'Не удалось проанализировать URL. Укажите корректный домен, например `example.com`.'
                        : 'I couldn\'t analyze that URL. Please provide a valid domain like `example.com`.';
                    setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
                }
            } else {
                // General AI chat — send conversation history (last 10 messages for context)
                const contextMessages = newMessages.slice(-10);
                const aiResponse = await callAI(contextMessages);
                setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
            }
        } catch (err) {
            const errorMsg = lang === 'ru' ? 'Произошла ошибка. Попробуйте ещё раз.' : 'Something went wrong. Please try again.';
            setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
        }

        setIsTyping(false);
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
                                <div className="chat-status">
                                    {isTyping
                                        ? (lang === 'ru' ? '● Думаю...' : '● Thinking...')
                                        : 'QalqanAI Intelligence'
                                    }
                                </div>
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
                            placeholder={lang === 'ru' ? 'Спросите об угрозах, анализе URL...' : 'Ask about threats, analyze URLs...'}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isTyping}
                        />
                        <button className="chat-send" onClick={handleSend} disabled={!input.trim() || isTyping}>
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
