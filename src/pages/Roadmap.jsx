import React, { useEffect, useState } from 'react'
import { Plus, ChevronDown, ChevronUp, Check } from 'lucide-react'
import api from '../api'
import { Card, Spinner, EmptyState, ProgressBar } from '../components/Card'
import toast from 'react-hot-toast'
import '../components/common.css'
import './Roadmap.css'

export default function Roadmap() {
  const [roadmaps, setRoadmaps] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [goal, setGoal] = useState('')
  const [expanded, setExpanded] = useState({})

  const load = async () => {
    const { data } = await api.get('/ai/roadmaps')
    setRoadmaps(data.data || [])
    if (data.data?.length) loadDetail(data.data[0].id)
    setLoading(false)
  }

  const loadDetail = async (id) => {
    const { data } = await api.get(`/ai/roadmaps/${id}`)
    setSelected(data.data)
  }

  useEffect(() => { load() }, [])

  const create = async () => {
    if (!goal.trim()) return
    setCreating(true)
    try {
      const { data } = await api.post('/ai/career-roadmap', { goal, save: true })
      toast.success('Roadmap created!')
      setGoal('')
      await load()
    } catch { toast.error('Failed to create roadmap') }
    finally { setCreating(false) }
  }

  const updateStep = async (stepId, status) => {
    if (!selected) return
    await api.patch(`/ai/roadmaps/${selected.id}/steps/${stepId}`, {
      status, completion_pct: status === 'completed' ? 100 : 50
    })
    loadDetail(selected.id)
    toast.success(status === 'completed' ? 'Step completed! 🎉' : 'Progress updated')
  }

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:60}}><Spinner size={32}/></div>

  return (
    <div className="roadmap-page">
      <div className="page-header">
        <h1>🗺️ Career Roadmaps</h1>
        <p>AI-generated step-by-step career paths</p>
      </div>

      {/* Create new */}
      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ fontWeight:700, marginBottom:12 }}>Generate New Roadmap</h3>
        <div style={{ display:'flex', gap:10 }}>
          <input className="input" style={{ flex:1 }} placeholder="e.g. Data Analyst, Full Stack Developer, IAS Officer"
            value={goal} onChange={e => setGoal(e.target.value)}
            onKeyDown={e => e.key==='Enter' && create()}/>
          <button className="btn btn-primary" disabled={creating || !goal.trim()} onClick={create}>
            {creating ? <Spinner size={16}/> : <><Plus size={15}/> Create</>}
          </button>
        </div>
      </Card>

      {roadmaps.length === 0 ? (
        <EmptyState icon="🗺️" title="No roadmaps yet" subtitle="Create your first career roadmap above!" />
      ) : (
        <div className="roadmap-layout">
          {/* List */}
          <aside className="roadmap-list">
            {roadmaps.map(r => (
              <div key={r.id} className={`roadmap-list-item ${selected?.id===r.id?'active':''}`}
                onClick={() => loadDetail(r.id)}>
                <div>
                  <p style={{ fontWeight:700, fontSize:13 }}>{r.goal_title || r.title}</p>
                  <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{r.completed_steps}/{r.total_steps} steps</p>
                </div>
                <div style={{ width:40 }}>
                  <svg viewBox="0 0 36 36" width="40" height="40">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#E5E7EB" strokeWidth="3"/>
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#1565C0" strokeWidth="3"
                      strokeDasharray={`${r.completion_pct * 0.94} 94`}
                      strokeLinecap="round" transform="rotate(-90 18 18)"/>
                    <text x="18" y="22" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1565C0">
                      {r.completion_pct}%
                    </text>
                  </svg>
                </div>
              </div>
            ))}
          </aside>

          {/* Detail */}
          <div className="roadmap-detail">
            {selected && (
              <>
                <Card style={{ marginBottom:20 }}>
                  <h2 style={{ fontSize:20, fontWeight:800, marginBottom:6 }}>{selected.title}</h2>
                  {selected.description && <p style={{ color:'var(--text-muted)', fontSize:14, marginBottom:14 }}>{selected.description}</p>}
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <span style={{ fontSize:13, fontWeight:600 }}>Progress: {selected.completion_pct}%</span>
                    <ProgressBar value={selected.completion_pct} />
                  </div>
                </Card>

                <div className="rd-steps">
                  {selected.steps?.map((step, i) => (
                    <div key={step.id} className={`rd-step ${step.status}`}>
                      <div className="rd-step-num">
                        {step.status === 'completed' ? <Check size={16}/> : i+1}
                      </div>
                      {i < selected.steps.length-1 && <div className="rd-step-line"/>}
                      <div className="rd-step-body">
                        <div className="rd-step-header" onClick={() => setExpanded({...expanded,[step.id]:!expanded[step.id]})}>
                          <div>
                            <h4>{step.title}</h4>
                            {step.estimated_days && <span style={{fontSize:12,color:'var(--text-muted)'}}>~{step.estimated_days} days</span>}
                          </div>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <span className={`badge badge-${step.status==='completed'?'green':step.status==='in_progress'?'orange':'gray'}`}>
                              {step.status.replace('_',' ')}
                            </span>
                            {expanded[step.id] ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                          </div>
                        </div>

                        {expanded[step.id] && (
                          <div className="rd-step-content">
                            {step.description && <p>{step.description}</p>}
                            {step.mini_project && <div className="rd-project">🔨 Project: {step.mini_project}</div>}
                            {step.resources && <div className="rd-resources">📚 {step.resources}</div>}
                            <div style={{ display:'flex', gap:8, marginTop:12 }}>
                              {step.status !== 'in_progress' && step.status !== 'completed' && (
                                <button className="btn btn-secondary btn-sm" onClick={() => updateStep(step.id,'in_progress')}>▶ Start</button>
                              )}
                              {step.status !== 'completed' && (
                                <button className="btn btn-green btn-sm" onClick={() => updateStep(step.id,'completed')}><Check size={13}/> Complete</button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
