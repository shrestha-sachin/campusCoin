import React from 'react'
import ChatInterface from '../components/ChatInterface.jsx'
import { Bot } from 'lucide-react'

export default function Strategist() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="fade-up-1 mb-5 sm:mb-6 flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-g-blue to-g-blue-half flex items-center justify-center shadow-sm">
          <Bot size={22} className="text-white" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-g-text tracking-tight">
            AI Strategist
          </h1>
          <p className="font-body text-g-text-secondary text-sm">
            Your personal financial advisor powered by Gemini
          </p>
        </div>
      </div>
      <div className="fade-up-2">
        <ChatInterface />
      </div>
    </div>
  )
}
