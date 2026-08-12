import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiPaperAirplane, HiXMark, HiChatBubbleLeftRight } from 'react-icons/hi2';
import './Chatbot.css';

const buildSystem = (config) => {
  const name = config?.name || 'Sandesh Patel';
  const projects = (config?.pinnedProjects || []).map(p => `${p.title}: ${p.desc}`).join(' | ');
  return `You are a helpful AI assistant embedded in ${name}'s portfolio website.
Answer questions about ${name} professionally, warmly, and briefly (2-4 sentences max).

Facts about ${name}:
- Role: Full Stack Developer, 1+ year experience, currently at ATM Infotech (Mumbai)
- Skills: React.js, Node.js, Express.js, MongoDB, SQL Server, ASP.NET, C#, JavaScript, Git, Bootstrap
- Status: ${config?.status || 'Open to work'}
- Projects: ${projects || 'INoteBook, FinEdge Payment, CRM Systems, Parking Management Systems'}
- Email: ${config?.email || 'patelsandesh1@gmail.com'}
- GitHub: ${config?.github || 'https://github.com/sandeshpatel1'}
- LinkedIn: ${config?.linkedin || 'https://www.linkedin.com/in/sandeshpatel1/'}

Rules: never invent information beyond these facts. If asked something you don't know, say
"Please contact Sandesh directly." Keep replies short and conversational, not a bulleted essay.`;
};

const QUICK_PROMPTS = ['Tech stack?', 'Available for hire?', 'Show me projects', 'How to contact you?'];

/* ══════════════════════════════════════════════════════
   LOCAL KNOWLEDGE FALLBACK
   Works with zero API keys and zero network calls — a tiny
   hand-built intent matcher over the real config data. This
   is what answers when no key is set, or a live call fails,
   so the bot is never a dead "not configured" message.
══════════════════════════════════════════════════════ */
function localAnswer(text, config) {
  const t = text.toLowerCase();
  const name = config?.name || 'Sandesh Patel';
  const first = name.split(' ')[0];
  const email = config?.email || 'patelsandesh1@gmail.com';
  const status = config?.status || 'Open to work';
  const location = config?.location || 'Mumbai, India';
  const resumeUrl = config?.resumeUrl;
  const projects = config?.pinnedProjects || [];
  const bio1 = config?.about?.bio1 || '';

  const rules = [
    {
      test: /\b(hi|hello|hey|yo|sup)\b/,
      answer: `Hey! 👋 I'm ${first}'s assistant. Ask me about his tech stack, projects, availability, or how to reach him.`,
    },
    {
      test: /skill|stack|tech(nology)?|framework|language|tools?/,
      answer: `${first} works mainly with React.js, Node.js, Express, MongoDB, SQL Server, C#, and ASP.NET — full MERN stack plus enterprise .NET experience.`,
    },
    {
      test: /project|work|portfolio|built|showcase|app|website/,
      answer: projects.length
        ? `A few things ${first} has shipped: ${projects.map(p => p.title).join(', ')}. Scroll to the Showcase section above for live links, or ask about a specific one.`
        : `Check the Showcase section above — it pulls live from ${first}'s GitHub.`,
    },
    {
      test: /hire|available|freelance|job|opportunit|work with|open to/,
      answer: `${first}'s current status: "${status}". Best way to start a conversation is the contact form below, or email directly.`,
    },
    {
      test: /contact|email|reach|connect|get in touch/,
      answer: `You can reach ${first} at ${email}, or use the contact form on this page — it goes straight to his inbox.`,
    },
    {
      test: /experience|background|journey|story|career|about (you|him)|who (is|are)/,
      answer: bio1 || `${first} is a Full Stack Developer with hands-on production experience across React, Node.js, and enterprise .NET systems.`,
    },
    {
      test: /where|location|based|live|city/,
      answer: `${first} is based in ${location}.`,
    },
    {
      test: /resume|cv/,
      answer: resumeUrl ? `Here's the resume: ${resumeUrl}` : `Ask ${first} directly for the latest resume — ${email}.`,
    },
    {
      test: /thank/,
      answer: `You're welcome! Anything else you'd like to know about ${first}?`,
    },
  ];

  const hit = rules.find(r => r.test.test(t));
  return hit
    ? hit.answer
    : `I don't have a specific answer for that yet — I'm running on a lightweight local assistant right now. Try asking about skills, projects, availability, or contact, or reach ${first} directly at ${email}.`;
}

function TypingDots() { return <div className="chat-typing"><span /><span /><span /></div>; }

export default function Chatbot({ config }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: `Hi 👋 I'm ${config?.name?.split(' ')[0] || 'Sandesh'}'s AI assistant. Ask me about skills, projects, or how to get in touch.` },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Two supported providers — set ONE of these in .env (see README):
  //   VITE_GROQ_API_KEY   -> recommended: fast, generous free tier
  //   VITE_GEMINI_API_KEY -> alternative
  // Neither set? The bot still works via the local knowledge fallback below.
  const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY;
  const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const hasApiKey = Boolean(GROQ_KEY || GEMINI_KEY);

  useEffect(() => {
    if (config?.name) {
      setMessages([{ role: 'assistant', text: `Hi 👋 I'm ${config.name.split(' ')[0]}'s AI assistant. Ask me about skills, projects, or how to get in touch.` }]);
    }
  }, [config?.name]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 300); }, [open]);

  const callGroq = async (userText, history) => {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_KEY}` },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: buildSystem(config) },
          ...history.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.text })),
          { role: 'user', content: userText },
        ],
        temperature: 0.7,
        max_tokens: 250,
      }),
    });
    if (!res.ok) throw new Error(`Groq HTTP ${res.status}`);
    const data = await res.json();
    return data?.choices?.[0]?.message?.content || null;
  };

  const callGemini = async (userText, history) => {
    const body = {
      system_instruction: { parts: [{ text: buildSystem(config) }] },
      contents: [
        ...history.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.text }] })),
        { role: 'user', parts: [{ text: userText }] },
      ],
      generationConfig: { temperature: 0.7, maxOutputTokens: 250 },
    };
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    );
    if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  };

  const send = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;
    setInput('');
    const history = messages;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    // No key at all -> answer locally immediately, no network round-trip.
    if (!hasApiKey) {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', text: localAnswer(userText, config) }]);
        setLoading(false);
      }, 350);
      return;
    }

    try {
      const reply = GROQ_KEY ? await callGroq(userText, history) : await callGemini(userText, history);
      setMessages(prev => [...prev, { role: 'assistant', text: reply || localAnswer(userText, config) }]);
    } catch {
      // Live call failed (quota, network, bad key) — fall back to the
      // local knowledge base instead of a dead-end error message.
      setMessages(prev => [...prev, { role: 'assistant', text: localAnswer(userText, config) }]);
    } finally { setLoading(false); }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div className="chat-window glass-strong glass-panel"
            initial={{ opacity: 0, y: 30, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}>
            <div className="chat-header">
              <div className="chat-header-left">
                <div className="chat-avatar">AI</div>
                <div>
                  <div className="chat-title">Ask {config?.name?.split(' ')[0] || 'Sandesh'}</div>
                  <div className="chat-subtitle">
                    <span className={`chat-dot${hasApiKey ? '' : ' local'}`} />
                    {hasApiKey ? 'Online' : 'Smart Assistant'}
                  </div>
                </div>
              </div>
              <button className="chat-close-btn" onClick={() => setOpen(false)}><HiXMark /></button>
            </div>

            <div className="chat-messages">
              {messages.map((m, i) => (
                <motion.div key={i} className={`chat-msg ${m.role === 'user' ? 'mine' : 'theirs'}`}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="chat-bubble">{m.text}</div>
                </motion.div>
              ))}
              {loading && <div className="chat-msg theirs"><div className="chat-bubble"><TypingDots /></div></div>}
              <div ref={bottomRef} />
            </div>

            {messages.length <= 1 && (
              <div className="chat-quick">
                {QUICK_PROMPTS.map(q => <button key={q} className="chat-quick-btn" onClick={() => send(q)}>{q}</button>)}
              </div>
            )}

            <div className="chat-input-row">
              <textarea ref={inputRef} className="chat-input" value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown} placeholder="iMessage" rows={1} disabled={loading} />
              <button className="chat-send-btn" onClick={() => send()} disabled={!input.trim() || loading}>
                <HiPaperAirplane />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button className={`chat-fab glass-strong${open ? ' open' : ''}`} onClick={() => setOpen(v => !v)}
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
        {open ? <HiXMark /> : <HiChatBubbleLeftRight />}
      </motion.button>
    </>
  );
}
