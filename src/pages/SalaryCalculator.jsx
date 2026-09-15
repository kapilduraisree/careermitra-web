import React, { useState } from 'react'
import { Card } from '../components/Card'
import '../components/common.css'
import './SalaryCalculator.css'

const SALARIES = {
  'Data Analyst':         { fresher: 350000, mid: 700000, senior: 1400000 },
  'Software Developer':   { fresher: 400000, mid: 900000, senior: 1800000 },
  'AI/ML Engineer':       { fresher: 600000, mid: 1200000, senior: 2500000 },
  'Full Stack Developer': { fresher: 450000, mid: 1000000, senior: 2000000 },
  'Data Scientist':       { fresher: 550000, mid: 1100000, senior: 2200000 },
  'SSC CGL Officer':      { fresher: 350000, mid: 600000, senior: 900000 },
  'Bank PO (SBI)':        { fresher: 420000, mid: 700000, senior: 1000000 },
  'TNPSC Group 2':        { fresher: 440000, mid: 700000, senior: 1000000 },
  'IAS Officer':          { fresher: 700000, mid: 1200000, senior: 2000000 },
  'Teacher (Govt)':       { fresher: 300000, mid: 500000, senior: 800000 },
}

const CITY_MULTIPLIER = {
  'Bangalore': 1.3, 'Mumbai': 1.25, 'Delhi': 1.2,
  'Hyderabad': 1.15, 'Pune': 1.1, 'Chennai': 1.0,
  'Kolkata': 0.9, 'Tier-2 City': 0.8,
}

const fmt = (n) => '₹' + (n >= 100000 ? (n/100000).toFixed(1) + ' LPA' : (n/1000).toFixed(0) + 'K')

export default function SalaryCalculator() {
  const [role, setRole]     = useState('Data Analyst')
  const [city, setCity]     = useState('Chennai')
  const [exp, setExp]       = useState('fresher')

  const base = SALARIES[role]?.[exp] || 400000
  const multiplier = CITY_MULTIPLIER[city] || 1
  const salary = Math.round(base * multiplier)
  const monthly = Math.round(salary / 12)
  const inHand  = Math.round(monthly * 0.75)

  const ctc       = salary
  const gross     = Math.round(ctc * 0.85)
  const pf        = Math.round(ctc * 0.12 * 0.12)
  const tax       = Math.round(Math.max(0, (ctc - 250000) * 0.05))

  return (
    <div style={{ maxWidth: 720 }}>
      <div className="page-header">
        <h1>💰 Salary Calculator</h1>
        <p>Estimate your salary based on role, city and experience. Values are approximate.</p>
      </div>

      <Card style={{ marginBottom: 20 }}>
        <div className="salary-controls">
          <div className="form-group">
            <label className="label">Job Role</label>
            <select className="input" value={role} onChange={e => setRole(e.target.value)}>
              {Object.keys(SALARIES).map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="label">City</label>
            <select className="input" value={city} onChange={e => setCity(e.target.value)}>
              {Object.keys(CITY_MULTIPLIER).map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Experience</label>
            <select className="input" value={exp} onChange={e => setExp(e.target.value)}>
              <option value="fresher">Fresher (0-1 yr)</option>
              <option value="mid">Mid (2-5 yrs)</option>
              <option value="senior">Senior (5+ yrs)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Result */}
      <div className="salary-result-grid">
        <Card className="salary-main-card">
          <p className="salary-role-label">{role} · {city} · {exp}</p>
          <div className="salary-big">{fmt(salary)}</div>
          <p className="salary-sublabel">Estimated CTC per year</p>
          <div className="salary-monthly">
            <div><span>{fmt(monthly)}</span><p>Gross/month</p></div>
            <div><span style={{color:'var(--green)'}}>{fmt(inHand)}</span><p>In-hand/month</p></div>
          </div>
        </Card>

        <Card>
          <h3 style={{ fontWeight:700, marginBottom:16 }}>💼 Salary Breakdown</h3>
          {[
            { label:'CTC (Total Package)', val: ctc, color:'var(--primary)' },
            { label:'Gross Salary (85%)',  val: gross },
            { label:'PF Deduction',        val: -pf, color:'var(--red)' },
            { label:'Tax (Approx)',         val: -tax, color:'var(--red)' },
            { label:'In-Hand (Monthly)',    val: inHand, color:'var(--green)' },
          ].map(({ label, val, color }) => (
            <div key={label} className="breakdown-row">
              <span>{label}</span>
              <span style={{ fontWeight:700, color: color || 'var(--text)' }}>
                {val < 0 ? '-' : ''}{fmt(Math.abs(val))}
              </span>
            </div>
          ))}
        </Card>

        <Card style={{ gridColumn:'1/-1', background:'#FFF7ED' }}>
          <p style={{ fontSize:12, color:'#92400E' }}>
            ⚠️ <strong>Disclaimer:</strong> These are approximate figures based on market data for 2024. 
            Actual salaries vary significantly by company, skills, and negotiation. 
            Government salaries are based on 7th Pay Commission scales.
          </p>
        </Card>
      </div>
    </div>
  )
}
