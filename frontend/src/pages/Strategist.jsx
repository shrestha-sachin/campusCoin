import React from 'react'
import { Bot } from 'lucide-react'
import ChatInterface from '../components/ChatInterface.jsx'

export default function Strategist() {
  return (
    <div className="flex flex-col h-screen bg-google-off-white">
      {/* Header bar — white surface, soft shadow */}
      <div className="flex-shrink-0 px-10 py-6 bg-white border-b border-black/6 shadow-card">
        <div className="flex items-center gap-4 max-w-4xl mx-auto">
          <div className="w-11 h-11 rounded-2xl bg-google-blue-pastel flex items-center justify-center">
            <Bot size={22} className="text-google-blue" />
          </div>
          <div>
            <h1 className="font-google font-bold text-google-black text-lg">
              AI Financial Strategist
            </h1>
            <p className="font-google-mono text-xs text-google-black/50 tracking-wide mt-0.5">
              Powered by Gemini on Modal · Knows your full financial profile
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
