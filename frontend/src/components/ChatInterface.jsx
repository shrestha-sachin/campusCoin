import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User } from 'lucide-react'
import { useApp } from '../store.jsx'
import { api } from '../api'

/** Converts a subset of markdown to safe HTML for chat bubbles */
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

export default function ChatInterface() {
  const { auth, profile, incomeStreams, expenses, runway, aiInsight } = useApp()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    const userMsg = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      // Backend ChatRequest expects:
      // { profile, income_streams, expenses, user_query, conversation_history }
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
    <div className="flex flex-col h-[60vh] sm:h-[65vh] card overflow-hidden">
      {/* Messages */}
      <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-g-blue to-g-blue-half flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Bot size={24} className="text-white" />
              </div>
              <p className="font-display font-bold text-g-text text-lg mb-1.5">AI Financial Strategist</p>
              <p className="font-body text-g-text-tertiary text-[15px] leading-relaxed max-w-sm">
                Ask me anything about your finances —<br />budgeting tips, savings goals, or what-if scenarios.
              </p>
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
            <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 ${msg.role === 'user'
              ? 'bg-g-blue text-white rounded-br-lg'
              : 'bg-g-bg border border-g-border text-g-text rounded-bl-lg'
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

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 sm:p-5 border-t border-g-border flex gap-3 bg-g-surface">
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
  )
}
