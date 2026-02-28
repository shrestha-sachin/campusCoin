import React, { useState, useRef, useEffect } from 'react'
import { Bot, Send, User } from 'lucide-react'
import { api } from '../api.js'
import { useApp } from '../store.jsx'
import EmergencyModal from './EmergencyModal.jsx'

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5 mb-4">
      <div className="w-8 h-8 rounded-full bg-g-blue-pastel flex items-center justify-center flex-shrink-0">
        <Bot size={15} className="text-g-blue" />
      </div>
      <div className="bg-g-surface rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-g-border">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-g-blue/50 typing-dot" />
          <span className="w-1.5 h-1.5 rounded-full bg-g-blue/50 typing-dot" />
          <span className="w-1.5 h-1.5 rounded-full bg-g-blue/50 typing-dot" />
        </div>
      </div>
    </div>
  )
}

export default function ChatInterface() {
  const { profile, incomeStreams, expenses } = useApp()
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hey ${profile.name.split(' ')[0]}! I'm your CampusCoin AI — I know your full financial picture. Your current balance is $${profile.current_balance.toFixed(2)}. Ask me anything: "Can I afford a new laptop?", "When will I run out of money?", or "What should I cut first?"`,
    },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [showEmergency, setShowEmergency] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  async function sendMessage() {
    const text = input.trim()
    if (!text || typing) return

    const userMsg = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTyping(true)

    try {
      const res = await api.chat({
        profile,
        income_streams: incomeStreams,
        expenses,
        user_query: text,
        conversation_history: messages,
      })
      setMessages(prev => [...prev, { role: 'assistant', content: res.response }])
      if (res.emergency_mode) setShowEmergency(true)
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I had trouble connecting. Please try again.' },
      ])
    } finally {
      setTyping(false)
      inputRef.current?.focus()
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {showEmergency && <EmergencyModal onClose={() => setShowEmergency(false)} />}
      <div className="flex flex-col h-full bg-g-bg">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-1">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-end gap-2 sm:gap-2.5 mb-3 sm:mb-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {msg.role === 'assistant' ? (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-g-blue-pastel flex items-center justify-center flex-shrink-0">
                  <Bot size={14} className="text-g-blue" />
                </div>
              ) : (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-g-bg border border-g-border flex items-center justify-center flex-shrink-0">
                  <User size={14} className="text-g-text-secondary" />
                </div>
              )}
              <div
                className={`max-w-[85%] sm:max-w-[72%] px-3.5 sm:px-4 py-2.5 text-[13px] sm:text-sm font-body leading-relaxed rounded-2xl ${msg.role === 'user'
                    ? 'bg-g-blue text-white rounded-br-sm'
                    : 'bg-g-surface text-g-text rounded-bl-sm shadow-sm border border-g-border'
                  }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {typing && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-g-surface border-t border-g-border">
          <div className="flex items-center gap-2 bg-g-bg rounded-xl px-3 py-2 border border-g-border focus-within:border-g-blue focus-within:shadow-[0_0_0_3px_rgba(66,133,244,0.1)] transition-all">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about your finances…"
              className="flex-1 bg-transparent text-g-text font-body text-sm placeholder-g-text-tertiary outline-none min-w-0"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || typing}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-g-blue flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#3367d6] transition-colors flex-shrink-0 shadow-sm"
            >
              <Send size={14} className="text-white" />
            </button>
          </div>
          <p className="font-mono text-[10px] text-g-text-tertiary text-center mt-2 tracking-wide">
            Powered by Gemini on Modal
          </p>
        </div>
      </div>
    </>
  )
}
