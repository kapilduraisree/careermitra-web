import React, { useEffect, useState } from 'react'
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, ExternalLink, RefreshCw } from 'lucide-react'
import api from '../api'
import { Card, Spinner, EmptyState, Badge } from '../components/Card'
import toast from 'react-hot-toast'
import '../components/common.css'

const STATUSES = ['all','saved','applied','assessment','interview','selected','rejected']
const STATUS_COLOR = { saved:'blue', applied:'blue', assessment:'orange', interview:'purple', selected:'green', rejected:'red' }
const STATUS_EMOJI  = { saved:'🔖', applied:'💼', assessment:'📝', interview:'🎤', selected:'✅', rejected:'❌' }

export default function Applications() {
  const navigate = useNavigate()
  const [apps, setApps] = useState([])
  const [summary, setSummary] = useState({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const load = async (s = filter) => {
    setLoading(true)
    const [appsRes, summRes] = await Promise.allSettled([
      api.get('/applications', { params: { status: s === 'all' ? undefined : s } }),
      api.get('/applications/summary'),
    ])
    if (appsRes.status === 'fulfilled') setApps(appsRes.value.data.data || [])
    if (summRes.status === 'fulfilled') setSummary(summRes.value.data.data || {})
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const updateStatus = async (appId, newStatus) => {
    try {
      await api.put(`/applications/${appId}`, { status: newStatus })
      // Update local state
      setApps(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a))
      // Refresh summary counts
      const summRes = await api.get('/applications/summary')
      if (summRes.data?.data) setSummary(summRes.data.data)
      toast.success(`✅ Status updated to "${newStatus}"`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    }
  }

  const deleteApp = async (appId) => {
    try {
      await api.delete(`/applications/${appId}`)
      setApps(prev => prev.filter(a => a.id !== appId))
      // Refresh summary
      const summRes = await api.get('/applications/summary')
      if (summRes.data?.data) setSummary(summRes.data.data)
      toast.success('Removed from tracker')
    } catch (err) {
      toast.error('Failed to remove')
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>📋 Application Tracker</h1>
        <p>Track all your job applications in one place</p>
      </div>

      {/* Summary */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:10, marginBottom:20 }}>
        {['saved','applied','assessment','interview','selected','rejected'].map(s => (
          <Card key={s} style={{ textAlign:'center', padding:'12px 8px', cursor:'pointer', background: filter===s?'#EFF6FF':'white' }}
            onClick={() => { setFilter(s); load(s) }}>
            <div style={{ fontSize:20 }}>{STATUS_EMOJI[s]}</div>
            <div style={{ fontSize:20, fontWeight:800, color:'var(--primary)' }}>{summary[s] || 0}</div>
            <div style={{ fontSize:11, color:'var(--text-muted)', textTransform:'capitalize' }}>{s}</div>
          </Card>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="tabs">
        {STATUSES.map(s => (
          <button key={s} className={`tab ${filter===s?'active':''}`}
            onClick={() => { setFilter(s); load(s) }}>
            {s.charAt(0).toUpperCase()+s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner size={32}/></div>
      ) : apps.length === 0 ? (
        <EmptyState icon="📋" title="No applications yet" subtitle="Save or apply to jobs to track them here" />
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {apps.map(app => (
            <Card key={app.id} style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
              <div style={{ flex:1, minWidth:200, cursor:'pointer' }} onClick={() => navigate(`/jobs/${app.job_id}`)}>
                <p style={{ fontWeight:700, fontSize:15 }}>{app.title}</p>
                <p style={{ fontSize:13, color:'var(--text-muted)' }}>{app.company_name || '—'} • {app.location || '—'}</p>
                {app.application_end && <p style={{ fontSize:11, color:'var(--red)', marginTop:3 }}>⏰ Deadline: {app.application_end?.slice(0,10)}</p>}
              </div>

              <Badge color={STATUS_COLOR[app.status] || 'gray'}>
                {STATUS_EMOJI[app.status]} {app.status.charAt(0).toUpperCase()+app.status.slice(1)}
              </Badge>

              <select className="input" style={{ width:140, padding:'6px 10px', fontSize:13 }}
                value={app.status}
                onChange={e => updateStatus(app.id, e.target.value)}>
                {STATUSES.filter(s => s !== 'all').map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
                ))}
              </select>

              <button className="btn btn-secondary btn-sm" style={{ color:'var(--red)' }}
                onClick={() => deleteApp(app.id)}><Trash2 size={14}/></button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
