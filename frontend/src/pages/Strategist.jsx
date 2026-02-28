import React from 'react'
import { Bot } from 'lucide-react'
import ChatInterface from '../components/ChatInterface.jsx'

export default function Strategist() {
  return (
    <div className="flex flex-col h-full bg-g-bg">
      {/* Header */}
      <div className="flex-shrink-0 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 bg-g-surface border-b border-g-border">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-g-blue-pastel flex items-center justify-center flex-shrink-0">
            <Bot size={18} className="text-g-blue" />
          </div>
          <div className="min-w-0">
            <h1 className="font-display font-bold text-g-text text-base sm:text-lg truncate">
              AI Financial Strategist
            </h1>
            <p className="font-mono text-[10px] sm:text-[11px] text-g-text-tertiary tracking-wide">
              Powered by Gemini on Modal
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ChatInterface />
      </div>
    </div>
  )
}
