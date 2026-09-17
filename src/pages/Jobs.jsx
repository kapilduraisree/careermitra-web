import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, MapPin, Clock, X, Filter } from 'lucide-react'
import api from '../api'
import { Card, Spinner, EmptyState, DemoBadge, MatchScore } from '../components/Card'
import '../components/common.css'
import './Jobs.css'

const CATS = {
  government: ['All','SSC','UPSC','TNPSC','Banking','Railway','Defence','Teaching'],
  private:    ['All','IT','Analytics','Finance','AI/ML','Marketing'],
  internship: ['All','IT','Analytics','Design','Marketing'],
}

export default function Jobs() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const initType = params.get('type') || 'government'

  const [type, setType] = useState(initType)
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [liveSource, setLiveSource] = useState(false)

  const loadJobs = async (t = type, s = search, cat = category, p = 1) => {
    if (t === 'live') { loadLiveJobs(s || 'software developer', 'india'); return }
    setLoading(true)
    setLiveSource(false)
    try {
      const endpoint = t === 'government' ? '/jobs/government'
                     : t === 'private'    ? '/jobs/private'
                     : '/jobs/internships'
      const { data } = await api.get(endpoint, {
        params: { page: p, limit: 12, search: s || undefined, category: cat !== 'All' ? cat : undefined }
      })
      setJobs(data.data || [])
      setTotal(data.pagination?.total || 0)
      setPage(p)
    } finally { setLoading(false) }
  }

  const loadLiveJobs = async (q = 'software developer', loc = 'india') => {
    setLoading(true)
    setLiveSource(true)
    try {
      const { data } = await api.get('/jobs/live', { params: { search: q, location: loc } })
      setJobs(data.data || [])
      setTotal(data.data?.length || 0)
    } catch {
      setJobs([])
    } finally { setLoading(false) }
  }

  useEffect(() => { loadJobs(type, search, category, 1) }, [type])

  const handleSearch = (e) => {
    e.preventDefault()
    loadJobs(type, search, category, 1)
  }

  return (
    <div>
      <div className="page-header">
        <h1>🔍 Job Search</h1>
        <p>Find your perfect opportunity — {total} jobs available</p>
      </div>

      {/* Type tabs */}
      <div className="tabs">
        {[['government','🏛️ Govt Jobs'],['private','💼 Private'],['internship','🎓 Internships'],['live','⚡ Live Jobs']].map(([val,lbl]) => (
          <button key={val} className={`tab ${type===val?'active':''}`}
            onClick={() => { setType(val); setCategory('All'); if(val==='live') loadLiveJobs('software developer','india') }}>
            {lbl}
          </button>
        ))}
      </div>

      {/* Category chips */}
      <div className="chip-row" style={{ marginBottom: 16 }}>
        {CATS[type].map(c => (
          <button key={c} className={`chip ${category===c?'active':''}`}
            onClick={() => { setCategory(c); loadJobs(type, search, c, 1) }}>{c}</button>
        ))}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="search-bar">
        <Search size={18} className="search-icon" />
        <input className="search-input" placeholder="Search jobs, companies, skills..."
          value={search} onChange={e => setSearch(e.target.value)} />
        {search && <button type="button" className="clear-btn" onClick={() => { setSearch(''); loadJobs(type,'',category,1) }}><X size={15}/></button>}
        <button type="submit" className="btn btn-primary btn-sm">Search</button>
      </form>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding: 60 }}><Spinner size={32}/></div>
      ) : jobs.length === 0 ? (
        <EmptyState icon="🔍" title="No jobs found" subtitle="Try different filters or search terms" />
      ) : (
        <>
          {liveSource && (
            <div className="alert alert-success" style={{ marginBottom:12 }}>
              ⚡ <strong>Live Data</strong> — Showing real-time jobs from Adzuna. {total}+ jobs available.
            </div>
          )}
          <div className="jobs-grid">
            {jobs.map(job => <JobCard key={job.id} job={job} onClick={() => navigate(`/jobs/${job.id}`)} />)}
          </div>

          {total > 12 && (
            <div className="pagination">
              <button className="btn btn-secondary btn-sm" disabled={page===1} onClick={() => loadJobs(type,search,category,page-1)}>← Prev</button>
              <span style={{ fontSize:13, color:'var(--text-muted)' }}>Page {page} of {Math.ceil(total/12)}</span>
              <button className="btn btn-secondary btn-sm" disabled={page>=Math.ceil(total/12)} onClick={() => loadJobs(type,search,category,page+1)}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export function JobCard({ job, onClick }) {
  return (
    <Card className="job-card" onClick={onClick}>
      <div className="job-card-top">
        <span className={`job-type-tag tag-${job.job_type}`}>
          {job.job_type === 'government' ? '🏛️' : job.job_type === 'private' ? '💼' : '🎓'} {job.job_type}
        </span>
        {job.is_demo && <DemoBadge />}
      </div>
      <h3 className="job-title">{job.title}</h3>
      <p className="job-company">{job.company_name || job.category || '—'}</p>

      <div className="job-meta">
        {job.location && <span><MapPin size={12}/> {job.location}</span>}
        {job.application_end && <span><Clock size={12}/> {job.application_end?.slice(0,10)}</span>}
      </div>

      {job.required_skills?.length > 0 && (
        <div className="skill-chips">
          {job.required_skills.slice(0,3).map(s => (
            <span key={s} className="badge badge-blue" style={{ fontSize:11 }}>{s}</span>
          ))}
          {job.required_skills.length > 3 && <span className="badge badge-gray" style={{fontSize:11}}>+{job.required_skills.length-3}</span>}
        </div>
      )}

      <div className="job-card-footer">
        {job.salary_display && <span className="salary">💰 {job.salary_display}</span>}
        {job.match_score && <MatchScore score={job.match_score} />}
      </div>
    </Card>
  )
}
