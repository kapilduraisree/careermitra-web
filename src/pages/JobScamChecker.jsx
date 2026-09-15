import React, { useState } from 'react'
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import api from '../api'
import { Card, Spinner } from '../components/Card'
import '../components/common.css'
import './JobScamChecker.css'

const SAMPLE = `Job Title: Data Entry Operator
Company: XYZ Solutions
Salary: ₹50,000/month - Work from home
Requirements: No experience needed
Apply: Send Aadhar card and ₹500 registration fee to WhatsApp: 9999999999
Note: Immediate joining. No interview required.`

export default function JobScamChecker() {
  const [text, setText]   = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const check = async () => {
    if (!text.trim()) return
    setLoading(true)
    try {
      // Use first job id as placeholder — scam check takes job_text body
      const { data } = await api.post('/jobs/b1000000-0000-0000-0000-000000000001/scam-check', { job_text: text })
      setResult(data.data)
    } catch (err) {
      // Fallback client-side check
      const HIGH = ['registration fee','send money','wire transfer','western union','upfront payment']
      const MED  = ['whatsapp apply','telegram apply','no interview','immediate joining','send aadhar']
      const t = text.toLowerCase()
      const high = HIGH.filter(p => t.includes(p))
      const med  = MED.filter(p => t.includes(p))
      const risk = high.length ? 'high' : med.length >= 2 ? 'high' : med.length ? 'medium' : 'low'
      setResult({ riskLevel: risk, reasons: [...high, ...med].map(r => `Detected: "${r}"`),
        disclaimer: 'Client-side analysis only. Always verify through official channels.' })
    } finally { setLoading(false) }
  }

  const riskConfig = {
    high:   { icon: <XCircle size={32}/>,       color: 'var(--red)',       bg: '#FFF5F5', label: '🔴 HIGH RISK — Likely Scam' },
    medium: { icon: <AlertTriangle size={32}/>,  color: 'var(--secondary)', bg: '#FFF7ED', label: '🟠 MEDIUM RISK — Suspicious' },
    low:    { icon: <CheckCircle size={32}/>,    color: 'var(--green)',     bg: '#F0FDF4', label: '🟢 LOW RISK — Appears Legitimate' },
  }
  const cfg = result ? riskConfig[result.riskLevel] || riskConfig.low : null

  return (
    <div style={{ maxWidth: 760 }}>
      <div className="page-header">
        <h1>🛡️ Job Scam Checker</h1>
        <p>Paste any job posting and AI will detect suspicious patterns instantly</p>
      </div>

      <Card>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
          <label className="label">Paste Job Posting Text</label>
          <button className="btn btn-secondary btn-sm" onClick={() => { setText(SAMPLE); setResult(null) }}>
            Try Sample
          </button>
        </div>
        <textarea className="input" rows={8} style={{ width:'100%', resize:'vertical' }}
          placeholder="Paste the job description, WhatsApp message, or any job posting here..."
          value={text} onChange={e => { setText(e.target.value); setResult(null) }} />
        <button className="btn btn-primary" style={{ width:'100%', marginTop:12, padding:12 }}
          disabled={loading || !text.trim()} onClick={check}>
          {loading ? <><Spinner size={18}/> Analyzing...</> : <><Shield size={16}/> Check for Scam</>}
        </button>
      </Card>

      {result && cfg && (
        <Card style={{ borderLeft: `4px solid ${cfg.color}`, background: cfg.bg }}>
          <div className="scam-result-header" style={{ color: cfg.color }}>
            {cfg.icon}
            <h2>{cfg.label}</h2>
          </div>

          {result.reasons?.length > 0 && (
            <div style={{ marginTop:16 }}>
              <h3 style={{ fontSize:14, fontWeight:700, marginBottom:10 }}>⚠️ Warning Indicators Found:</h3>
              {result.reasons.map((r, i) => (
                <div key={i} style={{ padding:'8px 12px', background:'rgba(0,0,0,0.04)', borderRadius:8, marginBottom:6, fontSize:13 }}>
                  • {r}
                </div>
              ))}
            </div>
          )}

          {result.riskLevel === 'low' && (
            <p style={{ fontSize:14, color:'var(--green)', marginTop:12 }}>
              ✅ No obvious scam patterns detected. Still verify the company on official websites.
            </p>
          )}

          <div className="scam-tips">
            <h3>🔒 Safety Tips:</h3>
            <p>• Never pay registration or training fees for a job</p>
            <p>• Never share Aadhaar/PAN/bank details before joining</p>
            <p>• Always verify through the company's official website</p>
            <p>• Legitimate companies never ask for money upfront</p>
          </div>
          <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:12, fontStyle:'italic' }}>{result.disclaimer}</p>
        </Card>
      )}
    </div>
  )
}
