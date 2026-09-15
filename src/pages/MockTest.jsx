import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Clock, CheckCircle } from 'lucide-react'
import api from '../api'
import { Spinner, ProgressBar } from '../components/Card'
import toast from 'react-hot-toast'
import '../components/common.css'
import './MockTest.css'

export default function MockTest() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [test, setTest] = useState(null)
  const [answers, setAnswers] = useState({})
  const [current, setCurrent] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const startTime = useRef(Date.now())

  useEffect(() => {
    api.get(`/exams/tests/${id}`).then(r => {
      const t = r.data.data
      setTest(t)
      setTimeLeft(t.duration_min * 60)
      setLoading(false)
    })
  }, [id])

  // Timer
  useEffect(() => {
    if (!test || result) return
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(interval); handleSubmit(); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [test, result])

  const handleSubmit = async () => {
    if (submitting) return
    setSubmitting(true)
    const elapsed = Math.round((Date.now() - startTime.current) / 60000)
    const answerArr = test.questions.map(q => ({
      question_id: q.id,
      selected: answers[q.id] || null
    }))
    try {
      const { data } = await api.post(`/exams/tests/${id}/submit`, {
        answers: answerArr,
        time_taken_min: elapsed
      })
      setResult(data.data)
    } catch { toast.error('Failed to submit test') }
    finally { setSubmitting(false) }
  }

  const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:80}}><Spinner size={32}/></div>

  // Results screen
  if (result) {
    const pct = result.score / result.total_marks
    return (
      <div className="test-result">
        <div className={`result-hero ${pct >= 0.35 ? 'pass' : 'fail'}`}>
          <div style={{ fontSize: 48 }}>{pct >= 0.35 ? '🎉' : '📚'}</div>
          <h1>{pct >= 0.35 ? 'Well Done!' : 'Keep Practicing!'}</h1>
          <div className="result-stats">
            <div><span className="stat-big">{result.score}/{result.total_marks}</span><span>Score</span></div>
            <div><span className="stat-big">{Math.round(result.accuracy)}%</span><span>Accuracy</span></div>
            {result.time_taken_min && <div><span className="stat-big">{result.time_taken_min}m</span><span>Time</span></div>}
          </div>
        </div>

        <div className="result-areas">
          {result.strong_areas?.length > 0 && (
            <div className="area-card green">
              <h3>💪 Strong Areas</h3>
              {result.strong_areas.map(a => <p key={a}>• {a}</p>)}
            </div>
          )}
          {result.weak_areas?.length > 0 && (
            <div className="area-card red">
              <h3>📖 Needs Work</h3>
              {result.weak_areas.map(a => <p key={a}>• {a}</p>)}
            </div>
          )}
        </div>

        <div style={{ display:'flex', gap:12, justifyContent:'center', marginTop:24 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/exams')}>Back to Exams</button>
          <button className="btn btn-primary" onClick={() => navigate('/ai')}>Get AI Study Plan</button>
        </div>
      </div>
    )
  }

  const questions = test.questions
  const q = questions[current]
  const answered = Object.keys(answers).length

  return (
    <div className="mock-test">
      {/* Header */}
      <div className="test-header">
        <div className="test-title-row">
          <h2>{test.title}</h2>
          <div className={`timer ${timeLeft < 60 ? 'urgent' : ''}`}>
            <Clock size={16}/> {fmt(timeLeft)}
          </div>
        </div>
        <ProgressBar value={(current + 1) / questions.length * 100} />
        <div className="test-progress-text">
          Question {current + 1} of {questions.length} • {answered} answered
        </div>
      </div>

      {/* Question */}
      <div className="question-card">
        {q.topic && <span className="q-topic">{q.topic}</span>}
        <p className="q-text">Q{current + 1}. {q.question_text}</p>

        <div className="options">
          {[['A', q.option_a], ['B', q.option_b], ['C', q.option_c], ['D', q.option_d]].map(([opt, text]) => (
            <div key={opt}
              className={`option ${answers[q.id] === opt ? 'selected' : ''}`}
              onClick={() => setAnswers({ ...answers, [q.id]: opt })}>
              <span className={`opt-letter ${answers[q.id] === opt ? 'selected' : ''}`}>{opt}</span>
              <span className="opt-text">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="test-nav">
        <button className="btn btn-secondary" disabled={current === 0}
          onClick={() => setCurrent(c => c - 1)}>
          <ArrowLeft size={15}/> Previous
        </button>

        <div className="q-dots">
          {questions.slice(Math.max(0, current-3), current+4).map((qq, i) => {
            const idx = Math.max(0, current-3) + i
            return (
              <button key={qq.id} className={`q-dot ${idx===current?'current':''} ${answers[qq.id]?'answered':''}`}
                onClick={() => setCurrent(idx)}>{idx+1}</button>
            )
          })}
        </div>

        {current < questions.length - 1 ? (
          <button className="btn btn-primary" onClick={() => setCurrent(c => c + 1)}>
            Next <ArrowRight size={15}/>
          </button>
        ) : (
          <button className="btn btn-green" disabled={submitting} onClick={handleSubmit}>
            {submitting ? <Spinner size={16}/> : <><CheckCircle size={15}/> Submit</>}
          </button>
        )}
      </div>
    </div>
  )
}
