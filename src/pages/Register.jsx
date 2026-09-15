import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { UserPlus, X } from 'lucide-react'
import api from '../api'
import toast from 'react-hot-toast'
import '../components/common.css'
import './Auth.css'

const JOB_TYPES = ['government', 'private', 'internship']
const EXP_LEVELS = ['fresher', '1-2 years', '2-5 years', '5+ years']

export default function Register() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [skillInput, setSkillInput] = useState('')
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    qualification: '', graduation_year: '',
    experience_level: 'fresher', preferred_job_type: 'government',
    preferred_location: '', skills: []
  })

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const addSkill = () => {
    const s = skillInput.trim()
    if (s && !form.skills.includes(s)) {
      setForm({ ...form, skills: [...form.skills, s] })
      setSkillInput('')
    }
  }

  const removeSkill = (s) => setForm({ ...form, skills: form.skills.filter(x => x !== s) })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = {
        ...form,
        graduation_year: form.graduation_year ? parseInt(form.graduation_year) : undefined,
      }
      const { data } = await api.post('/auth/register', payload)
      localStorage.setItem('accessToken', data.data.accessToken)
      localStorage.setItem('refreshToken', data.data.refreshToken)
      localStorage.setItem('userName', data.data.user.name)
      localStorage.setItem('userId', data.data.user.id)
      toast.success('Account created! Welcome to CareerMitra AI 🎉')
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-logo">🎯</div>
          <h1>Join CareerMitra AI</h1>
          <p>Create your personalised career profile and get AI-powered guidance</p>
        </div>
        <div className="step-indicator">
          {[1, 2].map(s => (
            <div key={s} className={`step ${step === s ? 'active' : step > s ? 'done' : ''}`}>
              <div className="step-num">{step > s ? '✓' : s}</div>
              <span>{s === 1 ? 'Basic Info' : 'Career Profile'}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
          <h2>{step === 1 ? '👤 Basic Information' : '🎯 Career Profile'}</h2>
          <p className="auth-subtitle">Step {step} of 2</p>

          <div className="progress-track" style={{ height: 4, marginBottom: 24 }}>
            <div className="progress-fill" style={{ width: `${step * 50}%`, background: 'var(--primary)' }} />
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {step === 1 ? (
            <div className="auth-form">
              <div className="form-group">
                <label className="label">Full Name *</label>
                <input className="input" name="name" placeholder="Arjun Kumar"
                  value={form.name} onChange={handle} required />
              </div>
              <div className="form-group">
                <label className="label">Email *</label>
                <input className="input" name="email" type="email" placeholder="arjun@email.com"
                  value={form.email} onChange={handle} required />
              </div>
              <div className="form-group">
                <label className="label">Password * (min 8 chars)</label>
                <input className="input" name="password" type="password" placeholder="Strong password"
                  value={form.password} onChange={handle} required minLength={8} />
              </div>
              <div className="form-group">
                <label className="label">Phone Number</label>
                <input className="input" name="phone" placeholder="9876543210"
                  value={form.phone} onChange={handle} />
              </div>
              <button type="button" className="btn btn-primary btn-block"
                onClick={() => {
                  if (!form.name || !form.email || form.password.length < 8) {
                    setError('Please fill name, email and password (min 8 chars)')
                    return
                  }
                  setError('')
                  setStep(2)
                }}>
                Continue →
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="auth-form">
              <div className="form-group">
                <label className="label">Highest Qualification</label>
                <input className="input" name="qualification" placeholder="B.Tech Computer Science"
                  value={form.qualification} onChange={handle} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="label">Graduation Year</label>
                  <input className="input" name="graduation_year" type="number" placeholder="2024"
                    value={form.graduation_year} onChange={handle} />
                </div>
                <div className="form-group">
                  <label className="label">Preferred Location</label>
                  <input className="input" name="preferred_location" placeholder="Chennai"
                    value={form.preferred_location} onChange={handle} />
                </div>
              </div>

              <div className="form-group">
                <label className="label">Experience Level</label>
                <div className="chip-row">
                  {EXP_LEVELS.map(l => (
                    <button type="button" key={l}
                      className={`chip ${form.experience_level === l ? 'active' : ''}`}
                      onClick={() => setForm({ ...form, experience_level: l })}>{l}</button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="label">Preferred Job Type</label>
                <div className="chip-row">
                  {JOB_TYPES.map(t => (
                    <button type="button" key={t}
                      className={`chip ${form.preferred_job_type === t ? 'active' : ''}`}
                      onClick={() => setForm({ ...form, preferred_job_type: t })}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="label">Your Skills</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="input" style={{ flex: 1 }} placeholder="Type a skill & press Add"
                    value={skillInput} onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
                  <button type="button" className="btn btn-secondary btn-sm" onClick={addSkill}>Add</button>
                </div>
                <div className="chip-row" style={{ marginTop: 8 }}>
                  {form.skills.map(s => (
                    <span key={s} className="badge badge-blue" style={{ cursor: 'pointer', gap: 4 }}
                      onClick={() => removeSkill(s)}>{s} <X size={11} /></span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }}
                  onClick={() => setStep(1)}>← Back</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
                  {loading ? <span className="spinner" style={{width:18,height:18}} /> : <><UserPlus size={16}/> Create Profile</>}
                </button>
              </div>
            </form>
          )}

          <p className="auth-link" style={{ marginTop: 16 }}>
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
