import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Play, FileText, Download, ExternalLink, BookOpen, Video } from 'lucide-react'
import api from '../api'
import { Card, Spinner, EmptyState, DemoBadge } from '../components/Card'
import '../components/common.css'
import './Exams.css'

// ── PDF download links for all exams (official sources) ───────────────────────
const EXAM_RESOURCES = {
  'SSC CGL': {
    pdf: [
      { title: 'SSC CGL Official Notification 2024', url: 'https://ssc.nic.in/Portal/Pdf/Notification_CGLE_2024.pdf', size: '2.1 MB' },
      { title: 'SSC CGL Syllabus PDF', url: 'https://ssc.nic.in', size: 'Official Site' },
      { title: 'Previous Year Papers (2023)', url: 'https://ssc.nic.in/Portal/Pdf/PaperI_CGLE2023.pdf', size: '1.8 MB' },
    ],
    videos: [
      { title: 'SSC CGL 2024 Complete Strategy', search: 'SSC CGL 2024 preparation strategy complete guide' },
      { title: 'Quantitative Aptitude for SSC', search: 'quantitative aptitude SSC CGL tricks shortcuts' },
      { title: 'General Awareness SSC CGL', search: 'general awareness SSC CGL 2024' },
    ],
    officialUrl: 'https://ssc.nic.in',
  },
  'SSC CHSL': {
    pdf: [
      { title: 'SSC CHSL Official Notification', url: 'https://ssc.nic.in', size: 'Official Site' },
      { title: 'SSC CHSL Syllabus 2024', url: 'https://ssc.nic.in', size: 'Official Site' },
    ],
    videos: [
      { title: 'SSC CHSL Complete Preparation', search: 'SSC CHSL 2024 preparation guide beginners' },
      { title: 'English for SSC CHSL', search: 'English grammar SSC CHSL preparation' },
    ],
    officialUrl: 'https://ssc.nic.in',
  },
  'SSC MTS': {
    pdf: [
      { title: 'SSC MTS Official Notification', url: 'https://ssc.nic.in', size: 'Official Site' },
      { title: 'SSC MTS Syllabus PDF', url: 'https://ssc.nic.in', size: 'Official Site' },
    ],
    videos: [
      { title: 'SSC MTS Preparation for Beginners', search: 'SSC MTS 2024 preparation 10th pass' },
    ],
    officialUrl: 'https://ssc.nic.in',
  },
  'UPSC CSE': {
    pdf: [
      { title: 'UPSC CSE Official Notification 2024', url: 'https://upsc.gov.in/sites/default/files/Notif-CSP-2024-Engl.pdf', size: '1.2 MB' },
      { title: 'UPSC Syllabus for Prelims & Mains', url: 'https://upsc.gov.in/sites/default/files/Syllbs-CSE-IFS.pdf', size: '0.8 MB' },
      { title: 'UPSC Previous Year Question Papers', url: 'https://upsc.gov.in/examinations/previous-question-papers', size: 'Multiple PDFs' },
    ],
    videos: [
      { title: 'UPSC CSE Strategy by Toppers', search: 'UPSC CSE preparation strategy 2024 beginners' },
      { title: 'NCERT Summary for UPSC', search: 'NCERT summary for UPSC prelims all subjects' },
      { title: 'Current Affairs for UPSC 2024', search: 'current affairs UPSC 2024 monthly compilation' },
    ],
    officialUrl: 'https://upsc.gov.in',
  },
  'TNPSC G2': {
    pdf: [
      { title: 'TNPSC Group 2 Notification', url: 'https://tnpsc.gov.in', size: 'Official Site' },
      { title: 'TNPSC Group 2 Syllabus Tamil', url: 'https://tnpsc.gov.in', size: 'Official Site' },
      { title: 'TNPSC Previous Papers', url: 'https://tnpsc.gov.in', size: 'Official Site' },
    ],
    videos: [
      { title: 'TNPSC Group 2 Preparation Tamil', search: 'TNPSC Group 2 preparation Tamil medium 2024' },
      { title: 'TNPSC GK Tamil Nadu History', search: 'TNPSC Tamil Nadu history culture questions' },
    ],
    officialUrl: 'https://tnpsc.gov.in',
  },
  'TNPSC G1': {
    pdf: [
      { title: 'TNPSC Group 1 Notification', url: 'https://tnpsc.gov.in', size: 'Official Site' },
      { title: 'TNPSC Group 1 Syllabus', url: 'https://tnpsc.gov.in', size: 'Official Site' },
    ],
    videos: [
      { title: 'TNPSC Group 1 Strategy', search: 'TNPSC Group 1 preparation strategy 2024' },
    ],
    officialUrl: 'https://tnpsc.gov.in',
  },
  'TNPSC G4': {
    pdf: [
      { title: 'TNPSC Group 4 Notification', url: 'https://tnpsc.gov.in', size: 'Official Site' },
      { title: 'Samacheer Kalvi Study Material', url: 'https://tnpsc.gov.in', size: 'Official Site' },
    ],
    videos: [
      { title: 'TNPSC Group 4 VAO Preparation', search: 'TNPSC Group 4 VAO preparation Tamil 2024' },
    ],
    officialUrl: 'https://tnpsc.gov.in',
  },
  'SBI Clerk': {
    pdf: [
      { title: 'SBI Clerk Official Notification', url: 'https://sbi.co.in/web/careers/recruitment-notification', size: 'Official Site' },
      { title: 'SBI Clerk Syllabus PDF', url: 'https://sbi.co.in', size: 'Official Site' },
    ],
    videos: [
      { title: 'SBI Clerk Preparation 2024', search: 'SBI clerk 2024 preparation strategy prelims mains' },
      { title: 'Data Interpretation for Banking', search: 'data interpretation tricks banking exams 2024' },
      { title: 'Reasoning for Bank Clerk', search: 'reasoning tricks bank clerk exam 2024' },
    ],
    officialUrl: 'https://sbi.co.in',
  },
  'IBPS PO': {
    pdf: [
      { title: 'IBPS PO Official Notification', url: 'https://ibps.in', size: 'Official Site' },
      { title: 'IBPS PO Syllabus & Pattern', url: 'https://ibps.in', size: 'Official Site' },
    ],
    videos: [
      { title: 'IBPS PO Complete Preparation', search: 'IBPS PO 2024 preparation complete guide' },
      { title: 'Quantitative Aptitude Banking', search: 'quantitative aptitude tricks IBPS PO 2024' },
    ],
    officialUrl: 'https://ibps.in',
  },
  'IBPS Clerk': {
    pdf: [
      { title: 'IBPS Clerk Notification', url: 'https://ibps.in', size: 'Official Site' },
    ],
    videos: [
      { title: 'IBPS Clerk Preparation Guide', search: 'IBPS clerk 2024 preparation guide' },
    ],
    officialUrl: 'https://ibps.in',
  },
  'CDS': {
    pdf: [
      { title: 'CDS Official Notification', url: 'https://upsc.gov.in', size: 'Official Site' },
      { title: 'CDS Syllabus PDF', url: 'https://upsc.gov.in/sites/default/files/Syllbs-CSE-IFS.pdf', size: 'Official Site' },
    ],
    videos: [
      { title: 'CDS Exam Preparation Strategy', search: 'CDS exam preparation 2024 strategy tips' },
      { title: 'Mathematics for CDS', search: 'mathematics CDS exam preparation 2024' },
    ],
    officialUrl: 'https://upsc.gov.in',
  },
  'NDA': {
    pdf: [
      { title: 'NDA Official Notification', url: 'https://upsc.gov.in', size: 'Official Site' },
      { title: 'NDA Mathematics Syllabus', url: 'https://upsc.gov.in', size: 'Official Site' },
    ],
    videos: [
      { title: 'NDA Exam Complete Guide 12th Students', search: 'NDA exam preparation 2024 12th students complete guide' },
      { title: 'NDA Mathematics Preparation', search: 'NDA mathematics preparation 2024 PCM' },
    ],
    officialUrl: 'https://upsc.gov.in',
  },
  'CTET': {
    pdf: [
      { title: 'CTET Official Notification', url: 'https://ctet.nic.in', size: 'Official Site' },
      { title: 'CTET Syllabus Paper 1 & 2', url: 'https://ctet.nic.in', size: 'Official Site' },
    ],
    videos: [
      { title: 'CTET Paper 1 Complete Preparation', search: 'CTET paper 1 preparation 2024 child development' },
      { title: 'Child Development Pedagogy CTET', search: 'child development pedagogy CTET important topics' },
    ],
    officialUrl: 'https://ctet.nic.in',
  },
  'TN TET': {
    pdf: [
      { title: 'TN TET Official Notification', url: 'https://trb.tn.gov.in', size: 'Official Site' },
    ],
    videos: [
      { title: 'TN TET Preparation Tamil', search: 'TN TET preparation Tamil 2024 paper 1 paper 2' },
    ],
    officialUrl: 'https://trb.tn.gov.in',
  },
  'RRB JE': {
    pdf: [
      { title: 'RRB JE Official Notification', url: 'https://indianrailways.gov.in', size: 'Official Site' },
      { title: 'RRB JE Syllabus Technical', url: 'https://indianrailways.gov.in', size: 'Official Site' },
    ],
    videos: [
      { title: 'RRB JE Preparation Guide', search: 'RRB JE 2024 preparation strategy electrical civil' },
    ],
    officialUrl: 'https://indianrailways.gov.in',
  },
  'CAPF AC': {
    pdf: [
      { title: 'CAPF AC Official Notification', url: 'https://upsc.gov.in', size: 'Official Site' },
      { title: 'CAPF AC Syllabus PDF', url: 'https://upsc.gov.in', size: 'Official Site' },
    ],
    videos: [
      { title: 'CAPF AC Preparation Strategy', search: 'CAPF AC preparation 2024 BSF CRPF CISF' },
    ],
    officialUrl: 'https://upsc.gov.in',
  },
}

export default function Exams() {
  const navigate = useNavigate()
  const [exams, setExams]       = useState([])
  const [selected, setSelected] = useState(null)
  const [materials, setMaterials] = useState([])
  const [tests, setTests]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState('overview')
  const [category, setCategory] = useState('All')
  const CATS = ['All','SSC','UPSC','TNPSC','Banking','Railway','Defence','Teaching']

  useEffect(() => {
    api.get('/exams').then(r => {
      const data = r.data.data || []
      setExams(data)
      if (data.length) selectExam(data[0])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const selectExam = async (exam) => {
    setSelected(exam); setTab('overview')
    try {
      const [mats, tsts] = await Promise.allSettled([
        api.get(`/exams/${exam.id}/materials`),
        api.get(`/exams/${exam.id}/tests`),
      ])
      setMaterials(mats.status === 'fulfilled' ? mats.value.data.data || [] : [])
      setTests(tsts.status === 'fulfilled' ? tsts.value.data.data || [] : [])
    } catch { setMaterials([]); setTests([]) }
  }

  const filtered = category === 'All' ? exams : exams.filter(e => e.category === category)
  const resources = selected ? (EXAM_RESOURCES[selected.short_name] || EXAM_RESOURCES[selected.name] || null) : null

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:60}}><Spinner size={32}/></div>

  return (
    <div className="exams-layout">
      {/* Left: exam list */}
      <aside className="exam-list">
        <div className="page-header" style={{marginBottom:12}}>
          <h1 style={{fontSize:18}}>📚 Exam Prep</h1>
        </div>
        <div className="chip-row" style={{marginBottom:12}}>
          {CATS.map(c => (
            <button key={c} className={`chip ${category===c?'active':''}`}
              style={{fontSize:11,padding:'3px 10px'}}
              onClick={() => setCategory(c)}>{c}</button>
          ))}
        </div>
        {filtered.map(exam => (
          <div key={exam.id}
            className={`exam-list-item ${selected?.id===exam.id?'active':''}`}
            onClick={() => selectExam(exam)}>
            <div className="exam-badge">{exam.short_name?.slice(0,4) || exam.name.slice(0,3)}</div>
            <div className="exam-info">
              <p className="exam-name">{exam.name}</p>
              <p className="exam-body">{exam.conducting_body}</p>
              {exam.is_demo && <DemoBadge />}
            </div>
            <ChevronRight size={14} className="exam-arrow"/>
          </div>
        ))}
      </aside>

      {/* Right: detail */}
      <div className="exam-detail">
        {!selected ? (
          <EmptyState icon="📚" title="Select an exam" subtitle="Choose from the list"/>
        ) : (
          <>
            <div className="exam-header">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:10}}>
                <div>
                  <h2>{selected.name}</h2>
                  <p>{selected.conducting_body}</p>
                </div>
                {resources?.officialUrl && (
                  <a href={resources.officialUrl} target="_blank" rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm">
                    <ExternalLink size={13}/> Official Website
                  </a>
                )}
              </div>
            </div>

            <div className="tabs">
              {[['overview','📋 Overview'],['materials','📖 Materials'],['pdf','📥 Downloads'],['videos','🎥 Videos'],['tests','📝 Mock Tests']].map(([v,l]) => (
                <button key={v} className={`tab ${tab===v?'active':''}`} onClick={() => setTab(v)}>{l}</button>
              ))}
            </div>

            {/* Overview */}
            {tab === 'overview' && (
              <div className="exam-overview">
                {selected.description && (
                  <Card>
                    <p style={{fontSize:14,lineHeight:1.8,color:'var(--text-muted)',whiteSpace:'pre-wrap'}}>
                      {selected.description.replace('[DEMO] ','').replace('[DEMO DATA] ','')}
                    </p>
                  </Card>
                )}
                {selected.subjects?.length > 0 && (
                  <Card>
                    <h3 style={{marginBottom:14,fontWeight:700}}>📘 Subjects & Weightage</h3>
                    {selected.subjects.map((s,i) => (
                      <div key={s.id} className="subject-row">
                        <span className="subject-num">{i+1}</span>
                        <span className="subject-name">{s.name}</span>
                        {s.weightage && (
                          <div style={{flex:1,margin:'0 12px'}}>
                            <div style={{height:6,background:'#E5E7EB',borderRadius:3,overflow:'hidden'}}>
                              <div style={{height:'100%',width:`${s.weightage}%`,background:'var(--primary)',borderRadius:3}}/>
                            </div>
                          </div>
                        )}
                        {s.weightage && <span className="subject-weight">{s.weightage}%</span>}
                      </div>
                    ))}
                  </Card>
                )}
              </div>
            )}

            {/* Materials (from DB) */}
            {tab === 'materials' && (
              <div>
                {materials.length === 0 ? (
                  <EmptyState icon="📖" title="No materials yet" subtitle="Check Downloads tab for PDF resources"/>
                ) : materials.map(m => (
                  <Card key={m.id} style={{marginBottom:12}}>
                    <div style={{display:'flex',alignItems:'flex-start',gap:12}}>
                      <div className="mat-icon"><FileText size={20}/></div>
                      <div style={{flex:1}}>
                        <p style={{fontWeight:600,fontSize:14,marginBottom:6}}>{m.title}</p>
                        {m.content_text && (
                          <div style={{background:'var(--bg)',borderRadius:8,padding:12,fontSize:13,lineHeight:1.8,
                            color:'var(--text-muted)',whiteSpace:'pre-wrap',maxHeight:300,overflowY:'auto'}}>
                            {m.content_text.replace('[DEMO CONTENT] ','').replace('[DEMO] ','')}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* PDF Downloads */}
            {tab === 'pdf' && (
              <div>
                <div className="alert alert-info" style={{marginBottom:16}}>
                  📌 These links open official government websites. Always verify and download from official sources only.
                </div>
                {resources?.pdf ? (
                  resources.pdf.map((pdf, i) => (
                    <Card key={i} style={{marginBottom:12}}>
                      <div style={{display:'flex',alignItems:'center',gap:14}}>
                        <div style={{width:44,height:44,borderRadius:10,background:'#FFF5F5',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                          <FileText size={22} color="var(--red)"/>
                        </div>
                        <div style={{flex:1}}>
                          <p style={{fontWeight:600,fontSize:14}}>{pdf.title}</p>
                          <p style={{fontSize:12,color:'var(--text-muted)',marginTop:2}}>Size: {pdf.size}</p>
                        </div>
                        <a href={pdf.url} target="_blank" rel="noopener noreferrer"
                          className="btn btn-primary btn-sm">
                          <Download size={13}/> Download / View
                        </a>
                      </div>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <div style={{textAlign:'center',padding:24}}>
                      <p style={{fontSize:14,color:'var(--text-muted)',marginBottom:12}}>
                        Visit the official website for PDF downloads
                      </p>
                      {selected.official_url && (
                        <a href={selected.official_url} target="_blank" rel="noopener noreferrer"
                          className="btn btn-primary">
                          <ExternalLink size={14}/> Go to Official Website
                        </a>
                      )}
                    </div>
                  </Card>
                )}

                {/* User-uploaded materials section */}
                <Card style={{marginTop:16,background:'#F0FDF4',border:'1.5px solid #BBF7D0'}}>
                  <h3 style={{fontWeight:700,marginBottom:8,color:'var(--green)'}}>📤 Share Your Notes</h3>
                  <p style={{fontSize:13,color:'var(--text-muted)',marginBottom:12}}>
                    Help other students by sharing your study notes and materials!
                  </p>
                  <button className="btn btn-green btn-sm" onClick={() => window.location.href='/ai'}>
                    🤖 Ask AI to Generate Study Notes
                  </button>
                </Card>
              </div>
            )}

            {/* Videos */}
            {tab === 'videos' && (
              <div>
                <div className="alert alert-info" style={{marginBottom:16}}>
                  🎥 Click to search for these topics on YouTube
                </div>
                {resources?.videos ? (
                  resources.videos.map((v, i) => (
                    <Card key={i} style={{marginBottom:12}}>
                      <div style={{display:'flex',alignItems:'center',gap:14}}>
                        <div style={{width:44,height:44,borderRadius:10,background:'#FFF5F5',display:'flex',
                          alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:22}}>
                          🎥
                        </div>
                        <div style={{flex:1}}>
                          <p style={{fontWeight:600,fontSize:14}}>{v.title}</p>
                          <p style={{fontSize:12,color:'var(--text-muted)',marginTop:2}}>YouTube Search</p>
                        </div>
                        <a
                          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(v.search)}`}
                          target="_blank" rel="noopener noreferrer"
                          className="btn btn-primary btn-sm">
                          <Video size={13}/> Watch
                        </a>
                      </div>
                    </Card>
                  ))
                ) : (
                  <EmptyState icon="🎥" title="Videos coming soon" subtitle="Use AI Mentor to get video recommendations"/>
                )}
              </div>
            )}

            {/* Mock Tests */}
            {tab === 'tests' && (
              <div>
                {tests.length === 0 ? (
                  <EmptyState icon="📝" title="No mock tests yet" subtitle="Coming soon!"/>
                ) : tests.map(t => (
                  <Card key={t.id} style={{marginBottom:12}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                      <div>
                        <p style={{fontWeight:700,fontSize:15,marginBottom:8}}>{t.title}</p>
                        <div style={{display:'flex',gap:12,fontSize:12,color:'var(--text-muted)'}}>
                          <span>⏱ {t.duration_min} min</span>
                          <span>❓ {t.question_count} questions</span>
                          <span>📊 {t.total_marks} marks</span>
                        </div>
                        {t.is_demo && <div style={{marginTop:6}}><DemoBadge/></div>}
                      </div>
                      <button className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/test/${t.id}`)}>
                        <Play size={13}/> Start
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
