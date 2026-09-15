import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, ChevronRight, Play, FileText, Video } from 'lucide-react'
import api from '../api'
import { Card, Spinner, EmptyState, DemoBadge } from '../components/Card'
import '../components/common.css'
import './Exams.css'

export default function Exams() {
  const navigate = useNavigate()
  const [exams, setExams] = useState([])
  const [selected, setSelected] = useState(null)
  const [materials, setMaterials] = useState([])
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')
  const [category, setCategory] = useState('All')
  const CATS = ['All','SSC','UPSC','TNPSC','Banking','Railway']

  useEffect(() => {
    api.get('/exams').then(r => {
      setExams(r.data.data || [])
      if (r.data.data?.length) selectExam(r.data.data[0])
      setLoading(false)
    })
  }, [])

  const selectExam = async (exam) => {
    setSelected(exam)
    setTab('overview')
    const [mats, tsts] = await Promise.allSettled([
      api.get(`/exams/${exam.id}/materials`),
      api.get(`/exams/${exam.id}/tests`),
    ])
    setMaterials(mats.status === 'fulfilled' ? mats.value.data.data || [] : [])
    setTests(tsts.status === 'fulfilled' ? tsts.value.data.data || [] : [])
  }

  const filtered = category === 'All' ? exams : exams.filter(e => e.category === category)

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:60}}><Spinner size={32}/></div>

  return (
    <div className="exams-layout">
      {/* Left: exam list */}
      <aside className="exam-list">
        <div className="page-header"><h1>📚 Exam Prep</h1></div>
        <div className="chip-row" style={{ marginBottom: 12 }}>
          {CATS.map(c => (
            <button key={c} className={`chip ${category===c?'active':''}`}
              onClick={() => setCategory(c)}>{c}</button>
          ))}
        </div>
        {filtered.map(exam => (
          <div key={exam.id} className={`exam-list-item ${selected?.id===exam.id?'active':''}`}
            onClick={() => selectExam(exam)}>
            <div className="exam-badge">{exam.short_name?.slice(0,4) || exam.name.slice(0,3)}</div>
            <div className="exam-info">
              <p className="exam-name">{exam.name}</p>
              <p className="exam-body">{exam.conducting_body}</p>
              {exam.is_demo && <DemoBadge />}
            </div>
            <ChevronRight size={16} className="exam-arrow"/>
          </div>
        ))}
      </aside>

      {/* Right: exam detail */}
      <div className="exam-detail">
        {!selected ? (
          <EmptyState icon="📚" title="Select an exam" subtitle="Choose from the list on the left" />
        ) : (
          <>
            <div className="exam-header">
              <h2>{selected.name}</h2>
              <p>{selected.conducting_body}</p>
            </div>

            <div className="tabs">
              {[['overview','📋 Overview'],['materials','📖 Materials'],['tests','📝 Mock Tests']].map(([v,l]) => (
                <button key={v} className={`tab ${tab===v?'active':''}`} onClick={() => setTab(v)}>{l}</button>
              ))}
            </div>

            {tab === 'overview' && (
              <div className="exam-overview">
                {selected.description && (
                  <Card><p style={{ fontSize:14, lineHeight:1.8, color:'var(--text-muted)' }}>{selected.description}</p></Card>
                )}
                {selected.subjects?.length > 0 && (
                  <Card>
                    <h3 style={{ marginBottom:14, fontWeight:700 }}>📘 Subjects</h3>
                    {selected.subjects.map((s, i) => (
                      <div key={s.id} className="subject-row">
                        <span className="subject-num">{i+1}</span>
                        <span className="subject-name">{s.name}</span>
                        {s.weightage && <span className="subject-weight">{s.weightage}%</span>}
                      </div>
                    ))}
                  </Card>
                )}
              </div>
            )}

            {tab === 'materials' && (
              <div>
                {materials.length === 0 ? (
                  <EmptyState icon="📖" title="No materials yet" subtitle="Coming soon!" />
                ) : materials.map(m => (
                  <Card key={m.id} style={{ marginBottom:12 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <div className="mat-icon">
                        {m.content_type==='video' ? <Video size={20}/> : <FileText size={20}/>}
                      </div>
                      <div style={{ flex:1 }}>
                        <p style={{ fontWeight:600, fontSize:14 }}>{m.title}</p>
                        <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{m.content_type.toUpperCase()}{m.duration_min ? ` • ${m.duration_min} min` : ''}</p>
                        {m.content_text && <p style={{ fontSize:13, color:'var(--text-muted)', marginTop:6, lineHeight:1.6 }}>{m.content_text?.slice(0,200)}...</p>}
                      </div>
                      {m.is_demo && <DemoBadge />}
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {tab === 'tests' && (
              <div>
                {tests.length === 0 ? (
                  <EmptyState icon="📝" title="No mock tests yet" subtitle="Coming soon!" />
                ) : tests.map(t => (
                  <Card key={t.id} style={{ marginBottom:12 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                      <div>
                        <p style={{ fontWeight:700, fontSize:15, marginBottom:8 }}>{t.title}</p>
                        <div style={{ display:'flex', gap:12, fontSize:12, color:'var(--text-muted)' }}>
                          <span>⏱ {t.duration_min} min</span>
                          <span>❓ {t.question_count} questions</span>
                          <span>📊 {t.total_marks} marks</span>
                        </div>
                        {t.is_demo && <div style={{marginTop:6}}><DemoBadge /></div>}
                      </div>
                      <button className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/test/${t.id}`)}>
                        <Play size={14}/> Start
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
