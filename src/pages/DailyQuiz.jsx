import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, Zap } from 'lucide-react'
import api from '../api'
import { Card, Spinner, ProgressBar } from '../components/Card'
import '../components/common.css'
import './DailyQuiz.css'

const CATEGORIES = [
  { id: 'ssc',     label: 'SSC',     emoji: '📝' },
  { id: 'general', label: 'General Knowledge', emoji: '🌍' },
  { id: 'banking', label: 'Banking', emoji: '🏦' },
  { id: 'reasoning', label: 'Reasoning', emoji: '🧩' },
]

export default function DailyQuiz() {
  const [phase, setPhase]     = useState('select')
  const [category, setCategory] = useState(null)
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(600)
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState(null)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [streak, setStreak]   = useState(parseInt(localStorage.getItem('quizStreak') || '0'))

  useEffect(() => {
    if (phase !== 'quiz') return
    const t = setInterval(() => setTimeLeft(s => { if (s <= 1) { clearInterval(t); finish(); return 0 } return s - 1 }), 1000)
    return () => clearInterval(t)
  }, [phase])

  const start = async (cat) => {
    setCategory(cat)
    setLoading(true)
    try {
      const { data } = await api.get('/exams/questions/list', {
        params: { limit: 10, exam_id: undefined, topic: cat.id === 'general' ? undefined : cat.id }
      })
      const qs = data.data?.length ? data.data : getDemoQuestions(cat.id)
      setQuestions(qs)
      setPhase('quiz')
      setTimeLeft(600)
    } catch {
      setQuestions(getDemoQuestions(cat.id))
      setPhase('quiz')
    } finally { setLoading(false) }
  }

  const select = (opt) => {
    if (revealed) return
    setSelected(opt)
    setRevealed(true)
    setAnswers(prev => ({ ...prev, [questions[current].id]: opt }))
    setTimeout(() => {
      setRevealed(false)
      setSelected(null)
      if (current + 1 < questions.length) setCurrent(c => c + 1)
      else finish()
    }, 1200)
  }

  const finish = () => {
    const correct = questions.filter((q, i) => answers[q.id] === q.correct_ans || Object.values(answers)[i] === q.correct_ans).length
    const score = Math.round((correct / questions.length) * 100)
    setResult({ correct, total: questions.length, score })
    const today = new Date().toDateString()
    const lastDay = localStorage.getItem('lastQuizDay')
    const newStreak = lastDay === new Date(Date.now() - 86400000).toDateString() ? streak + 1 : 1
    if (lastDay !== today) { setStreak(newStreak); localStorage.setItem('quizStreak', newStreak); localStorage.setItem('lastQuizDay', today) }
    setPhase('result')
  }

  const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  if (phase === 'select') return (
    <div style={{ maxWidth: 640 }}>
      <div className="page-header">
        <h1>⚡ Daily Quiz</h1>
        <p>10 questions · 10 minutes · Test your knowledge every day</p>
      </div>
      <div className="streak-banner">
        <span>🔥 {streak} Day Streak</span>
        <span>Complete today's quiz to maintain your streak!</span>
      </div>
      <div className="quiz-cat-grid">
        {CATEGORIES.map(c => (
          <Card key={c.id} className="quiz-cat-card" onClick={() => start(c)}>
            <span className="quiz-cat-emoji">{c.emoji}</span>
            <h3>{c.label}</h3>
            <p>10 Questions</p>
            <button className="btn btn-primary btn-sm" disabled={loading}>
              {loading && category?.id === c.id ? <Spinner size={14}/> : 'Start Quiz'}
            </button>
          </Card>
        ))}
      </div>
    </div>
  )

  if (phase === 'result') return (
    <div style={{ maxWidth: 560 }}>
      <Card className="quiz-result-card">
        <div style={{ textAlign:'center', padding:24 }}>
          <div style={{ fontSize:56, marginBottom:12 }}>{result.score >= 80 ? '🏆' : result.score >= 60 ? '👍' : '📚'}</div>
          <h1 style={{ fontSize:24, fontWeight:800, marginBottom:4 }}>
            {result.score >= 80 ? 'Excellent!' : result.score >= 60 ? 'Good job!' : 'Keep practicing!'}
          </h1>
          <div style={{ fontSize:48, fontWeight:800, color:'var(--primary)', margin:'12px 0' }}>
            {result.correct}/{result.total}
          </div>
          <p style={{ color:'var(--text-muted)' }}>Score: {result.score}%</p>
          <div className="streak-banner" style={{ marginTop:16 }}>
            🔥 {streak} Day Streak — Keep it up!
          </div>
        </div>
      </Card>
      <div style={{ display:'flex', gap:12, marginTop:16 }}>
        <button className="btn btn-secondary" style={{ flex:1 }} onClick={() => { setPhase('select'); setCurrent(0); setAnswers({}) }}>
          Try Another
        </button>
        <button className="btn btn-primary" style={{ flex:1 }} onClick={() => window.location.href='/ai'}>
          Ask AI Mentor
        </button>
      </div>
    </div>
  )

  const q = questions[current]
  if (!q) return <div><Spinner size={32}/></div>

  return (
    <div style={{ maxWidth: 680 }}>
      <div className="quiz-header">
        <div className="quiz-progress-info">
          <span className="badge badge-blue">{category?.emoji} {category?.label}</span>
          <span style={{ fontSize:13 }}>Q{current+1}/10</span>
        </div>
        <div className={`quiz-timer ${timeLeft < 60 ? 'urgent' : ''}`}>
          <Clock size={14}/> {fmt(timeLeft)}
        </div>
      </div>
      <ProgressBar value={(current+1)*10} />

      <Card style={{ marginTop:16, padding:28 }}>
        <p style={{ fontSize:16, fontWeight:700, lineHeight:1.6, marginBottom:20 }}>
          {current+1}. {q.question_text}
        </p>
        <div className="quiz-options">
          {[['A',q.option_a],['B',q.option_b],['C',q.option_c],['D',q.option_d]].map(([opt,text]) => {
            let cls = 'quiz-option'
            if (revealed) {
              if (opt === q.correct_ans) cls += ' correct'
              else if (opt === selected) cls += ' wrong'
            } else if (selected === opt) cls += ' selected'
            return (
              <div key={opt} className={cls} onClick={() => select(opt)}>
                <span className="opt-badge">{opt}</span>
                <span>{text}</span>
                {revealed && opt === q.correct_ans && <CheckCircle size={16} color="var(--green)"/>}
                {revealed && opt === selected && opt !== q.correct_ans && <XCircle size={16} color="var(--red)"/>}
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

function getDemoQuestions(cat) {
  return [
    { id:'1', question_text:'What is the full form of SSC?', option_a:'Staff Selection Commission', option_b:'State Selection Committee', option_c:'Senior Selection Commission', option_d:'Staff Service Committee', correct_ans:'A' },
    { id:'2', question_text:'Which article of the Indian Constitution deals with Right to Equality?', option_a:'Article 12', option_b:'Article 14', option_c:'Article 19', option_d:'Article 21', correct_ans:'B' },
    { id:'3', question_text:'LCM of 4, 6 and 8 is:', option_a:'12', option_b:'16', option_c:'24', option_d:'48', correct_ans:'C' },
    { id:'4', question_text:'What is the capital of Tamil Nadu?', option_a:'Madurai', option_b:'Coimbatore', option_c:'Chennai', option_d:'Salem', correct_ans:'C' },
    { id:'5', question_text:'Synonym of "Benevolent":', option_a:'Cruel', option_b:'Kind', option_c:'Strict', option_d:'Rude', correct_ans:'B' },
    { id:'6', question_text:'RBI was established in year:', option_a:'1930', option_b:'1935', option_c:'1947', option_d:'1949', correct_ans:'B' },
    { id:'7', question_text:'Simple interest on ₹1000 at 10% for 2 years:', option_a:'₹100', option_b:'₹200', option_c:'₹210', option_d:'₹220', correct_ans:'B' },
    { id:'8', question_text:'Who is known as the Father of the Indian Constitution?', option_a:'Mahatma Gandhi', option_b:'Jawaharlal Nehru', option_c:'Dr. B.R. Ambedkar', option_d:'Sardar Patel', correct_ans:'C' },
    { id:'9', question_text:'Which planet is closest to the Sun?', option_a:'Venus', option_b:'Earth', option_c:'Mars', option_d:'Mercury', correct_ans:'D' },
    { id:'10', question_text:'If 3x + 7 = 22, then x = ?', option_a:'3', option_b:'4', option_c:'5', option_d:'6', correct_ans:'C' },
  ]
}
