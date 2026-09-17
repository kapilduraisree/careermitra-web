import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, MapPin, Clock, X, Zap, ExternalLink } from 'lucide-react'
import api from '../api'
import { Card, Spinner, EmptyState, DemoBadge, MatchScore } from '../components/Card'
import '../components/common.css'
import './Jobs.css'

// ── Adzuna direct call (frontend) ─────────────────────────────────────────────
const ADZUNA_ID  = '6625b2f4'
const ADZUNA_KEY = '1949ae2ef7164e80b5563d44c9db9806'

const fetchLiveJobs = async (query, location = 'india', page = 1) => {
  const p = new URLSearchParams({
    app_id: ADZUNA_ID, app_key: ADZUNA_KEY,
    results_per_page: 20, what: query, where: location,
    sort_by: 'date', 'content-type': 'application/json',
  })
  const r = await fetch(`https://api.adzuna.com/v1/api/jobs/in/search/${page}?${p}`)
  if (!r.ok) throw new Error('Adzuna error')
  const d = await r.json()
  const fmt = n => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${(n/1000).toFixed(0)}K`
  const sal = (min, max) => min && max ? `${fmt(min)} – ${fmt(max)}` : min ? `${fmt(min)}+` : null
  return {
    jobs: (d.results || []).map(j => ({
      id: `az_${j.id}`, title: j.title,
      company_name: j.company?.display_name || '—',
      location: j.location?.display_name || j.location?.area?.slice(0,2).join(', ') || 'India',
      description: (j.description || '').substring(0,200)+'...',
      salary_display: sal(j.salary_min, j.salary_max),
      apply_url: j.redirect_url, job_type: 'private',
      posted_at: j.created, is_live: true, is_demo: false, source: 'adzuna',
    })),
    total: d.count || 0,
  }
}

const CATS = {
  government: ['All','SSC','UPSC','TNPSC','Banking','Railway','Defence','Teaching'],
  private:    ['All','IT','Analytics','Finance','AI/ML','Marketing'],
  internship: ['All','IT','Analytics','Design','Marketing'],
}

const LIVE_ROLES = [
  'software developer', 'data analyst', 'python developer',
  'java developer', 'react developer', 'ai engineer',
  'product manager', 'data scientist', 'devops engineer', 'finance analyst',
]

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
  const [isLive, setIsLive]     = useState(false)
  const [liveRole, setLiveRole] = useState('software developer')
  const [liveLocation, setLiveLocation] = useState('india')
  const [liveError, setLiveError] = useState('')

  const loadDB = async (t = type, s = search, cat = category, p = 1) => {
    setLoading(true); setIsLive(false); setLiveError('')
    try {
      const ep = t === 'government' ? '/jobs/government'
               : t === 'private'   ? '/jobs/private'
               : '/jobs/internships'
      const { data } = await api.get(ep, {
        params: { page: p, limit: 12, search: s || undefined, category: cat !== 'All' ? cat : undefined }
      })
      setJobs(data.data || [])
      setTotal(data.pagination?.total || 0)
      setPage(p)
    } catch (e) { setJobs([]) }
    finally { setLoading(false) }
  }

  const loadLive = async (role = liveRole, loc = liveLocation, p = 1) => {
    setLoading(true); setIsLive(true); setLiveError('')
    try {
      const { jobs: lj, total: lt } = await fetchLiveJobs(role, loc, p)
      setJobs(lj); setTotal(lt); setPage(p)
      if (lj.length === 0) setLiveError('No live jobs found. Try a different search.')
    } catch (e) {
      setLiveError('Could not load live jobs. Showing database jobs instead.')
      loadDB('private', role, 'All', 1)
    }
    finally { setLoading(false) }
  }

  useEffect(() => {
    if (type === 'live') loadLive(liveRole, liveLocation)
    else loadDB(type, '', 'All', 1)
  }, [type])

  const handleSearch = (e) => {
    e.preventDefault()
    if (type === 'live') { setLiveRole(search || liveRole); loadLive(search || liveRole, liveLocation) }
    else loadDB(type, search, category, 1)
  }

  return (
    <div>
      <div className="page-header">
        <h1>🔍 Job Search</h1>
        <p>{isLive ? `⚡ Live data from Adzuna — ${total.toLocaleString()}+ real India jobs` : `${total} jobs available`}</p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {[['government','🏛️ Govt Jobs'],['private','💼 Private'],['internship','🎓 Internships'],['live','⚡ Live Jobs']].map(([v,l]) => (
          <button key={v} className={`tab ${type===v?'active':''}`}
            onClick={() => { setType(v); setSearch(''); setCategory('All') }}>{l}</button>
        ))}
      </div>

      {/* Live jobs header */}
      {type === 'live' && (
        <div className="live-banner">
          <Zap size={16} color="#FF6F00"/>
          <span><strong>Live Jobs</strong> — Real-time data from Adzuna. {total.toLocaleString()}+ jobs available across India.</span>
        </div>
      )}

      {/* Category chips */}
      {type !== 'live' && (
        <div className="chip-row" style={{ marginBottom:16 }}>
          {(CATS[type]||[]).map(c => (
            <button key={c} className={`chip ${category===c?'active':''}`}
              onClick={() => { setCategory(c); loadDB(type, search, c, 1) }}>{c}</button>
          ))}
        </div>
      )}

      {/* Live role chips */}
      {type === 'live' && (
        <>
          <div className="chip-row" style={{ marginBottom:8 }}>
            {LIVE_ROLES.map(r => (
              <button key={r} className={`chip ${liveRole===r?'active':''}`}
                onClick={() => { setLiveRole(r); loadLive(r, liveLocation) }}>{r}</button>
            ))}
          </div>
          <div className="chip-row" style={{ marginBottom:16 }}>
            {['india','bangalore','chennai','hyderabad','mumbai','delhi','pune'].map(loc => (
              <button key={loc} className={`chip ${liveLocation===loc?'active':''}`}
                onClick={() => { setLiveLocation(loc); loadLive(liveRole, loc) }}
                style={{ fontSize:11 }}>{loc}</button>
            ))}
          </div>
        </>
      )}

      {/* Search */}
      <form onSubmit={handleSearch} className="search-bar">
        <Search size={18} className="search-icon"/>
        <input className="search-input"
          placeholder={type==='live' ? 'Search role... e.g. React developer, Data Scientist' : 'Search jobs, companies...'}
          value={search} onChange={e => setSearch(e.target.value)}/>
        {search && <button type="button" className="clear-btn" onClick={() => { setSearch(''); if(type!=='live') loadDB(type,'',category,1) }}><X size={15}/></button>}
        <button type="submit" className="btn btn-primary btn-sm">
          {type==='live' ? <><Zap size={13}/> Search</> : 'Search'}
        </button>
      </form>

      {liveError && <div className="alert alert-error" style={{marginBottom:12}}>{liveError}</div>}

      {loading ? (
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:60,gap:12}}>
          <Spinner size={36}/>
          {type==='live' && <p style={{color:'var(--text-muted)',fontSize:13}}>Fetching live jobs from Adzuna...</p>}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState icon="🔍" title="No jobs found" subtitle="Try a different search or filter"/>
      ) : (
        <>
          {isLive && (
            <div className="alert alert-success" style={{marginBottom:14}}>
              ✅ Showing <strong>{jobs.length} real-time jobs</strong> from Adzuna India
            </div>
          )}
          <div className="jobs-grid">
            {jobs.map(job => (
              <JobCard key={job.id} job={job}
                onClick={() => {
                  if (job.is_live) window.open(job.apply_url,'_blank','noopener')
                  else navigate(`/jobs/${job.id}`)
                }}/>
            ))}
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button className="btn btn-secondary btn-sm" disabled={page===1}
              onClick={() => isLive ? loadLive(liveRole,liveLocation,page-1) : loadDB(type,search,category,page-1)}>
              ← Prev
            </button>
            <span style={{fontSize:13,color:'var(--text-muted)'}}>Page {page}</span>
            <button className="btn btn-secondary btn-sm" disabled={jobs.length < 12}
              onClick={() => isLive ? loadLive(liveRole,liveLocation,page+1) : loadDB(type,search,category,page+1)}>
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export function JobCard({ job, onClick }) {
  return (
    <Card className="job-card" onClick={onClick}>
      <div className="job-card-top">
        <span className={`job-type-tag tag-${job.job_type||'private'}`}>
          {job.job_type==='government'?'🏛️':job.job_type==='internship'?'🎓':'💼'} {job.job_type||'private'}
        </span>
        <div style={{display:'flex',gap:5,alignItems:'center'}}>
          {job.is_live && <span className="badge badge-green" style={{fontSize:10}}>⚡ LIVE</span>}
          {job.is_demo && <DemoBadge/>}
        </div>
      </div>
      <h3 className="job-title">{job.title}</h3>
      <p className="job-company">{job.company_name||'—'}</p>
      <div className="job-meta">
        {job.location && <span><MapPin size={11}/> {job.location}</span>}
        {job.application_end && <span><Clock size={11}/> {job.application_end?.slice(0,10)}</span>}
      </div>
      {job.required_skills?.length > 0 && (
        <div className="skill-chips">
          {job.required_skills.slice(0,3).map(s => <span key={s} className="badge badge-blue" style={{fontSize:11}}>{s}</span>)}
          {job.required_skills.length>3 && <span className="badge badge-gray" style={{fontSize:11}}>+{job.required_skills.length-3}</span>}
        </div>
      )}
      <div className="job-card-footer">
        {job.salary_display && <span className="salary">💰 {job.salary_display}</span>}
        {job.match_score && <MatchScore score={job.match_score}/>}
        {job.is_live && (
          <span style={{fontSize:11,color:'var(--primary)',display:'flex',alignItems:'center',gap:3}}>
            <ExternalLink size={11}/> Apply on company site
          </span>
        )}
      </div>
    </Card>
  )
}
