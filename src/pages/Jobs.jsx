import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, MapPin, Clock, X, Zap } from 'lucide-react'
import api from '../api'
import { Card, Spinner, EmptyState, DemoBadge, MatchScore } from '../components/Card'
import '../components/common.css'
import './Jobs.css'

const CATS = {
  government: ['All','SSC','UPSC','TNPSC','Banking','Railway','Defence','Teaching'],
  private:    ['All','IT','Analytics','Finance','AI/ML','Marketing'],
  internship: ['All','IT','Analytics','Design','Marketing'],
  live:       ['All','IT','Data','Finance','Marketing','Engineering'],
}

export default function Jobs() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const initType = params.get('type') || 'government'

  const [type, setType]         = useState(initType)
  const [jobs, setJobs]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [category, setCategory] = useState('All')
  const [page, setPage]         = useState(1)
  const [total, setTotal]       = useState(0)
  const [liveSource, setLiveSource] = useState(false)
  const [liveSearch, setLiveSearch] = useState('software developer')

  const loadJobs = async (t = type, s = search, cat = category, p = 1) => {
    if (t === 'live') {
      loadLiveJobs(s || liveSearch, 'india')
      return
    }
    setLoading(true)
    setLiveSource(false)
    try {
      const endpoint = t === 'government' ? '/jobs/government'
                     : t === 'private'    ? '/jobs/private'
                     : '/jobs/internships'
      const { data } = await api.get(endpoint, {
        params: {
          page: p, limit: 12,
          search: s || undefined,
          category: cat !== 'All' ? cat : undefined,
        }
      })
      setJobs(data.data || [])
      setTotal(data.pagination?.total || 0)
      setPage(p)
    } catch (err) {
      console.error('Load jobs error:', err.message)
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  const loadLiveJobs = async (q, loc = 'india') => {
    setLoading(true)
    setLiveSource(true)
    try {
      const { data } = await api.get('/jobs/live', {
        params: { search: q || 'developer', location: loc }
      })
      setJobs(data.data || [])
      setTotal(data.data?.length || 0)
    } catch (err) {
      console.error('Live jobs error:', err.message)
      setJobs([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (type === 'live') loadLiveJobs(liveSearch)
    else loadJobs(type, '', 'All', 1)
  }, [type])

  const handleSearch = (e) => {
    e.preventDefault()
    if (type === 'live') loadLiveJobs(search || liveSearch)
    else loadJobs(type, search, category, 1)
  }

  return (
    <div>
      <div className="page-header">
        <h1>🔍 Job Search</h1>
        <p>
          {liveSource
            ? `⚡ Live data from Adzuna — ${total}+ real jobs`
            : `${total} jobs available`}
        </p>
      </div>

      {/* Type tabs */}
      <div className="tabs">
        {[
          ['government', '🏛️ Govt Jobs'],
          ['private',    '💼 Private'],
          ['internship', '🎓 Internships'],
          ['live',       '⚡ Live Jobs'],
        ].map(([val, lbl]) => (
          <button
            key={val}
            className={`tab ${type === val ? 'active' : ''}`}
            onClick={() => { setType(val); setCategory('All'); setSearch('') }}
          >
            {lbl}
          </button>
        ))}
      </div>

      {/* Live jobs banner */}
      {type === 'live' && (
        <div className="alert alert-info" style={{ marginBottom: 12 }}>
          ⚡ <strong>Live Jobs</strong> — Real-time data powered by Adzuna.
          Search for any role below.
        </div>
      )}

      {/* Category chips — not shown for live */}
      {type !== 'live' && CATS[type] && (
        <div className="chip-row" style={{ marginBottom: 16 }}>
          {CATS[type].map(c => (
            <button
              key={c}
              className={`chip ${category === c ? 'active' : ''}`}
              onClick={() => { setCategory(c); loadJobs(type, search, c, 1) }}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Live job role chips */}
      {type === 'live' && (
        <div className="chip-row" style={{ marginBottom: 16 }}>
          {['software developer','data analyst','python developer','java developer','ai engineer','marketing manager','finance analyst'].map(role => (
            <button
              key={role}
              className={`chip ${liveSearch === role ? 'active' : ''}`}
              onClick={() => { setLiveSearch(role); loadLiveJobs(role) }}
            >
              {role}
            </button>
          ))}
        </div>
      )}

      {/* Search bar */}
      <form onSubmit={handleSearch} className="search-bar">
        <Search size={18} className="search-icon" />
        <input
          className="search-input"
          placeholder={type === 'live' ? 'Search live jobs... (e.g. React developer Chennai)' : 'Search jobs, companies, skills...'}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button type="button" className="clear-btn"
            onClick={() => { setSearch(''); loadJobs(type, '', category, 1) }}>
            <X size={15}/>
          </button>
        )}
        <button type="submit" className="btn btn-primary btn-sm">
          {type === 'live' ? <><Zap size={14}/> Search Live</> : 'Search'}
        </button>
      </form>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding: 60 }}>
          <Spinner size={32}/>
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No jobs found"
          subtitle={type === 'live' ? 'Try a different search term' : 'Try different filters or search terms'}
        />
      ) : (
        <>
          {liveSource && (
            <div className="alert alert-success" style={{ marginBottom: 12 }}>
              ✅ Showing <strong>{jobs.length} real-time jobs</strong> from Adzuna
            </div>
          )}
          <div className="jobs-grid">
            {jobs.map(job => (
              <JobCard
                key={job.id}
                job={job}
                onClick={() => {
                  if (job.is_live || String(job.id).startsWith('adzuna_')) {
                    window.open(job.apply_url, '_blank', 'noopener')
                  } else {
                    navigate(`/jobs/${job.id}`)
                  }
                }}
              />
            ))}
          </div>

          {!liveSource && total > 12 && (
            <div className="pagination">
              <button className="btn btn-secondary btn-sm"
                disabled={page === 1}
                onClick={() => loadJobs(type, search, category, page - 1)}>
                ← Prev
              </button>
              <span style={{ fontSize:13, color:'var(--text-muted)' }}>
                Page {page} of {Math.ceil(total / 12)}
              </span>
              <button className="btn btn-secondary btn-sm"
                disabled={page >= Math.ceil(total / 12)}
                onClick={() => loadJobs(type, search, category, page + 1)}>
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export function JobCard({ job, onClick }) {
  const isLive = job.is_live || String(job.id).startsWith('adzuna_')
  return (
    <Card className="job-card" onClick={onClick}>
      <div className="job-card-top">
        <span className={`job-type-tag tag-${job.job_type || 'private'}`}>
          {job.job_type === 'government' ? '🏛️' : job.job_type === 'internship' ? '🎓' : '💼'} {job.job_type || 'private'}
        </span>
        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
          {isLive && <span className="badge badge-green" style={{fontSize:10}}>⚡ LIVE</span>}
          {job.is_demo && <DemoBadge />}
        </div>
      </div>

      <h3 className="job-title">{job.title}</h3>
      <p className="job-company">{job.company_name || job.category || '—'}</p>

      <div className="job-meta">
        {job.location && (
          <span><MapPin size={12}/> {job.location}</span>
        )}
        {job.application_end && (
          <span><Clock size={12}/> {job.application_end?.slice(0,10)}</span>
        )}
      </div>

      {job.required_skills?.length > 0 && (
        <div className="skill-chips">
          {job.required_skills.slice(0,3).map(s => (
            <span key={s} className="badge badge-blue" style={{ fontSize:11 }}>{s}</span>
          ))}
          {job.required_skills.length > 3 && (
            <span className="badge badge-gray" style={{fontSize:11}}>+{job.required_skills.length - 3}</span>
          )}
        </div>
      )}

      <div className="job-card-footer">
        {job.salary_display && (
          <span className="salary">💰 {job.salary_display}</span>
        )}
        {job.match_score && <MatchScore score={job.match_score} />}
        {isLive && (
          <span style={{ fontSize:11, color:'var(--primary)' }}>Click to apply →</span>
        )}
      </div>
    </Card>
  )
}
