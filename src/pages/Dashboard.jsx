import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase, BookOpen, Bot, TrendingUp, MapPin, Clock, ChevronRight, Star } from 'lucide-react'
import api from '../api'
import { Card, ProgressBar, Spinner, DemoBadge, MatchScore } from '../components/Card'
import '../components/common.css'
import './Dashboard.css'

export default function Dashboard() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [plan, setPlan] = useState(null)
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  const userName = localStorage.getItem('userName') || 'Friend'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, alertsRes, planRes, summaryRes] = await Promise.allSettled([
          api.get('/auth/me'),
          api.get('/jobs/alerts/daily'),
          api.get('/ai/daily-plan'),
          api.get('/applications/summary'),
        ])
        if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data.data)
        if (alertsRes.status === 'fulfilled')  setAlerts(alertsRes.value.data.data?.slice(0, 4) || [])
        if (planRes.status === 'fulfilled')    setPlan(planRes.value.data.data)
        if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value.data.data)
      } finally { setLoading(false) }
    }
    load()
  }, [])

  const completeTask = async (idx) => {
    await api.put(`/ai/daily-plan/task/${idx}`, { completed: true })
    if (plan) {
      const tasks = [...plan.tasks]
      tasks[idx] = { ...tasks[idx], completed: true }
      const pct = Math.round(tasks.filter(t => t.completed).length / tasks.length * 100)
      setPlan({ ...plan, tasks, completion_pct: pct })
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
      <Spinner size={36} />
    </div>
  )

  const features = [
    { emoji: '🏛️', label: 'Govt Jobs',    path: '/jobs?type=government',  color: '#1565C0' },
    { emoji: '💼', label: 'Private Jobs', path: '/jobs?type=private',     color: '#6D28D9' },
    { emoji: '🎓', label: 'Internships',  path: '/jobs?type=internship',  color: '#00695C' },
    { emoji: '📚', label: 'Exam Prep',    path: '/exams',                 color: '#B45309' },
    { emoji: '🤖', label: 'AI Mentor',    path: '/ai',                    color: '#1565C0' },
    { emoji: '🗺️', label: 'Roadmap',      path: '/roadmap',               color: '#7C3AED' },
    { emoji: '📊', label: 'My Progress',  path: '/profile',               color: '#0F766E' },
    { emoji: '📋', label: 'Tracker',      path: '/applications',          color: '#DC2626' },
  ]

  return (
    <div className="dashboard">
      {/* Hero card */}
      <div className="hero-card">
        <div className="hero-text">
          <h1>{greeting}, {userName.split(' ')[0]} 👋</h1>
          <p>Ready to level up your career today?</p>
          <div className="readiness-pill">
            🎯 Career Readiness: {profile?.career_readiness || 0}%
          </div>
        </div>
        <div className="hero-ring">
          <svg viewBox="0 0 100 100" width="100" height="100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8"/>
            <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="8"
              strokeDasharray={`${(profile?.career_readiness || 0) * 2.51} 251`}
              strokeLinecap="round" transform="rotate(-90 50 50)"/>
            <text x="50" y="55" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">
              {profile?.career_readiness || 0}%
            </text>
          </svg>
        </div>
      </div>

      {/* Feature grid */}
      <section>
        <h2 className="section-title">Quick Access</h2>
        <div className="feature-grid">
          {features.map(({ emoji, label, path, color }) => (
            <div key={label} className="feature-tile" onClick={() => navigate(path)}
              style={{ '--tile-color': color }}>
              <span className="tile-emoji">{emoji}</span>
              <span className="tile-label">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Application Summary */}
      {summary && (
        <section>
          <h2 className="section-title">📋 Application Tracker</h2>
          <Card>
            <div className="stats-row">
              {[
                { label: 'Saved', value: summary.saved, emoji: '🔖' },
                { label: 'Applied', value: summary.applied, emoji: '💼' },
                { label: 'Interview', value: summary.interview, emoji: '🎤' },
                { label: 'Selected', value: summary.selected, emoji: '✅' },
              ].map(({ label, value, emoji }) => (
                <div key={label} className="stat-item" onClick={() => navigate('/applications')}>
                  <span className="stat-emoji">{emoji}</span>
                  <span className="stat-value">{value}</span>
                  <span className="stat-label">{label}</span>
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}

      {/* Daily job alerts */}
      {alerts.length > 0 && (
        <section>
          <div className="section-header">
            <h2 className="section-title">🔔 Daily Job Alerts</h2>
            <button className="see-all" onClick={() => navigate('/jobs')}>See All →</button>
          </div>
          <div className="alerts-scroll">
            {alerts.map(job => (
              <div key={job.id} className="alert-card" onClick={() => navigate(`/jobs/${job.id}`)}>
                <div className="alert-top">
                  <span className={`job-type-tag tag-${job.job_type}`}>
                    {job.job_type === 'government' ? '🏛️' : job.job_type === 'private' ? '💼' : '🎓'} {job.job_type}
                  </span>
                  {job.is_demo && <DemoBadge />}
                </div>
                <h3 className="alert-title">{job.title}</h3>
                <p className="alert-company">{job.company_name || job.category}</p>
                <div className="alert-meta">
                  <span><MapPin size={11} /> {job.location || '—'}</span>
                  {job.application_end && <span><Clock size={11} /> {job.application_end?.slice(0,10)}</span>}
                </div>
                {job.match_score && <MatchScore score={job.match_score} />}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Daily plan */}
      {plan && (
        <section>
          <h2 className="section-title">📅 Today's Career Plan</h2>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontWeight: 600 }}>Completion: {plan.completion_pct}%</span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {plan.tasks.filter(t => t.completed).length}/{plan.tasks.length} tasks
              </span>
            </div>
            <ProgressBar value={plan.completion_pct} />
            <div className="task-list">
              {plan.tasks.map((task, i) => (
                <div key={i} className={`task-row ${task.completed ? 'task-done' : ''}`}
                  onClick={() => !task.completed && completeTask(i)}>
                  <span className="task-check">{task.completed ? '✅' : '⬜'}</span>
                  <div className="task-info">
                    <span className="task-title">{task.emoji} {task.title}</span>
                    <span className="task-dur">{task.duration_min} min</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}
    </div>
  )
}
