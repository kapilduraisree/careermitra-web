import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Bookmark, CheckCircle, AlertTriangle, MapPin, Calendar } from 'lucide-react'
import api from '../api'
import { Card, Spinner, Badge, DemoBadge, MatchScore, ProgressBar } from '../components/Card'
import toast from 'react-hot-toast'
import '../components/common.css'
import './JobDetail.css'

export default function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [match, setMatch] = useState(null)
  const [eligibility, setEligibility] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    const load = async () => {
      try {
        const [jobRes, matchRes] = await Promise.allSettled([
          api.get(`/jobs/${id}`),
          api.post('/ai/job-match', { job_id: id }),
        ])
        if (jobRes.status === 'fulfilled') setJob(jobRes.value.data.data)
        if (matchRes.status === 'fulfilled') setMatch(matchRes.value.data.data)
      } finally { setLoading(false) }
    }
    load()
  }, [id])

  const checkEligibility = async () => {
    try {
      const { data } = await api.post(`/jobs/${id}/check-eligibility`)
      setEligibility(data.data)
    } catch { toast.error('Could not check eligibility') }
  }

  const saveJob = async () => {
    try {
      await api.post('/applications', { job_id: id, status: 'saved' })
      toast.success('Job saved to your tracker!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Already saved')
    }
  }

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:60}}><Spinner size={32}/></div>
  if (!job) return <div className="alert alert-error">Job not found.</div>

  return (
    <div className="job-detail">
      {/* Back */}
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={16}/> Back to Jobs
      </button>

      {/* Header */}
      <Card className="detail-header">
        <div className="detail-header-top">
          <div className="detail-type-row">
            <span className={`job-type-tag tag-${job.job_type}`}>
              {job.job_type === 'government' ? '🏛️' : job.job_type === 'private' ? '💼' : '🎓'} {job.job_type}
            </span>
            {job.category && <Badge color="gray">{job.category}</Badge>}
            {job.is_demo && <DemoBadge />}
          </div>
          {match && <MatchScore score={match.overall_score} />}
        </div>

        <h1 className="detail-title">{job.title}</h1>
        {job.company_name && <p className="detail-company">{job.company_name}</p>}

        <div className="detail-meta">
          {job.location && <span><MapPin size={14}/> {job.location}</span>}
          {job.salary_display && <span>💰 {job.salary_display}</span>}
          {job.vacancy_count && <span>👥 {job.vacancy_count} vacancies</span>}
          {job.application_end && <span><Calendar size={14}/> Last date: {job.application_end?.slice(0,10)}</span>}
        </div>

        <div className="detail-actions">
          <button className="btn btn-secondary" onClick={saveJob}><Bookmark size={16}/> Save Job</button>
          {job.apply_url && (
            <a href={job.apply_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              <ExternalLink size={16}/> Apply Now
            </a>
          )}
          <button className="btn btn-green" onClick={checkEligibility}><CheckCircle size={16}/> Am I Eligible?</button>
        </div>
      </Card>

      {/* AI Match breakdown */}
      {match && (
        <Card>
          <h2 className="card-title">🎯 AI Job Match — {match.overall_score}%</h2>
          <div className="match-bars">
            {[['Skills', match.skills_score], ['Education', match.education_score],
              ['Experience', match.experience_score], ['Location', match.location_score]].map(([label, score]) => (
              <div key={label} className="match-bar-row">
                <span className="match-label">{label}</span>
                <ProgressBar value={score}
                  color={score >= 80 ? 'var(--green)' : score >= 60 ? 'var(--secondary)' : 'var(--red)'} />
                <span className="match-score">{score}%</span>
              </div>
            ))}
          </div>
          {match.missing_skills?.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Missing Skills:</p>
              <div className="chip-row">
                {match.missing_skills.map(s => <span key={s} className="badge badge-red">{s}</span>)}
              </div>
            </div>
          )}
          {match.recommendation && (
            <div className="ai-tip">🤖 {match.recommendation}</div>
          )}
        </Card>
      )}

      {/* Eligibility result */}
      {eligibility && (
        <Card style={{ borderLeft: `4px solid ${eligibility.is_eligible ? 'var(--green)' : 'var(--red)'}` }}>
          <h2 className="card-title">
            {eligibility.is_eligible ? '✅ Eligibility Check' : '⚠️ Eligibility Check'}
          </h2>
          <p style={{ fontSize: 15, fontWeight: 600, color: eligibility.is_eligible ? 'var(--green)' : 'var(--red)', marginBottom: 12 }}>
            {eligibility.is_eligible ? 'You appear eligible for this role!' : 'Please review eligibility requirements carefully.'}
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
            {eligibility.matched_skills?.length > 0 && (
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>✅ Matched Skills</p>
                <div className="chip-row">{eligibility.matched_skills.map(s => <span key={s} className="badge badge-green">{s}</span>)}</div>
              </div>
            )}
            {eligibility.missing_skills?.length > 0 && (
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>❌ Missing Skills</p>
                <div className="chip-row">{eligibility.missing_skills.map(s => <span key={s} className="badge badge-red">{s}</span>)}</div>
              </div>
            )}
          </div>
          {eligibility.note && <p style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>{eligibility.note}</p>}
        </Card>
      )}

      {/* Tabs */}
      <div className="tabs">
        {[['overview','📋 Overview'],['dates','📅 Dates'],['process','⚙️ Process']].map(([v,l]) => (
          <button key={v} className={`tab ${tab===v?'active':''}`} onClick={() => setTab(v)}>{l}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <Card>
          {job.description && <><h3 className="card-title">Description</h3><p className="detail-text">{job.description}</p></>}
          {job.qualification && <><hr className="divider"/><h3 className="card-title">Qualification</h3><p className="detail-text">{job.qualification}</p></>}
          {job.application_fee && <><hr className="divider"/><h3 className="card-title">Application Fee</h3><p className="detail-text">{job.application_fee}</p></>}
          {job.notification_url && (
            <a href={job.notification_url} target="_blank" rel="noopener noreferrer"
              className="btn btn-secondary btn-sm" style={{ marginTop: 16 }}>
              <ExternalLink size={14}/> Official Notification
            </a>
          )}
        </Card>
      )}

      {tab === 'dates' && (
        <Card>
          <div className="dates-grid">
            {[['Application Start', job.application_start], ['Last Date', job.application_end],
              ['Exam Date', job.exam_date]].map(([label, val]) => val && (
              <div key={label} className="date-item">
                <span className="date-label">{label}</span>
                <span className="date-val">{val?.slice(0,10)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === 'process' && (
        <Card>
          {job.selection_process && <><h3 className="card-title">Selection Process</h3><p className="detail-text">{job.selection_process}</p></>}
          {job.exam_pattern && <><hr className="divider"/><h3 className="card-title">Exam Pattern</h3><p className="detail-text">{job.exam_pattern}</p></>}
          {job.syllabus && <><hr className="divider"/><h3 className="card-title">Syllabus</h3><p className="detail-text">{job.syllabus}</p></>}
        </Card>
      )}
    </div>
  )
}
