import React, { useEffect, useState } from 'react'
import { User, Edit2, Plus, X, TrendingUp, Award } from 'lucide-react'
import api from '../api'
import { Card, Spinner, ProgressBar } from '../components/Card'
import toast from 'react-hot-toast'
import '../components/common.css'
import './Profile.css'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [skillInput, setSkillInput] = useState('')
  const [tab, setTab] = useState('info')
  const [form, setForm] = useState({})

  useEffect(() => {
    Promise.allSettled([api.get('/users/profile'), api.get('/users/progress')])
      .then(([p, pr]) => {
        if (p.status === 'fulfilled') {
          const d = p.value.data.data
          setProfile(d)
          setForm({ name: d.name, phone: d.phone || '', qualification: d.qualification || '', preferred_location: d.preferred_location || '', experience_level: d.experience_level || 'fresher', bio: d.bio || '' })
        }
        if (pr.status === 'fulfilled') setProgress(pr.value.data.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const saveProfile = async () => {
    try {
      await api.put('/users/profile', form)
      setProfile({ ...profile, ...form })
      setEditing(false)
      toast.success('Profile updated!')
    } catch { toast.error('Update failed') }
  }

  const addSkill = async () => {
    if (!skillInput.trim()) return
    try {
      const { data } = await api.post('/users/skills', { skill_name: skillInput.trim() })
      const newSkill = { id: data.data.skill_id, name: skillInput.trim() }
      setProfile({ ...profile, skills: [...(profile.skills || []), newSkill] })
      setSkillInput('')
      toast.success(`Skill "${skillInput.trim()}" added!`)
    } catch { toast.error('Failed to add skill') }
  }

  const removeSkill = async (skillId, name) => {
    try {
      await api.delete(`/users/skills/${skillId}`)
      setProfile({ ...profile, skills: profile.skills.filter(s => s.id !== skillId) })
      toast.success(`Removed "${name}"`)
    } catch { toast.error('Failed to remove skill') }
  }

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:60}}><Spinner size={32}/></div>

  const stats = progress?.stats || {}
  const achievements = progress?.achievements || []
  const readiness = profile?.career_readiness || 0

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-hero">
        <div className="avatar-circle">{profile?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
        <div>
          <h1>{profile?.name}</h1>
          <p>{profile?.email}</p>
          <div className="readiness-row">
            <span>Career Readiness: {readiness}%</span>
            <ProgressBar value={readiness} color="white" height={6} />
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="profile-stats">
        {[
          { emoji:'🔥', val: stats.current_streak || 0, label:'Day Streak' },
          { emoji:'⚡', val: stats.xp_total || 0, label:'XP Points' },
          { emoji:'❓', val: stats.questions_done || 0, label:'Questions' },
          { emoji:'📝', val: stats.tests_done || 0, label:'Tests' },
          { emoji:'💼', val: stats.jobs_applied || 0, label:'Applied' },
        ].map(({ emoji, val, label }) => (
          <Card key={label} className="stat-box">
            <span style={{ fontSize:24 }}>{emoji}</span>
            <span className="stat-num">{val}</span>
            <span className="stat-lbl">{label}</span>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs">
        {[['info','👤 Profile'],['skills','🛠️ Skills'],['achievements','🏆 Achievements']].map(([v,l]) => (
          <button key={v} className={`tab ${tab===v?'active':''}`} onClick={() => setTab(v)}>{l}</button>
        ))}
      </div>

      {tab === 'info' && (
        <Card>
          {!editing ? (
            <>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
                <h3 style={{ fontWeight:700 }}>Personal Information</h3>
                <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}><Edit2 size={14}/> Edit</button>
              </div>
              <div className="info-grid">
                {[
                  ['Name', profile?.name],
                  ['Email', profile?.email],
                  ['Phone', profile?.phone || '—'],
                  ['Qualification', profile?.qualification || '—'],
                  ['Experience', profile?.experience_level || '—'],
                  ['Location', profile?.preferred_location || '—'],
                  ['Preferred Job', profile?.preferred_job_type || '—'],
                ].map(([label, val]) => (
                  <div key={label} className="info-item">
                    <span className="info-label">{label}</span>
                    <span className="info-val">{val}</span>
                  </div>
                ))}
              </div>
              {profile?.bio && <><hr className="divider"/><p style={{fontSize:14,lineHeight:1.7,color:'var(--text-muted)'}}>{profile.bio}</p></>}
            </>
          ) : (
            <>
              <h3 style={{ fontWeight:700, marginBottom:20 }}>Edit Profile</h3>
              <div className="edit-grid">
                {[['name','Full Name','text'],['phone','Phone','text'],['qualification','Qualification','text'],['preferred_location','Preferred Location','text']].map(([key,label,type]) => (
                  <div key={key} className="form-group">
                    <label className="label">{label}</label>
                    <input className="input" type={type} value={form[key] || ''} onChange={e => setForm({...form,[key]:e.target.value})}/>
                  </div>
                ))}
                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label className="label">Bio</label>
                  <textarea className="input" rows={3} value={form.bio} onChange={e => setForm({...form,bio:e.target.value})} style={{ resize:'vertical' }}/>
                </div>
              </div>
              <div style={{ display:'flex', gap:10, marginTop:20 }}>
                <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={saveProfile}>Save Changes</button>
              </div>
            </>
          )}
        </Card>
      )}

      {tab === 'skills' && (
        <Card>
          <h3 style={{ fontWeight:700, marginBottom:16 }}>🛠️ My Skills</h3>
          <div style={{ display:'flex', gap:8, marginBottom:16 }}>
            <input className="input" style={{ flex:1 }} placeholder="Add a skill (e.g. Python, SQL)"
              value={skillInput} onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => e.key==='Enter' && addSkill()}/>
            <button className="btn btn-primary btn-sm" onClick={addSkill}><Plus size={15}/> Add</button>
          </div>
          <div className="skill-tags">
            {profile?.skills?.length === 0 && <p style={{fontSize:14,color:'var(--text-muted)'}}>No skills added yet. Add your first skill!</p>}
            {profile?.skills?.map(s => (
              <span key={s.id} className="skill-tag">
                {s.name}
                <button onClick={() => removeSkill(s.id, s.name)}><X size={12}/></button>
              </span>
            ))}
          </div>
        </Card>
      )}

      {tab === 'achievements' && (
        <div>
          {achievements.length === 0 ? (
            <Card>
              <div style={{ textAlign:'center', padding:32 }}>
                <div style={{ fontSize:48, marginBottom:12 }}>🏆</div>
                <h3 style={{ marginBottom:8 }}>No achievements yet</h3>
                <p style={{ color:'var(--text-muted)', fontSize:14 }}>Complete tasks to earn badges!</p>
              </div>
            </Card>
          ) : (
            <div className="achievements-grid">
              {achievements.map((a, i) => (
                <Card key={i} className="achievement-card">
                  <div className="ach-icon">{a.icon}</div>
                  <div>
                    <p style={{ fontWeight:700, fontSize:14 }}>{a.title}</p>
                    <p style={{ fontSize:12, color:'var(--text-muted)' }}>{a.description}</p>
                    <p style={{ fontSize:11, color:'var(--primary)', marginTop:4 }}>+{a.xp_value} XP</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
