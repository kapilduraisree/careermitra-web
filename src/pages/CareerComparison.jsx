import React, { useState } from 'react'
import { Plus, X, GitCompare } from 'lucide-react'
import api from '../api'
import { Card, Spinner } from '../components/Card'
import '../components/common.css'
import './CareerComparison.css'

const PRESETS = ['Data Analyst','Software Developer','AI/ML Engineer','IAS Officer','Bank PO','SSC CGL Officer','TNPSC Group 2','Data Scientist','Full Stack Developer','Cybersecurity Engineer']

export default function CareerComparison() {
  const [selected, setSelected] = useState(['Data Analyst','Software Developer'])
  const [custom, setCustom]     = useState('')
  const [result, setResult]     = useState(null)
  const [loading, setLoading]   = useState(false)

  const add = (c) => { if (!selected.includes(c) && selected.length < 4) setSelected([...selected, c]) }
  const remove = (c) => setSelected(selected.filter(x => x !== c))
  const addCustom = () => {
    if (custom.trim() && !selected.includes(custom.trim()) && selected.length < 4) {
      setSelected([...selected, custom.trim()]); setCustom('')
    }
  }

  const compare = async () => {
    if (selected.length < 2) return
    setLoading(true)
    try {
      const { data } = await api.post('/ai/career-comparison', { careers: selected })
      setResult(data.data)
    } finally { setLoading(false) }
  }

  const diffColor = { easy:'var(--green)', medium:'var(--secondary)', hard:'var(--red)' }

  return (
    <div className="comparison-page">
      <div className="page-header">
        <h1>⚖️ Career Comparison</h1>
        <p>Compare up to 4 career paths side by side with AI insights</p>
      </div>

      <Card>
        <h3 style={{ fontWeight:700, marginBottom:14 }}>Select Careers to Compare (2–4)</h3>
        <div className="chip-row" style={{ marginBottom:14 }}>
          {selected.map(c => (
            <span key={c} className="badge badge-blue" style={{ gap:6, cursor:'pointer' }} onClick={() => remove(c)}>
              {c} <X size={11}/>
            </span>
          ))}
        </div>
        <div className="chip-row" style={{ marginBottom:14 }}>
          {PRESETS.filter(p => !selected.includes(p)).map(p => (
            <button key={p} className="chip" onClick={() => add(p)} disabled={selected.length >= 4}>{p}</button>
          ))}
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <input className="input" style={{ flex:1 }} placeholder="Add custom career..."
            value={custom} onChange={e => setCustom(e.target.value)}
            onKeyDown={e => e.key==='Enter' && addCustom()} />
          <button className="btn btn-secondary btn-sm" onClick={addCustom}><Plus size={14}/></button>
        </div>
        <button className="btn btn-primary" style={{ width:'100%', marginTop:14, padding:12 }}
          disabled={selected.length < 2 || loading} onClick={compare}>
          {loading ? <Spinner size={16}/> : <><GitCompare size={16}/> Compare Careers</>}
        </button>
      </Card>

      {result?.comparison && (
        <div className="comparison-results">
          {/* Note about salary */}
          <div className="alert alert-info">
            💡 Salary ranges are approximate and vary by company, location and experience. Always verify from official sources.
          </div>

          {/* Comparison table */}
          <div className="comp-table-wrap">
            <table className="comp-table">
              <thead>
                <tr>
                  <th>Criteria</th>
                  {result.comparison.map(c => <th key={c.career}>{c.career}</th>)}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>💰 Salary (Fresher)</td>
                  {result.comparison.map(c => <td key={c.career}><strong>{c.salary_range}</strong></td>)}
                </tr>
                <tr>
                  <td>🎓 Qualification</td>
                  {result.comparison.map(c => <td key={c.career}>{c.qualification}</td>)}
                </tr>
                <tr>
                  <td>📈 Difficulty</td>
                  {result.comparison.map(c => (
                    <td key={c.career}>
                      <span className="badge" style={{ background: diffColor[c.learning_difficulty]+'20', color: diffColor[c.learning_difficulty] }}>
                        {c.learning_difficulty}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>🚀 Growth</td>
                  {result.comparison.map(c => <td key={c.career}>{c.career_growth}</td>)}
                </tr>
                <tr>
                  <td>🛠️ Key Skills</td>
                  {result.comparison.map(c => (
                    <td key={c.career}>
                      <div className="chip-row">{c.required_skills?.slice(0,3).map(s => <span key={s} className="badge badge-blue" style={{fontSize:11}}>{s}</span>)}</div>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>🗺️ Roadmap</td>
                  {result.comparison.map(c => <td key={c.career} style={{fontSize:12}}>{c.roadmap_summary}</td>)}
                </tr>
              </tbody>
            </table>
          </div>

          {/* AI recommendation */}
          {result.recommendation && (
            <Card style={{ background:'#EFF6FF', border:'1.5px solid #BFDBFE' }}>
              <h3 style={{ color:'var(--primary)', marginBottom:8 }}>🤖 AI Recommendation</h3>
              <p style={{ fontSize:14, lineHeight:1.7 }}>{result.recommendation}</p>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
