import React, { useState } from 'react'
import { Mic, Send, Award, ChevronRight, RotateCcw } from 'lucide-react'
import api from '../api'
import { Card, Spinner, ProgressBar } from '../components/Card'
import toast from 'react-hot-toast'
import '../components/common.css'
import './MockInterview.css'

const TYPES = [
  { id: 'hr',               label: 'HR Interview',        emoji: '👔', desc: 'Behavioral & personality questions' },
  { id: 'technical',        label: 'Technical Round',     emoji: '💻', desc: 'Coding & problem-solving questions' },
  { id: 'data_analyst',     label: 'Data Analyst',        emoji: '📊', desc: 'SQL, Python, statistics questions' },
  { id: 'software_developer',label: 'Software Developer', emoji: '🛠️', desc: 'DSA, system design, coding' },
  { id: 'ai_ml',            label: 'AI/ML Engineer',      emoji: '🤖', desc: 'ML concepts, algorithms, projects' },
  { id: 'government',       label: 'Government Interview',emoji: '🏛️', desc: 'GK, current affairs, personality' },
]

export default function MockInterview() {
  const [phase, setPhase]           = useState('select')   // select | interview | result
  const [type, setType]             = useState(null)
  const [interviewId, setInterviewId] = useState(null)
  const [question, setQuestion]     = useState(null)
  const [answer, setAnswer]         = useState('')
  const [qNum, setQNum]             = useState(0)
  const [loading, setLoading]       = useState(false)
  const [evaluation, setEvaluation] = useState(null)
  const [scores, setScores]         = useState([])
  const [finalResult, setFinalResult] = useState(null)
  const [showEval, setShowEval]     = useState(false)

  const start = async (t) => {
    setType(t)
    setLoading(true)
    try {
      const { data } = await api.post('/ai/mock-interview/start', { interview_type: t.id })
      setInterviewId(data.data.interview_id)
      setQuestion(data.data)
      setQNum(1)
      setScores([])
      setPhase('interview')
    } catch { toast.error('Failed to start interview') }
    finally { setLoading(false) }
  }

  const submitAnswer = async () => {
    if (!answer.trim()) { toast.error('Please type your answer'); return }
    setLoading(true)
    setShowEval(false)
    try {
      const { data } = await api.post(`/ai/mock-interview/${interviewId}/answer`, {
        question: question.question,
        answer,
        question_number: qNum,
      })
      const eval_ = data.data.evaluation
      setEvaluation(eval_)
      setScores(prev => [...prev, eval_.score])
      setShowEval(true)
      if (data.data.is_complete) {
        // Complete interview
        const comp = await api.post(`/ai/mock-interview/${interviewId}/complete`)
        setFinalResult({ ...comp.data.data, scores: [...scores, eval_.score] })
        setTimeout(() => setPhase('result'), 1500)
      } else {
        setQuestion(data.data.next_question)
        setQNum(q => q + 1)
        setAnswer('')
      }
    } catch { toast.error('Failed to submit answer') }
    finally { setLoading(false) }
  }

  const reset = () => {
    setPhase('select'); setType(null); setInterviewId(null)
    setQuestion(null); setAnswer(''); setQNum(0)
    setScores([]); setFinalResult(null); setEvaluation(null)
  }

  if (phase === 'select') return (
    <div className="interview-page">
      <div className="page-header">
        <h1>🎤 AI Mock Interview</h1>
        <p>Practice with real AI-powered interviews. Get instant feedback on every answer.</p>
      </div>
      <div className="interview-types-grid">
        {TYPES.map(t => (
          <Card key={t.id} className="type-card" onClick={() => start(t)}>
            <div className="type-emoji">{t.emoji}</div>
            <h3>{t.label}</h3>
            <p>{t.desc}</p>
            <button className="btn btn-primary btn-sm" disabled={loading}>
              {loading && type?.id === t.id ? <Spinner size={14}/> : <>Start <ChevronRight size={14}/></>}
            </button>
          </Card>
        ))}
      </div>
    </div>
  )

  if (phase === 'result') {
    const avg = finalResult?.scores?.length
      ? Math.round(finalResult.scores.reduce((a,b)=>a+b,0) / finalResult.scores.length * 10)
      : finalResult?.overall_score || 0
    return (
      <div className="interview-page">
        <Card className="result-hero-card">
          <div className="result-top">
            <div className="result-emoji">{avg >= 70 ? '🏆' : avg >= 50 ? '👍' : '📚'}</div>
            <h1>{avg >= 70 ? 'Excellent Performance!' : avg >= 50 ? 'Good Job!' : 'Keep Practicing!'}</h1>
            <div className="result-score-big">{avg}<span>/100</span></div>
            <p>Overall Interview Score</p>
          </div>
          <div className="score-breakdown">
            {finalResult?.scores?.map((s, i) => (
              <div key={i} className="score-q-row">
                <span>Q{i+1}</span>
                <ProgressBar value={s * 10} color={s >= 7 ? 'var(--green)' : s >= 5 ? 'var(--secondary)' : 'var(--red)'} />
                <span>{s}/10</span>
              </div>
            ))}
          </div>
        </Card>
        <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
          <button className="btn btn-secondary" onClick={reset}><RotateCcw size={15}/> Try Again</button>
          <button className="btn btn-primary" onClick={() => window.location.href='/ai'}>Ask AI Mentor for Tips</button>
        </div>
      </div>
    )
  }

  return (
    <div className="interview-page">
      {/* Progress bar */}
      <div className="interview-progress">
        <div className="interview-progress-top">
          <span className="badge badge-blue">{type?.emoji} {type?.label}</span>
          <span style={{ fontSize:13, color:'var(--text-muted)' }}>Question {qNum} of 10</span>
        </div>
        <ProgressBar value={qNum * 10} />
      </div>

      {/* Question card */}
      {question && (
        <Card className="question-card-interview">
          <div className="q-meta">
            <span className="badge badge-gray">{question.category || 'General'}</span>
          </div>
          <h2 className="interview-question">{question.question}</h2>
          {question.hint && (
            <div className="hint-box">
              💡 <strong>Hint:</strong> {question.hint}
            </div>
          )}
        </Card>
      )}

      {/* Evaluation from last answer */}
      {showEval && evaluation && (
        <Card className="eval-card">
          <div className="eval-score-row">
            <span className="eval-score" style={{ color: evaluation.score >= 7 ? 'var(--green)' : evaluation.score >= 5 ? 'var(--secondary)' : 'var(--red)' }}>
              {evaluation.score}/10
            </span>
            <span style={{ fontSize: 14, color:'var(--text-muted)' }}>{evaluation.feedback}</span>
          </div>
          {evaluation.good_points?.length > 0 && (
            <div className="eval-section">
              <strong>✅ Good:</strong>
              {evaluation.good_points.map((p,i) => <p key={i} className="eval-point green">• {p}</p>)}
            </div>
          )}
          {evaluation.improvements?.length > 0 && (
            <div className="eval-section">
              <strong>💡 Improve:</strong>
              {evaluation.improvements.map((p,i) => <p key={i} className="eval-point orange">• {p}</p>)}
            </div>
          )}
          {evaluation.model_answer_hint && (
            <div className="model-hint">🎯 {evaluation.model_answer_hint}</div>
          )}
        </Card>
      )}

      {/* Answer input */}
      <Card>
        <label className="label" style={{ marginBottom: 8, display:'block' }}>Your Answer:</label>
        <textarea
          className="input" rows={5}
          placeholder="Type your answer here... Be specific and use examples from your experience."
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          style={{ width:'100%', resize:'vertical', minHeight: 120 }}
        />
        <div style={{ display:'flex', gap:10, marginTop:12 }}>
          <button className="btn btn-secondary" onClick={reset}>Quit</button>
          <button className="btn btn-primary" style={{ flex:1 }} disabled={loading || !answer.trim()} onClick={submitAnswer}>
            {loading ? <Spinner size={16}/> : qNum >= 10 ? <><Award size={15}/> Submit Final Answer</> : <><Send size={15}/> Submit Answer</>}
          </button>
        </div>
      </Card>
    </div>
  )
}
