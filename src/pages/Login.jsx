import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import api from '../api'
import toast from 'react-hot-toast'
import '../components/common.css'
import './Auth.css'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      localStorage.setItem('accessToken', data.data.accessToken)
      localStorage.setItem('refreshToken', data.data.refreshToken)
      localStorage.setItem('userName', data.data.user.name)
      localStorage.setItem('userId', data.data.user.id)
      toast.success(`Welcome back, ${data.data.user.name}!`)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-logo">🎯</div>
          <h1>CareerMitra AI</h1>
          <p>Your AI-powered career partner for Government Jobs, Private Jobs, Internships & Exam Prep</p>
        </div>
        <div className="auth-features">
          {['🏛️ Government Jobs — SSC, UPSC, TNPSC, Banking',
            '💼 Private Jobs — IT, Analytics, Finance',
            '🤖 AI Career Mentor — Multi-language support',
            '📚 Exam Preparation — Mock tests & study materials',
            '🎯 AI Career Roadmap — Personalised learning path'].map((f) => (
            <div key={f} className="auth-feature">{f}</div>
          ))}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2>Welcome Back 👋</h2>
          <p className="auth-subtitle">Sign in to your CareerMitra account</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={submit} className="auth-form">
            <div className="form-group">
              <label className="label">Email</label>
              <input className="input" name="email" type="email" placeholder="you@email.com"
                value={form.email} onChange={handle} required />
            </div>
            <div className="form-group">
              <label className="label">Password</label>
              <div className="input-wrap">
                <input className="input" name="password" type={show ? 'text' : 'password'}
                  placeholder="Min 8 characters" value={form.password} onChange={handle} required />
                <button type="button" className="eye-btn" onClick={() => setShow(!show)}>
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? <span className="spinner" style={{width:18,height:18}} /> : <><LogIn size={16}/> Sign In</>}
            </button>
          </form>

          <p className="auth-link">
            Don't have an account? <Link to="/register">Register here</Link>
          </p>

          <div className="demo-note">
            <p style={{marginBottom:6, fontWeight:700}}>🆕 New User? Register your own account:</p>
            <p style={{fontSize:11, marginBottom:8}}>Click "Register here" → Create account with your email & password</p>
            <hr style={{margin:'8px 0', border:'none', borderTop:'1px solid #fde68a'}}/>
            <p style={{marginBottom:4}}><strong>🎓 Demo Student:</strong></p>
            <p style={{cursor:'pointer', color:'#1565C0', fontSize:12}} onClick={() => setForm({email:'demo@careermitra.com', password:'Admin@1234'})}>
              📧 demo@careermitra.com / Admin@1234 <span style={{fontSize:10}}>(click to fill)</span>
            </p>
            <p style={{marginTop:4, marginBottom:4}}><strong>🔑 Admin:</strong></p>
            <p style={{cursor:'pointer', color:'#1565C0', fontSize:12}} onClick={() => setForm({email:'admin@careermitra.demo', password:'Admin@1234'})}>
              📧 admin@careermitra.demo / Admin@1234 <span style={{fontSize:10}}>(click to fill)</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
