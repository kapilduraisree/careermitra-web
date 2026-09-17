/**
 * Adzuna API service — called directly from frontend
 * India jobs — real-time data
 */

const APP_ID  = '6625b2f4'
const APP_KEY = '1949ae2ef7164e80b5563d44c9db9806'
const BASE    = 'https://api.adzuna.com/v1/api/jobs/in/search'

export const searchAdzunaJobs = async (query = 'software developer', location = 'india', page = 1) => {
  const params = new URLSearchParams({
    app_id:           APP_ID,
    app_key:          APP_KEY,
    results_per_page: 15,
    what:             query,
    where:            location,
    'content-type':   'application/json',
    sort_by:          'date',
  })

  const url = `${BASE}/${page}?${params}`

  const response = await fetch(url)
  if (!response.ok) throw new Error(`Adzuna error: ${response.status}`)

  const data = await response.json()

  return (data.results || []).map(job => ({
    id:             `adzuna_${job.id}`,
    title:          job.title,
    company_name:   job.company?.display_name || 'Company',
    location:       job.location?.display_name || job.location?.area?.slice(0, 2).join(', ') || 'India',
    description:    (job.description || '').substring(0, 250) + '...',
    salary_display: formatSalary(job.salary_min, job.salary_max),
    apply_url:      job.redirect_url,
    job_type:       'private',
    category:       getCategory(job.category?.label),
    posted_at:      job.created,
    is_demo:        false,
    is_live:        true,
    source:         'adzuna',
    required_skills: [],
    total:          data.count,
  }))
}

const formatSalary = (min, max) => {
  if (!min && !max) return null
  const fmt = n => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${(n / 1000).toFixed(0)}K`
  if (min && max) return `${fmt(min)} – ${fmt(max)}`
  if (min) return `${fmt(min)}+`
  return null
}

const getCategory = (label = '') => {
  const l = label.toLowerCase()
  if (l.includes('engineer') || l.includes('software') || l.includes('developer')) return 'IT'
  if (l.includes('data') || l.includes('analyst')) return 'Analytics'
  if (l.includes('finance') || l.includes('account')) return 'Finance'
  if (l.includes('marketing') || l.includes('sales')) return 'Marketing'
  if (l.includes('design')) return 'Design'
  if (l.includes('hr') || l.includes('human')) return 'HR'
  return 'IT'
}
