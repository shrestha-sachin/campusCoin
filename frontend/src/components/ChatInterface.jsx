import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, BrainCircuit, HandHeart, Globe, Sparkles, ListChecks, CalendarRange, GraduationCap } from 'lucide-react'
import { useApp } from '../store.jsx'
import { api } from '../api'

/** Converts a subset of markdown to safe HTML for bubbles */
function renderMarkdown(text) {
  const lines = text.split('\n')
  const html = []
  let inList = false
  let listTag = ''

  const closeList = () => {
    if (inList) {
      html.push(`</${listTag}>`)
      inList = false
      listTag = ''
    }
  }

  const inline = (str) =>
    str
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code class="font-mono text-g-blue bg-g-blue-pastel px-1 py-0.5 rounded text-[13px]">$1</code>')
      // 1. Markdown Links [text](href)
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-g-blue hover:underline font-medium">$1</a>')
      // 2. Bare URLs: only if not already inside a tag or markdown link
      .replace(/(^|\s)(https?:\/\/[^\s\)\]]+)/g, '$1<a href="$2" target="_blank" rel="noopener noreferrer" class="text-g-blue hover:underline font-medium">$2</a>')

  for (const raw of lines) {
    const line = raw.trimEnd()

    // numbered list
    const numMatch = line.match(/^(\d+)\.\s+(.*)/)
    if (numMatch) {
      if (!inList || listTag !== 'ol') { closeList(); html.push('<ol class="list-decimal list-inside space-y-1 mb-2">'); inList = true; listTag = 'ol' }
      html.push(`<li class="pl-1">${inline(numMatch[2])}</li>`)
      continue
    }

    // bullet list
    const bulletMatch = line.match(/^[\*\-]\s+(.*)/)
    if (bulletMatch) {
      if (!inList || listTag !== 'ul') { closeList(); html.push('<ul class="list-disc list-inside space-y-1 mb-2">'); inList = true; listTag = 'ul' }
      html.push(`<li class="pl-1">${inline(bulletMatch[1])}</li>`)
      continue
    }

    closeList()

    if (line === '') {
      html.push('<br />')
    } else {
      html.push(`<p class="leading-relaxed">${inline(line)}</p>`)
    }
  }

  closeList()
  return html.join('')
}

const SUGGESTIONS = [
  "Can I afford dinner tonight?",
  "How can I save $200 this month?",
  "Analyze my runway & bills",
  "Tips for campus job hunting",
  "Optimizing my grocery bill",
  "When is my next rent due?",
  "Side-hustle ideas for students",
  "Managing tuition payments",
]

const QUICK_TOOLS = [
  { icon: BrainCircuit, label: 'What-if Analysis', prompt: "I want to run a 'What-If' scenario. How would my finances change if I got a $15/hr job? Walk me through the math." },
  { icon: HandHeart, label: 'Grants & Aid', prompt: "Search for any currently active emergency grants or student funding opportunities for my university/location." },
  { icon: Globe, label: 'School Policy', prompt: "Research the latest tuition payment plans and financial policies at my university for this semester." },
  { icon: ListChecks, label: 'Audit Checklist', prompt: "Perform a 'Daily Audit' of my finances. Check my balance, upcoming bills, and runway. Tell me my #1 priority today." },
]

export default function ChatInterface() {
  const { auth, profile, incomeStreams, expenses, runway, aiInsight } = useApp()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage(e, manualText) {
    if (e) e.preventDefault()
    const text = manualText || input.trim()
    if (!text || loading) return

    const userMsg = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput(manualText || '') // If manual, show it in input; if not, clear it
    setLoading(true)

    if (manualText) {
      // Small delay to let UI show the "pasted" text before clearing
      setTimeout(() => setInput(''), 10)
    }

    try {
      const res = await api.chat({
        profile: { ...profile, email: auth?.email },
        income_streams: incomeStreams,
        expenses,
        user_query: text,
        conversation_history: [...messages, userMsg],
      })

      const replyText = res.response ?? res.reply ?? 'Sorry, something went wrong with the AI response.'
      setMessages(prev => [...prev, { role: 'assistant', content: replyText }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full card overflow-hidden">
      {/* Messages */}
      <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center min-h-full py-4">
            <div className="text-center w-full max-w-2xl mx-auto px-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-g-blue to-g-blue-half flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Bot size={24} className="text-white" />
              </div>
              <p className="font-display font-bold text-g-text text-lg mb-1.5 font-bold uppercase tracking-wider text-[11px] opacity-40">Navigator Engine</p>
              <p className="font-display font-bold text-g-text text-2xl mb-1 tracking-tight">Meet CampusCoin Sage</p>
              <p className="font-body text-g-text-secondary text-[14px] leading-relaxed mb-6 max-w-md mx-auto">
                Select a topic below, use a tool, or simply ask a question to start your financial navigator session.
              </p>

              <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
                {SUGGESTIONS.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(null, s)}
                    className="px-3.5 py-1.5 rounded-full bg-g-bg border border-g-border text-g-text text-[13px] font-body hover:bg-g-blue-pastel hover:border-g-blue/30 transition-all flex items-center gap-2 group w-fit"
                  >
                    <div className="w-1 h-1 rounded-full bg-g-blue/30 group-hover:bg-g-blue flex-shrink-0" />
                    <span className="font-medium">{s}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-g-blue to-g-blue-half flex items-center justify-center flex-shrink-0 mt-1">
                <Bot size={16} className="text-white" />
              </div>
            )}
            <div className={`max-w-[85%] w-fit rounded-xl px-4 py-2.5 ${msg.role === 'user'
              ? 'bg-g-blue text-white rounded-br-none'
              : 'bg-white border border-g-border text-g-text rounded-bl-none shadow-sm'
              }`}>
              {msg.role === 'user' ? (
                <p className="font-body text-[15px] leading-relaxed whitespace-pre-line">{msg.content}</p>
              ) : (
                <div
                  className="font-body text-[15px] leading-relaxed prose-sm space-y-1"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                />
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-g-text flex items-center justify-center flex-shrink-0 mt-1">
                <User size={16} className="text-white" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-g-blue to-g-blue-half flex items-center justify-center flex-shrink-0 mt-1">
              <Bot size={16} className="text-white" />
            </div>
            <div className="bg-g-bg border border-g-border rounded-2xl rounded-bl-lg px-5 py-4 flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-g-text-tertiary typing-dot" />
              <span className="w-2.5 h-2.5 rounded-full bg-g-text-tertiary typing-dot" />
              <span className="w-2.5 h-2.5 rounded-full bg-g-text-tertiary typing-dot" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Tools & Input */}
      <div className="border-t border-g-border bg-g-surface">
        <div className="px-4 py-2 border-b border-g-border flex gap-2 overflow-x-auto no-scrollbar items-center">
          <div className="flex items-center gap-1.5 px-2 py-1 mr-2 flex-shrink-0">
            <Sparkles size={14} className="text-g-blue" />
            <span className="text-[11px] font-bold text-g-text-tertiary uppercase tracking-widest">Quick Tools</span>
          </div>
          {QUICK_TOOLS.map((tool, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(null, tool.prompt)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-g-bg border border-g-border hover:border-g-blue/30 hover:bg-g-blue-pastel transition-all flex-shrink-0"
              title={tool.label}
            >
              <tool.icon size={15} className="text-g-text-secondary" />
              <span className="text-xs font-medium text-g-text-secondary">{tool.label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={sendMessage} className="p-4 sm:p-5 flex gap-3">
          <input
            type="text" value={input} onChange={e => setInput(e.target.value)}
            placeholder="Ask about your finances…"
            className="input-field !rounded-full !py-3"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-g-blue text-white disabled:opacity-30 hover:bg-[#3367d6] transition-all shadow-sm flex-shrink-0"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  )
}
