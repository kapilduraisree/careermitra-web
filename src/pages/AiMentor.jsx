import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Trash2, Globe, Lightbulb, Map, BarChart2 } from 'lucide-react'
import api from '../api'
import { Spinner, Card } from '../components/Card'
import '../components/common.css'
import './AiMentor.css'

const LANGUAGES = ['english','tamil','hindi','telugu','malayalam','kannada','thanglish']
const SUGGESTIONS = [
  'SSC CGL-ku epdi prepare pannalam?',
  'Data Analyst aaga enna skills venum?',
  'How to write a good resume?',
  'Best government jobs for B.Tech freshers',
  'How to crack a technical interview?',
  'Python vs SQL — which to learn first?',
]

export default function AiMentor() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [convId, setConvId] = useState(null)
  const [lang, setLang] = useState('english')
  const [tab, setTab] = useState('chat')
  const [roadmapGoal, setRoadmapGoal] = useState('')
  const [roadmap, setRoadmap] = useState(null)
  const [skillRole, setSkillRole] = useState('')
  const [skillGap, setSkillGap] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, typing])

  const send = async (msg = input) => {
    if (!msg.trim()) return
    const userMsg = { id: Date.now(), sender: 'user', content: msg }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTyping(true)
    try {
      const { data } = await api.post('/ai/chat', { message: msg, conversation_id: convId, language: lang })
      setConvId(data.data.conversation_id)
      setMessages(prev => [...prev, { id: Date.now()+1, sender: 'ai', content: data.data.reply }])
    } catch {
      setMessages(prev => [...prev, { id: Date.now()+1, sender: 'ai', content: '❌ Sorry, something went wrong. Please try again.' }])
    } finally { setTyping(false) }
  }

  const generateRoadmap = async () => {
    if (!roadmapGoal.trim()) return
    setAiLoading(true)
    try {
      const { data } = await api.post('/ai/career-roadmap', { goal: roadmapGoal, save: true })
      setRoadmap(data.data)
    } finally { setAiLoading(false) }
  }

  const analyzeSkillGap = async () => {
    if (!skillRole.trim()) return
    setAiLoading(true)
    try {
      const { data } = await api.post('/ai/skill-gap', { target_role: skillRole })
      setSkillGap(data.data)
    } finally { setAiLoading(false) }
  }

  return (
    <div className="ai-page">
      <div className="page-header">
        <h1>🤖 CareerMitra AI</h1>
        <p>Your personal AI career mentor — ask anything!</p>
      </div>

      <div className="tabs">
        {[['chat','💬 AI Mentor'],['roadmap','🗺️ Career Roadmap'],['skillgap','📊 Skill Gap']].map(([v,l]) => (
          <button key={v} className={`tab ${tab===v?'active':''}`} onClick={() => setTab(v)}>{l}</button>
        ))}
      </div>

      {tab === 'chat' && (
        <div className="chat-container">
          {/* Language picker */}
          <div className="lang-bar">
            <Globe size={14}/>
            <span style={{ fontSize:12, color:'var(--text-muted)', marginRight:4 }}>Language:</span>
            <div className="chip-row">
              {LANGUAGES.map(l => (
                <button key={l} className={`chip ${lang===l?'active':''}`}
                  onClick={() => setLang(l)} style={{ padding:'2px 10px', fontSize:11 }}>
                  {l.charAt(0).toUpperCase()+l.slice(1)}
                </button>
              ))}
            </div>
            <button className="btn btn-secondary btn-sm" style={{ marginLeft:'auto' }}
              onClick={() => { setMessages([]); setConvId(null) }}>
              <Trash2 size={12}/> Clear
            </button>
          </div>

          {/* Messages */}
          <div className="messages">
            {messages.length === 0 && (
              <div className="chat-welcome">
                <div className="welcome-bot">🤖</div>
                <h3>Hi! I'm CareerMitra AI</h3>
                <p>I can help with career guidance, job search, exam prep, skill roadmaps and more.</p>
                <div className="suggestions">
                  {SUGGESTIONS.map(s => (
                    <button key={s} className="suggestion-chip" onClick={() => send(s)}>
                      <Lightbulb size={12}/> {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map(msg => (
              <div key={msg.id} className={`msg-row ${msg.sender}`}>
                <div className="msg-avatar">
                  {msg.sender === 'ai' ? '🤖' : <User size={16}/>}
                </div>
                <div className="msg-bubble">{msg.content}</div>
              </div>
            ))}

            {typing && (
              <div className="msg-row ai">
                <div className="msg-avatar">🤖</div>
                <div className="msg-bubble typing-bubble">
                  <span/><span/><span/>
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Input */}
          <div className="chat-input-bar">
            <input className="chat-input" placeholder="Ask anything about your career..."
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}/>
            <button className="send-btn" disabled={!input.trim() || typing} onClick={() => send()}>
              {typing ? <Spinner size={18}/> : <Send size={18}/>}
            </button>
          </div>
        </div>
      )}

      {tab === 'roadmap' && (
        <div>
          <Card style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom:12, fontWeight:700 }}>🗺️ Generate Career Roadmap</h3>
            <div style={{ display:'flex', gap:10 }}>
              <input className="input" style={{ flex:1 }} placeholder="e.g. Data Analyst, Software Developer, IAS Officer"
                value={roadmapGoal} onChange={e => setRoadmapGoal(e.target.value)}
                onKeyDown={e => e.key==='Enter' && generateRoadmap()}/>
              <button className="btn btn-primary" disabled={aiLoading} onClick={generateRoadmap}>
                {aiLoading ? <Spinner size={16}/> : 'Generate'}
              </button>
            </div>
          </Card>

          {roadmap && (
            <Card>
              <h2 style={{ marginBottom:6, fontWeight:800 }}>{roadmap.title}</h2>
              <p style={{ color:'var(--text-muted)', marginBottom:20, fontSize:14 }}>{roadmap.description}</p>
              <div className="roadmap-steps">
                {roadmap.steps?.map((step, i) => (
                  <div key={i} className="roadmap-step">
                    <div className="step-circle">{i+1}</div>
                    {i < roadmap.steps.length-1 && <div className="step-line"/>}
                    <div className="step-content">
                      <h4>{step.title}</h4>
                      <p>{step.description}</p>
                      {step.estimated_days && <span className="step-days">~{step.estimated_days} days</span>}
                      {step.mini_project && <div className="step-project">🔨 {step.mini_project}</div>}
                    </div>
                  </div>
                ))}
              </div>
              {roadmap.total_months && (
                <div className="alert alert-info" style={{ marginTop:20 }}>
                  ⏱ Estimated total time: <strong>{roadmap.total_months} months</strong>
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {tab === 'skillgap' && (
        <div>
          <Card style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom:12, fontWeight:700 }}>📊 Skill Gap Analysis</h3>
            <div style={{ display:'flex', gap:10 }}>
              <input className="input" style={{ flex:1 }} placeholder="Target role: e.g. Data Analyst, Full Stack Developer"
                value={skillRole} onChange={e => setSkillRole(e.target.value)}
                onKeyDown={e => e.key==='Enter' && analyzeSkillGap()}/>
              <button className="btn btn-primary" disabled={aiLoading} onClick={analyzeSkillGap}>
                {aiLoading ? <Spinner size={16}/> : 'Analyse'}
              </button>
            </div>
          </Card>

          {skillGap && (
            <div className="gap-grid">
              <Card>
                <h4 style={{ marginBottom:12, color:'var(--red)' }}>❌ Missing Skills</h4>
                {skillGap.missing_skills?.map(s => <div key={s} className="gap-skill">{s}</div>)}
              </Card>
              <Card>
                <h4 style={{ marginBottom:12, color:'var(--secondary)' }}>⚠️ Weak Skills</h4>
                {skillGap.weak_skills?.length ? skillGap.weak_skills?.map(s => <div key={s} className="gap-skill">{s}</div>) : <p style={{fontSize:13,color:'var(--text-muted)'}}>None identified</p>}
              </Card>
              <Card style={{ gridColumn:'1/-1' }}>
                <h4 style={{ marginBottom:12 }}>📋 Action Plan</h4>
                {skillGap.priority_actions?.map((a,i) => <div key={i} className="action-item"><span>{i+1}</span>{a}</div>)}
                {skillGap.estimated_months && <div className="alert alert-info" style={{marginTop:12}}>⏱ Estimated: <strong>{skillGap.estimated_months} months</strong></div>}
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
