import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Bot, User, Trash2, Globe, Lightbulb, ChevronDown, Copy, Check, Mic, MicOff } from 'lucide-react'
import api from '../api'
import { Spinner } from '../components/Card'
import '../components/common.css'
import './AiMentor.css'

const LANGUAGES = [
  { code: 'english', label: 'English', flag: '🇬🇧' },
  { code: 'tamil', label: 'Tamil', flag: '🇮🇳' },
  { code: 'hindi', label: 'Hindi', flag: '🇮🇳' },
  { code: 'telugu', label: 'Telugu', flag: '🇮🇳' },
  { code: 'malayalam', label: 'Malayalam', flag: '🇮🇳' },
  { code: 'kannada', label: 'Kannada', flag: '🇮🇳' },
  { code: 'thanglish', label: 'Thanglish', flag: '🇮🇳' },
]

const QUICK_PROMPTS = [
  { icon: '🏛️', text: 'SSC CGL 2024 preparation strategy', category: 'Exam' },
  { icon: '💼', text: 'How to become a Data Analyst from scratch?', category: 'Career' },
  { icon: '🎯', text: 'Best government jobs for B.Tech freshers', category: 'Jobs' },
  { icon: '📝', text: 'How to crack UPSC Civil Services exam?', category: 'Exam' },
  { icon: '🛠️', text: 'What skills do I need for a software developer job?', category: 'Skills' },
  { icon: '🏦', text: 'SBI PO preparation tips and strategy', category: 'Banking' },
  { icon: '🚂', text: 'Railway NTPC exam syllabus and preparation', category: 'Railway' },
  { icon: '🎤', text: 'How to prepare for a technical interview?', category: 'Interview' },
]

// Simple markdown renderer
function renderMarkdown(text) {
  if (!text) return ''
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
    .replace(/^[-•] (.*$)/gm, '<li>$1</li>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')
}

function MessageBubble({ msg, isLast }) {
  const [copied, setCopied] = useState(false)
  const isAi = msg.sender === 'ai'

  const copy = () => {
    navigator.clipboard.writeText(msg.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`msg-row ${msg.sender}`}>
      <div className="msg-avatar">
        {isAi ? <span>🤖</span> : <User size={16} />}
      </div>
      <div className="msg-content-wrap">
        <div className={`msg-bubble ${isAi ? 'ai-bubble' : 'user-bubble'}`}>
          {isAi ? (
            <div
              className="msg-text"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
            />
          ) : (
            <p className="msg-text">{msg.content}</p>
          )}
        </div>
        {isAi && msg.content && (
          <button className="copy-btn" onClick={copy} title="Copy">
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        )}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="msg-row ai">
      <div className="msg-avatar"><span>🤖</span></div>
      <div className="msg-bubble ai-bubble typing-bubble">
        <span className="dot" /><span className="dot" /><span className="dot" />
      </div>
    </div>
  )
}

export default function AiMentor() {
  const [messages, setMessages]     = useState([])
  const [input, setInput]           = useState('')
  const [typing, setTyping]         = useState(false)
  const [convId, setConvId]         = useState(null)
  const [lang, setLang]             = useState('english')
  const [showLang, setShowLang]     = useState(false)
  const [listening, setListening]   = useState(false)
  const bottomRef  = useRef(null)
  const inputRef   = useRef(null)
  const recognRef  = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  // Voice input
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition
      recognRef.current = new SR()
      recognRef.current.continuous = false
      recognRef.current.interimResults = false
      recognRef.current.onresult = (e) => {
        setInput(e.results[0][0].transcript)
        setListening(false)
      }
      recognRef.current.onerror = () => setListening(false)
      recognRef.current.onend  = () => setListening(false)
    }
  }, [])

  const toggleVoice = () => {
    if (!recognRef.current) return
    if (listening) {
      recognRef.current.stop()
      setListening(false)
    } else {
      recognRef.current.lang = lang === 'tamil' ? 'ta-IN' : lang === 'hindi' ? 'hi-IN' : 'en-IN'
      recognRef.current.start()
      setListening(true)
    }
  }

  const sendMessage = useCallback(async (text) => {
    const msg = (text || input).trim()
    if (!msg || typing) return

    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', content: msg }])
    setInput('')
    setTyping(true)
    inputRef.current?.focus()

    try {
      const { data } = await api.post('/ai/chat', {
        message: msg,
        conversation_id: convId,
        language: lang,
      })
      if (data.data?.conversation_id) setConvId(data.data.conversation_id)
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        content: data.data?.reply || 'Sorry, I could not respond.',
      }])
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        content: '❌ Something went wrong. Please check your connection and try again.',
      }])
    } finally {
      setTyping(false)
    }
  }, [input, convId, lang, typing])

  const clearChat = () => { setMessages([]); setConvId(null) }

  const currentLang = LANGUAGES.find(l => l.code === lang)

  return (
    <div className="ai-mentor-page">
      {/* Header */}
      <div className="ai-header">
        <div className="ai-header-left">
          <div className="ai-logo">🤖</div>
          <div>
            <h1>CareerMitra AI Mentor</h1>
            <p>Your personal AI career guide — ask in any language</p>
          </div>
        </div>
        <div className="ai-header-right">
          {/* Language selector */}
          <div className="lang-selector" onClick={() => setShowLang(!showLang)}>
            <Globe size={14} />
            <span>{currentLang?.flag} {currentLang?.label}</span>
            <ChevronDown size={14} />
            {showLang && (
              <div className="lang-dropdown">
                {LANGUAGES.map(l => (
                  <button key={l.code}
                    className={`lang-option ${lang === l.code ? 'active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); setLang(l.code); setShowLang(false) }}>
                    {l.flag} {l.label}
                    {lang === l.code && <Check size={12} />}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="clear-chat-btn" onClick={clearChat} title="Clear chat">
            <Trash2 size={16} /> New Chat
          </button>
        </div>
      </div>

      {/* Chat window */}
      <div className="chat-window">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <div className="empty-logo">🎯</div>
            <h2>How can I help your career today?</h2>
            <p>Ask me anything about government jobs, exams, skills, interviews, or career planning.<br/>
               I speak English, Tamil, Hindi, Telugu, Malayalam, Kannada & Thanglish!</p>

            <div className="quick-prompts-grid">
              {QUICK_PROMPTS.map((p, i) => (
                <button key={i} className="quick-prompt-card" onClick={() => sendMessage(p.text)}>
                  <span className="qp-icon">{p.icon}</span>
                  <div>
                    <span className="qp-cat">{p.category}</span>
                    <p className="qp-text">{p.text}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            {typing && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="chat-input-container">
        <div className="chat-input-box">
          <textarea
            ref={inputRef}
            className="chat-textarea"
            placeholder={`Ask anything in ${currentLang?.label}... (Enter to send, Shift+Enter for new line)`}
            value={input}
            rows={1}
            onChange={e => {
              setInput(e.target.value)
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
          />
          <div className="input-actions">
            {recognRef.current && (
              <button
                className={`voice-btn ${listening ? 'listening' : ''}`}
                onClick={toggleVoice}
                title={listening ? 'Stop listening' : 'Voice input'}
              >
                {listening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
            )}
            <button
              className="send-btn"
              disabled={!input.trim() || typing}
              onClick={() => sendMessage()}
            >
              {typing ? <Spinner size={18} /> : <Send size={18} />}
            </button>
          </div>
        </div>
        <p className="chat-disclaimer">
          CareerMitra AI may make mistakes. Always verify job info from official sources.
        </p>
      </div>
    </div>
  )
}
