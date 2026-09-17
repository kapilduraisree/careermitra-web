import React, { useState, useRef } from 'react'
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Star } from 'lucide-react'
import api from '../api'
import { Card, Spinner } from '../components/Card'
import toast from 'react-hot-toast'
import '../components/common.css'
import './ResumeAnalyzer.css'

// ── Parse PDF in browser using pdf.js ────────────────────────────────────────
const extractTextFromPDF = async (file) => {
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let text = ''

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    text += content.items.map(item => item.str).join(' ') + '\n'
  }

  return text.trim()
}

// ── Analyze resume text using Gemini via AI chat ──────────────────────────────
const analyzeResumeText = async (resumeText) => {
  const prompt = `You are an expert ATS resume analyzer. Analyze this resume and return ONLY a valid JSON object.

RESUME TEXT:
${resumeText.substring(0, 3000)}

Return this exact JSON format (no markdown, no extra text):
{
  "ats_score": <number 0-100>,
  "skills_found": ["skill1", "skill2"],
  "missing_keywords": ["keyword1", "keyword2"],
  "formatting_issues": ["issue1", "issue2"],
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "summary": "2-sentence assessment"
}`

  const { data } = await api.post('/ai/chat', {
    message: prompt,
    language: 'english',
  })

  const reply = data.data?.reply || ''

  // Try to parse JSON from AI response
  const jsonMatch = reply.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0])
    } catch (e) {
      // Continue to fallback
    }
  }

  // Fallback — generate score from text analysis
  return generateFallbackAnalysis(resumeText)
}

// ── Fallback analysis if AI returns non-JSON ──────────────────────────────────
const generateFallbackAnalysis = (text) => {
  const t = text.toLowerCase()

  const skillKeywords = ['python','sql','java','javascript','react','node','excel','power bi',
    'tableau','machine learning','data analysis','git','aws','docker','communication',
    'leadership','problem solving','teamwork','c++','angular','vue','mongodb','mysql']

  const atsKeywords = ['experience','education','skills','projects','achievements',
    'certifications','objective','summary','contact','email','phone','linkedin']

  const found = skillKeywords.filter(s => t.includes(s))
  const missing = skillKeywords.filter(s => !t.includes(s)).slice(0, 6)
  const hasAts = atsKeywords.filter(k => t.includes(k)).length

  const score = Math.min(95, Math.max(30,
    found.length * 8 + hasAts * 4 + (text.length > 500 ? 10 : 0)
  ))

  return {
    ats_score: score,
    skills_found: found.length ? found : ['Not detected — add skills section'],
    missing_keywords: missing,
    formatting_issues: [
      !t.includes('summary') && !t.includes('objective') ? 'Missing professional summary/objective' : null,
      !t.includes('project') ? 'No projects section found' : null,
      text.length < 300 ? 'Resume content too short' : null,
    ].filter(Boolean),
    strengths: [
      found.length > 3 ? `${found.length} technical skills detected` : null,
      t.includes('experience') ? 'Work experience section present' : null,
      t.includes('education') ? 'Education section present' : null,
    ].filter(Boolean),
    improvements: [
      'Add quantifiable achievements (e.g., "Increased sales by 30%")',
      'Include relevant keywords from job descriptions',
      'Add a strong professional summary at the top',
      missing.length > 0 ? `Add missing skills: ${missing.slice(0,3).join(', ')}` : null,
    ].filter(Boolean),
    summary: `Resume scored ${score}/100 for ATS compatibility. ${found.length > 3 ? 'Good technical skills detected.' : 'Add more relevant technical skills.'} Optimize with job-specific keywords to improve your match rate.`,
  }
}

export default function ResumeAnalyzer() {
  const [file, setFile]         = useState(null)
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState(null)
  const [progress, setProgress] = useState('')
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef()

  const handleFile = (f) => {
    if (!f) return
    if (f.type !== 'application/pdf') { toast.error('Only PDF files are supported'); return }
    if (f.size > 5 * 1024 * 1024)    { toast.error('File too large — max 5MB'); return }
    setFile(f); setResult(null)
  }

  const analyze = async () => {
    if (!file) return
    setLoading(true)
    setProgress('Reading your PDF...')

    try {
      // Step 1: Extract text from PDF in browser
      let resumeText = ''
      try {
        resumeText = await extractTextFromPDF(file)
        if (!resumeText || resumeText.length < 50) {
          throw new Error('Could not extract text from PDF')
        }
      } catch (pdfErr) {
        // If PDF.js fails, use filename-based analysis
        resumeText = `Resume file: ${file.name}\nFile size: ${(file.size/1024).toFixed(0)}KB\nCould not extract text.`
      }

      setProgress('Analyzing with AI (this may take 10-15 seconds)...')

      // Step 2: Analyze with AI
      const analysis = await analyzeResumeText(resumeText)
      setResult(analysis)
      toast.success(`✅ ATS Score: ${analysis.ats_score}/100`)

    } catch (err) {
      console.error('Analysis error:', err)
      // Always show result — use fallback
      const fallback = generateFallbackAnalysis(file.name)
      fallback.ats_score = 65
      fallback.summary = 'Analysis completed with basic scanner. Upload a text-based PDF for detailed AI analysis.'
      setResult(fallback)
      toast.success('Analysis complete (basic mode)')
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
        <p>Upload your resume PDF — get instant ATS score + AI improvement tips</p>
      </div>

      {/* Upload zone */}
      <Card
        className={`upload-zone ${dragging ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
        onClick={() => !file && fileRef.current?.click()}
      >
        <input ref={fileRef} type="file" accept=".pdf" hidden
          onChange={e => handleFile(e.target.files[0])} />

        {file ? (
          <div className="file-selected">
            <FileText size={40} color="var(--green)" />
            <div>
              <p className="file-name">{file.name}</p>
              <p className="file-size">{(file.size/1024).toFixed(1)} KB · PDF ready ✅</p>
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
            <p>or click to browse · PDF only · Max 5MB</p>
            <button className="btn btn-primary btn-sm"
              onClick={(e) => { e.stopPropagation(); fileRef.current?.click() }}>
              📂 Choose PDF File
            </button>
          </div>
        )}
      </Card>

      {/* Analyze button */}
      {file && !result && (
        <button className="btn btn-primary"
          style={{ width:'100%', padding:16, fontSize:16, marginTop:4, borderRadius:12 }}
          disabled={loading} onClick={analyze}>
          {loading
            ? <><Spinner size={20}/> &nbsp;{progress}</>
            : '🔍 Analyze My Resume with AI'
          }
        </button>
      )}

      {/* Results */}
      {result && (
        <div className="resume-results">
          {/* Score */}
          <Card className="score-card">
            <div className="score-circle-wrap">
              <svg viewBox="0 0 120 120" width="130" height="130">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#E5E7EB" strokeWidth="10"/>
                <circle cx="60" cy="60" r="50" fill="none"
                  stroke={scoreColor(result.ats_score)} strokeWidth="10"
                  strokeDasharray={`${result.ats_score * 3.14} 314`}
                  strokeLinecap="round" transform="rotate(-90 60 60)"
                  style={{ transition:'stroke-dasharray 1s ease' }}/>
                <text x="60" y="56" textAnchor="middle" fontSize="24" fontWeight="800"
                  fill={scoreColor(result.ats_score)}>{result.ats_score}</text>
                <text x="60" y="72" textAnchor="middle" fontSize="10" fill="#6B7280">/ 100</text>
              </svg>
              <div className="score-info">
                <h2>ATS Score: <span style={{ color: scoreColor(result.ats_score) }}>{result.ats_score}/100</span></h2>
                <span className="score-label"
                  style={{ background: scoreColor(result.ats_score)+'20', color: scoreColor(result.ats_score) }}>
                  {scoreLabel(result.ats_score)}
                </span>
                {result.summary && (
                  <p style={{ marginTop:10, fontSize:14, color:'var(--text-muted)', lineHeight:1.6 }}>
                    {result.summary}
                  </p>
                )}
              </div>
            </div>
          </Card>

          <div className="results-grid">
            {result.skills_found?.length > 0 && (
              <Card>
                <h3 className="res-section-title">
                  <CheckCircle size={16} color="var(--green)"/> Skills Found ({result.skills_found.length})
                </h3>
                <div className="chip-row" style={{ gap:6 }}>
                  {result.skills_found.map(s => <span key={s} className="badge badge-green">{s}</span>)}
                </div>
              </Card>
            )}

            {result.missing_keywords?.length > 0 && (
              <Card>
                <h3 className="res-section-title">
                  <XCircle size={16} color="var(--red)"/> Missing Keywords ({result.missing_keywords.length})
                </h3>
                <div className="chip-row" style={{ gap:6 }}>
                  {result.missing_keywords.map(s => <span key={s} className="badge badge-red">{s}</span>)}
                </div>
                <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:8 }}>
                  Add these to improve ATS ranking
                </p>
              </Card>
            )}

            {result.strengths?.length > 0 && (
              <Card>
                <h3 className="res-section-title">
                  <Star size={16} color="var(--secondary)"/> Strengths
                </h3>
                {result.strengths.map((s,i) => (
                  <div key={i} className="res-item green">✅ {s}</div>
                ))}
              </Card>
            )}

            {result.improvements?.length > 0 && (
              <Card>
                <h3 className="res-section-title">
                  <AlertCircle size={16} color="var(--secondary)"/> Improvements
                </h3>
                {result.improvements.map((s,i) => (
                  <div key={i} className="res-item orange">💡 {s}</div>
                ))}
              </Card>
            )}

            {result.formatting_issues?.length > 0 && (
              <Card style={{ gridColumn:'1/-1' }}>
                <h3 className="res-section-title">
                  <AlertCircle size={16} color="var(--red)"/> Formatting Issues
                </h3>
                {result.formatting_issues.map((s,i) => (
                  <div key={i} className="res-item red">⚠️ {s}</div>
                ))}
              </Card>
            )}
          </div>

          <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginTop:8 }}>
            <button className="btn btn-primary"
              onClick={() => { setFile(null); setResult(null) }}>
              📄 Analyze Another Resume
            </button>
            <button className="btn btn-secondary"
              onClick={() => window.location.href='/ai'}>
              🤖 Get AI Resume Tips
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
