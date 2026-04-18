import { useState, useEffect, useRef } from 'react'
import { X, Send, MessageSquare, ChevronRight, Loader } from 'lucide-react'
import gsap from 'gsap'

export function WorkspaceView({ onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'user',
      content: 'Build a React todo app with Tailwind CSS',
      timestamp: new Date(),
    },
    {
      id: 2,
      type: 'agent',
      agent: 'Planner',
      content: 'Analyzing requirements... I\'ll break this into: 1) Setup React component structure, 2) Create todo state management, 3) Add Tailwind styling.',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [selectedHistory, setSelectedHistory] = useState(null)
  const containerRef = useRef(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      )
    }
  }, [])

  const handleSendMessage = () => {
    if (!input.trim()) return

    const newMessage = {
      id: messages.length + 1,
      type: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages([...messages, newMessage])
    setInput('')

    // Simulate agent response
    setTimeout(() => {
      const agents = ['Planner', 'Coder', 'Tester', 'Reviewer']
      const agentResponse = {
        id: messages.length + 2,
        type: 'agent',
        agent: agents[Math.floor(Math.random() * agents.length)],
        content: 'Processing your request... Analyzing code patterns and dependencies.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, agentResponse])
    }, 1000)
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-slate-dark border-r border-surface flex flex-col">
        {/* Close Button */}
        <div className="p-4 border-b border-surface flex items-center justify-between">
          <h3 className="font-bold text-white">MAAD Workspace</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* New Chat Button */}
        <button className="m-3 p-3 rounded-lg bg-lime text-black font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all">
          <MessageSquare size={18} />
          <span>New Chat</span>
        </button>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {history.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedHistory(idx)}
              className={`w-full text-left p-3 rounded-lg transition-all text-sm ${
                selectedHistory === idx
                  ? 'bg-lime/20 border border-lime text-lime'
                  : 'hover:bg-gray-800/50 text-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="truncate">{item.title}</span>
                <ChevronRight size={14} />
              </div>
              <div className="text-xs text-gray-500 mt-1">{item.agents} agents</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div ref={containerRef} className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-surface p-6 bg-black">
          <div className="max-w-4xl mx-auto flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              placeholder="Describe your project idea..."
              className="flex-1 px-4 py-3 rounded-lg bg-gray-900 border border-surface text-white placeholder-gray-500 focus:outline-none focus:border-lime transition-colors"
            />
            <button
              onClick={handleSendMessage}
              className="px-6 py-3 rounded-lg bg-lime text-black font-semibold hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ message }) {
  return (
    <div
      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-md lg:max-w-2xl px-4 py-3 rounded-lg ${
          message.type === 'user'
            ? 'bg-lime text-black'
            : 'bg-gray-900 border border-surface text-gray-200'
        }`}
      >
        {message.type === 'agent' && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-lime"></div>
            <span className="text-xs font-bold text-lime">{message.agent}</span>
          </div>
        )}
        <p className="text-sm leading-relaxed">{message.content}</p>
        <div className="text-xs opacity-50 mt-2">
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  )
}

const history = [
  { title: 'React Todo App', agents: '4' },
  { title: 'API Design Discussion', agents: '3' },
  { title: 'Database Schema', agents: '4' },
  { title: 'Authentication Flow', agents: '4' },
  { title: 'Performance Optimization', agents: '3' },
]
