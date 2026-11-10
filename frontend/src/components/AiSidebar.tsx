import { useState, useRef, useEffect } from 'react'
import { X, Send, Sparkles, Bot, User } from 'lucide-react'
import apiClient from '../api/client'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface AiSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function AiSidebar({ isOpen, onClose }: AiSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hey! 👋 I'm Sovereign AI, your personal business assistant. I have access to your live metrics, content, and deals. Ask me anything about your creator business!",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when sidebar opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const res = await apiClient.post('/ai/chat', { message: userMessage.content })
      const assistantMessage: Message = {
        role: 'assistant',
        content: res.data.response,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-white/40 z-40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] z-50 flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          background: 'rgba(20, 21, 23, 0.95)',
          backdropFilter: 'blur(20px)',
          borderLeft: '1px solid rgba(92, 124, 250, 0.15)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--glass-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sovereign-500 to-accent-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <h3 className="font-display font-bold text-slate-900 text-sm">Sovereign AI</h3>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-xs text-emerald-400">Online</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center transition-colors"
            id="close-ai-sidebar"
          >
            <X className="w-4 h-4 text-slate-700" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 animate-slide-up ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
                msg.role === 'assistant'
                  ? 'bg-gradient-to-br from-sovereign-500/20 to-accent-500/20'
                  : 'bg-slate-300'
              }`}>
                {msg.role === 'assistant'
                  ? <Bot className="w-4 h-4 text-sovereign-400" />
                  : <User className="w-4 h-4 text-slate-800" />
                }
              </div>

              {/* Bubble */}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === 'assistant'
                  ? 'bg-slate-200/60 border border-slate-400/20 rounded-tl-sm'
                  : 'bg-sovereign-600/20 border border-sovereign-500/20 rounded-tr-sm'
              }`}>
                <p className="text-sm text-slate-900 leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </p>
                <p className="text-[10px] text-slate-500 mt-1.5 text-right">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sovereign-500/20 to-accent-500/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-sovereign-400" />
              </div>
              <div className="bg-slate-200/60 border border-slate-400/20 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-sovereign-400 rounded-full typing-dot" />
                  <div className="w-2 h-2 bg-sovereign-400 rounded-full typing-dot" />
                  <div className="w-2 h-2 bg-sovereign-400 rounded-full typing-dot" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t" style={{ borderColor: 'var(--glass-border)' }}>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your metrics, content, deals..."
              className="input-field flex-1 !py-3 text-sm"
              id="ai-chat-input"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="btn-primary !p-3 !rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
              id="ai-chat-send"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 text-center">
            Sovereign AI uses your live data to provide personalized insights
          </p>
        </div>
      </div>
    </>
  )
}
