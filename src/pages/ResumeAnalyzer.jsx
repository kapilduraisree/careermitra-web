import React, { useState, useRef } from 'react'
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Star, Download } from 'lucide-react'
import api from '../api'
import { Card, Spinner } from '../components/Card'
import toast from 'react-hot-toast'
import '../components/common.css'
import './ResumeAnalyzer.css'

export default function ResumeAnalyzer() {
  const [file, setFile]         = useState(null)
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState(null)
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState('')
  const fileRef = useRef()

  const handleFile = (f) => {
    if (!f) return
    if (f.type !== 'application/pdf') { toast.error('Only PDF files are supported'); return }
    if (f.size > 5 * 1024 * 1024)    { toast.error('File must be under 5MB'); return }
    setFile(f); setResult(null)
  }

  const analyze = async () => {
    if (!file) return
    setLoading(true)
    setProgress('Uploading resume...')

    try {
      // Create FormData properly
      const formData = new FormData()
      formData.append('resume', file, file.name)

      setProgress('Analyzing with AI...')

      const token = localStorage.getItem('accessToken')
      const response = await fetch(
        (import.meta.env.VITE_API_URL || '/api') + '/ai/resume-analysis',
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `Server error ${response.status}`)
      }

      if (data.success && data.data) {
        setResult(data.data)
        toast.success('Resume analyzed successfully! 🎉')
      } else {
        throw new Error(data.message || 'Analysis failed')
      }
    } catch (err) {
      console.error('Resume analysis error:', err)
      toast.error(err.message || 'Analysis failed. Please try again.')
    } finally {
      setLoading(false)
      setProgress('')
    }
  }

  const scoreColor = (s) => s >= 80 ? '#2E7D32' : s >= 60 ? '#FF6F00' : '#C62828'
  const scoreLabel = (s) => s >= 80 ? '🏆 Excellent' : s >= 60 ? '👍 Good' : s >= 40 ? '⚠️ Needs Work' : '❌ Poor'

  return (
    <div className="resume-page">
      <div className="page-header">
        <h1>📄 AI Resume Analyzer</h1>
        <p>Upload your resume PDF and get ATS score + AI-powered improvement suggestions</p>
      </div>

      {/* Upload zone */}
      <Card
        className={`upload-zone ${dragging ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
        onClick={() => !file && fileRef.current?.click()}
      >
        <input
          ref={fileRef} type="file" accept=".pdf" hidden
          onChange={e => handleFile(e.target.files[0])}
        />
        {file ? (
          <div className="file-selected">
            <FileText size={40} color="var(--green)" />
            <div>
              <p className="file-name">{file.name}</p>
              <p className="file-size">{(file.size / 1024).toFixed(1)} KB • PDF</p>
            </div>
            <button className="btn btn-secondary btn-sm"
              onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null) }}>
              Remove
            </button>
          </div>
        ) : (
          <div className="upload-prompt">
            <Upload size={48} color="var(--text-muted)" />
            <h3>Drop your resume PDF here</h3>
            <p>or click to browse · Max 5MB · PDF only</p>
            <button className="btn btn-primary btn-sm"
              onClick={(e) => { e.stopPropagation(); fileRef.current?.click() }}>
              Choose File
            </button>
          </div>
        )}
      </Card>

      {file && !result && (
        <button
          className="btn btn-primary"
          style={{ width:'100%', padding:14, fontSize:16, marginTop:4 }}
          disabled={loading}
          onClick={analyze}
        >
          {loading
            ? <><Spinner size={20}/> {progress || 'Analyzing...'}</>
            : '🔍 Analyze My Resume with AI'
          }
        </button>
      )}

      {/* Results */}
      {result && (
        <div className="resume-results">

          {/* ATS Score ring */}
          <Card className="score-card">
            <div className="score-circle-wrap">
              <svg viewBox="0 0 120 120" width="130" height="130">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#E5E7EB" strokeWidth="10"/>
                <circle cx="60" cy="60" r="50" fill="none"
                  stroke={scoreColor(result.ats_score)} strokeWidth="10"
                  strokeDasharray={`${result.ats_score * 3.14} 314`}
                  strokeLinecap="round" transform="rotate(-90 60 60)"/>
                <text x="60" y="56" textAnchor="middle" fontSize="22" fontWeight="800"
                  fill={scoreColor(result.ats_score)}>{result.ats_score}</text>
                <text x="60" y="72" textAnchor="middle" fontSize="10" fill="#6B7280">/ 100</text>
              </svg>
              <div className="score-info">
                <h2>ATS Score: <span style={{ color: scoreColor(result.ats_score) }}>{result.ats_score}/100</span></h2>
                <span className="score-label" style={{ background: scoreColor(result.ats_score)+'20', color: scoreColor(result.ats_score) }}>
                  {scoreLabel(result.ats_score)}
                </span>
                {result.summary && <p style={{ marginTop:10, fontSize:14, color:'var(--text-muted)', lineHeight:1.6 }}>{result.summary}</p>}
              </div>
            </div>
          </Card>

          <div className="results-grid">
            {/* Skills found */}
            {result.skills_found?.length > 0 && (
              <Card>
                <h3 className="res-section-title">
                  <CheckCircle size={16} color="var(--green)"/>
                  Skills Detected ({result.skills_found.length})
                </h3>
                <div className="chip-row" style={{ gap:6 }}>
                  {result.skills_found.map(s => (
                    <span key={s} className="badge badge-green">{s}</span>
                  ))}
                </div>
              </Card>
            )}

            {/* Missing keywords */}
            {result.missing_keywords?.length > 0 && (
              <Card>
                <h3 className="res-section-title">
                  <XCircle size={16} color="var(--red)"/>
                  Missing Keywords ({result.missing_keywords.length})
                </h3>
                <div className="chip-row" style={{ gap:6 }}>
                  {result.missing_keywords.map(s => (
                    <span key={s} className="badge badge-red">{s}</span>
                  ))}
                </div>
                <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:10 }}>
                  Add these keywords to improve your ATS score
                </p>
              </Card>
            )}

            {/* Strengths */}
            {result.strengths?.length > 0 && (
              <Card>
                <h3 className="res-section-title">
                  <Star size={16} color="var(--secondary)"/>
                  Strengths
                </h3>
                {result.strengths.map((s, i) => (
                  <div key={i} className="res-item green">✅ {s}</div>
                ))}
              </Card>
            )}

            {/* Improvements */}
            {result.improvements?.length > 0 && (
              <Card>
                <h3 className="res-section-title">
                  <AlertCircle size={16} color="var(--secondary)"/>
                  Improvements Needed
                </h3>
                {result.improvements.map((s, i) => (
                  <div key={i} className="res-item orange">💡 {s}</div>
                ))}
              </Card>
            )}

            {/* Formatting issues */}
            {result.formatting_issues?.length > 0 && (
              <Card style={{ gridColumn:'1/-1' }}>
                <h3 className="res-section-title">
                  <AlertCircle size={16} color="var(--red)"/>
                  Formatting Issues
                </h3>
                {result.formatting_issues.map((s, i) => (
                  <div key={i} className="res-item red">⚠️ {s}</div>
                ))}
              </Card>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <button className="btn btn-primary" onClick={() => { setFile(null); setResult(null) }}>
              Analyze Another Resume
            </button>
            <button className="btn btn-secondary" onClick={() => window.location.href='/ai'}>
              🤖 Ask AI for Resume Tips
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
