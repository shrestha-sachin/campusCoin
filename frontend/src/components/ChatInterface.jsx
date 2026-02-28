import React, { useState, useRef, useEffect } from 'react'
import { Bot, Send, User } from 'lucide-react'
import { api } from '../api.js'
import { useApp } from '../store.jsx'
import EmergencyModal from './EmergencyModal.jsx'

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 mb-5">
      <div className="w-9 h-9 rounded-full bg-google-blue-pastel flex items-center justify-center flex-shrink-0">
        <Bot size={18} className="text-google-blue" />
      </div>
      <div className="bg-white rounded-2xl rounded-bl-md px-5 py-3.5 shadow-card border border-black/6">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-google-blue/50 typing-dot" />
          <span className="w-2 h-2 rounded-full bg-google-blue/50 typing-dot" />
          <span className="w-2 h-2 rounded-full bg-google-blue/50 typing-dot" />
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
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I had trouble connecting to the AI. Please try again.' },
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
      <div className="flex flex-col h-full bg-google-off-white">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-1">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-end gap-3 mb-5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {msg.role === 'assistant' ? (
                <div className="w-9 h-9 rounded-full bg-google-blue-pastel flex items-center justify-center flex-shrink-0">
                  <Bot size={18} className="text-google-blue" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full bg-google-off-white border border-black/8 flex items-center justify-center flex-shrink-0">
                  <User size={18} className="text-google-black/50" />
                </div>
              )}
              <div
                className={`max-w-[75%] px-5 py-3 text-[15px] font-google-text leading-relaxed rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-google-blue text-white rounded-br-md'
                    : 'bg-white text-google-black/90 rounded-bl-md shadow-card border border-black/6'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {typing && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Input — white surface, pill send button */}
        <div className="px-8 py-6 bg-white border-t border-black/6">
          <div className="flex items-center gap-3 bg-google-off-white rounded-2xl px-5 py-3 border border-black/6 focus-within:border-google-blue/40 focus-within:shadow-[0_0_0_2px_rgba(66,133,244,0.15)] transition-all">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask me anything about your finances…"
              className="flex-1 bg-transparent text-google-black font-google-text text-[15px] placeholder-google-black/35 outline-none"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || typing}
              className="w-10 h-10 rounded-full bg-google-blue flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#3367d6] transition-colors flex-shrink-0 shadow-[0_2px_8px_rgba(66,133,244,0.3)]"
            >
              <Send size={18} className="text-white" />
            </button>
          </div>
          <p className="font-google-mono text-xs text-google-black/40 text-center mt-3 tracking-wide">
            Powered by Gemini on Modal · Knows your full financial profile
          </p>
        </div>
      </div>
    </>
  )
}
