import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_URL = 'http://localhost:8080/api/jobs'
const INTERVIEW_API_URL = 'http://localhost:8080/api/interviews'

const today = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const emptyForm = {
  companyName: '',
  jobRole: '',
  status: 'Applied',
  jobLocation: '',
  applicationDate: today(),
}

function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [jobs, setJobs] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [editingJob, setEditingJob] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // INTERVIEW DETAILS
  const [interviews, setInterviews] = useState([])
  const [interviewLoading, setInterviewLoading] = useState(false)
  const [interviewSaving, setInterviewSaving] = useState(false)

  const [showInterviewModal, setShowInterviewModal] = useState(false)
  const [selectedInterview, setSelectedInterview] = useState(null)
  const [editingInterview, setEditingInterview] = useState(null)

  const [interviewForm, setInterviewForm] = useState({
    interviewDate: today(),
    interviewTime: '10:00',
    interviewRound: 'Technical Round',
    interviewStatus: 'Scheduled',
    notes: '',
  })

  const pageTitles = {
    dashboard: 'Dashboard',
    applications: 'My Applications',
    interviews: 'Interviews',
    offers: 'Offers',
    insights: 'Career Insights',
  }

  // LOAD APPLICATIONS
  async function loadJobs() {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(API_URL)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      setJobs(Array.isArray(data) ? data : [])

    } catch (err) {
      console.error(err)
      setError('Unable to load applications. Check your Spring Boot server.')
    } finally {
      setLoading(false)
    }
  }

  // LOAD INTERVIEWS
  async function loadInterviews() {
    try {
      setInterviewLoading(true)

      const response = await fetch(INTERVIEW_API_URL)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      setInterviews(Array.isArray(data) ? data : [])

    } catch (err) {
      console.error(err)
      setError(`Unable to load interviews: ${err.message}`)
    } finally {
      setInterviewLoading(false)
    }
  }

  useEffect(() => {
    loadJobs()
    loadInterviews()
  }, [])

  // DASHBOARD STATISTICS
  const stats = [
    {
      label: 'Total Applications',
      value: jobs.length,
      icon: '▤',
      color: 'icon-gold',
    },
    {
      label: 'Applied',
      value: jobs.filter(j => j.status === 'Applied').length,
      icon: '↗',
      color: 'icon-blue',
    },
    {
      label: 'Interviews',
      value: jobs.filter(job =>
        job.status === 'Interview' ||
        interviews.some(
          interview =>
            Number(interview.jobApplicationId) === Number(job.id)
        )
      ).length,
      icon: '▣',
      color: 'icon-purple',
    },
    {
      label: 'Offers',
      value: jobs.filter(j => j.status === 'Selected').length,
      icon: '★',
      color: 'icon-green',
    },
  ]

  // SEARCH AND FILTER
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const searchText = search.toLowerCase()

      const matchesSearch =
          (job.companyName || '').toLowerCase().includes(searchText) ||
          (job.jobRole || '').toLowerCase().includes(searchText)

      const matchesFilter =
          filter === 'All' || job.status === filter

      return matchesSearch && matchesFilter
    })
  }, [jobs, search, filter])

  // PAGE-SPECIFIC APPLICATIONS
  // Keep applications visible if they have saved interview rounds,
  // even when their application status changes.
  const pageJobs = useMemo(() => {
    if (activePage === 'interviews') {
      return filteredJobs.filter(job =>
          job.status === 'Interview' ||
          interviews.some(
              interview =>
                  Number(interview.jobApplicationId) === Number(job.id)
          )
      )
    }

    if (activePage === 'offers') {
      return filteredJobs.filter(job => job.status === 'Selected')
    }

    return filteredJobs
  }, [activePage, filteredJobs, interviews])

  // OPEN INTERVIEW MODAL
  function openInterviewModal(job, interviewToEdit = null) {
    setSelectedInterview(job)
    setEditingInterview(interviewToEdit)

    setInterviewForm({
      interviewDate: interviewToEdit?.interviewDate || today(),
      interviewTime: interviewToEdit?.interviewTime || '10:00',
      interviewRound: interviewToEdit?.interviewRound || 'Technical Round',
      interviewStatus: interviewToEdit?.interviewStatus || 'Scheduled',
      notes: interviewToEdit?.notes || '',
    })

    setError('')
    setShowInterviewModal(true)
  }

  // SAVE INTERVIEW
  async function saveInterviewDetails(e) {
    e.preventDefault()

    if (!selectedInterview) return

    try {
      setInterviewSaving(true)
      setError('')

      const interviewData = {
        jobApplicationId: selectedInterview.id,
        interviewDate: interviewForm.interviewDate,
        interviewTime: interviewForm.interviewTime,
        interviewRound: interviewForm.interviewRound,
        interviewStatus: interviewForm.interviewStatus,
        notes: interviewForm.notes,
      }

      const isEditing = Boolean(editingInterview)

      const url = isEditing
          ? `${INTERVIEW_API_URL}/${editingInterview.id}`
: INTERVIEW_API_URL

const response = await fetch(url, {
  method: isEditing ? 'PUT' : 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(interviewData),
})

if (!response.ok) {
  const message = await response.text()
  throw new Error(message || `HTTP ${response.status}`)
}

const savedInterview = await response.json()

if (isEditing) {
  setInterviews(previous =>
      previous.map(interview =>
          Number(interview.id) === Number(savedInterview.id)
              ? savedInterview
              : interview
      )
  )
} else {
  setInterviews(previous => [...previous, savedInterview])
}

setShowInterviewModal(false)
setSelectedInterview(null)
setEditingInterview(null)

} catch (err) {
  console.error(err)
  setError(`Unable to save interview: ${err.message}`)
} finally {
  setInterviewSaving(false)
}
}

// DELETE ONE INTERVIEW ROUND
async function handleDeleteInterview(interviewId) {
  const confirmed = window.confirm(
      'Are you sure you want to delete this interview round?'
  )

  if (!confirmed) return

  try {
    setError('')

    const response = await fetch(
        `${INTERVIEW_API_URL}/${interviewId}`,
        { method: 'DELETE' }
    )

    if (!response.ok) {
      const message = await response.text()
      throw new Error(message || `HTTP ${response.status}`)
    }

    setInterviews(previous =>
        previous.filter(
            interview => Number(interview.id) !== Number(interviewId)
        )
    )

  } catch (err) {
    console.error(err)
    setError(`Unable to delete interview: ${err.message}`)
  }
}

// FORMAT INTERVIEW TIME
function formatInterviewTime(time) {
  if (!time) return '—'

  const [hours, minutes] = time.split(':')
  const date = new Date()

  date.setHours(Number(hours), Number(minutes), 0, 0)

  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// NAVIGATION
function navigateTo(page) {
  setActivePage(page)
  setSearch('')
  setFilter('All')
  setError('')
}

// OPEN ADD APPLICATION MODAL
function openAddModal() {
  setEditingJob(null)
  setForm({ ...emptyForm, applicationDate: today() })
  setError('')
  setShowModal(true)
}

// OPEN EDIT APPLICATION MODAL
function openEditModal(job) {
  setEditingJob(job)

  setForm({
    companyName: job.companyName || '',
    jobRole: job.jobRole || '',
    status: job.status || 'Applied',
    jobLocation: job.jobLocation || '',
    applicationDate: job.applicationDate || today(),
  })

  setError('')
  setShowModal(true)
}

// ADD OR UPDATE APPLICATION
async function handleSubmit(e) {
  e.preventDefault()

  try {
    setSaving(true)
    setError('')

    const isEditing = Boolean(editingJob)

    const url = isEditing
        ? `${API_URL}/${editingJob.id}`
        : API_URL

    const response = await fetch(url, {
      method: isEditing ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    })

    if (!response.ok) {
      const message = await response.text()
      throw new Error(message || `HTTP ${response.status}`)
    }

    if (isEditing) {
      const updatedJob = await response.json()

      setJobs(previous =>
          previous.map(job =>
              job.id === editingJob.id ? updatedJob : job
          )
      )
    } else {
      const savedJob = await response.json()
      setJobs(previous => [savedJob, ...previous])
    }

    setShowModal(false)
    setEditingJob(null)
    setForm({ ...emptyForm, applicationDate: today() })

  } catch (err) {
    console.error(err)
    setError(`Unable to save: ${err.message}`)
  } finally {
    setSaving(false)
  }
}

// DELETE APPLICATION
async function handleDelete(job) {
  const confirmed = window.confirm(
      `Are you sure you want to delete ${job.companyName} - ${job.jobRole}?`
  )

  if (!confirmed) return

  try {
    setError('')

    const response = await fetch(`${API_URL}/${job.id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    setJobs(previous =>
        previous.filter(item => item.id !== job.id)
    )

  } catch (err) {
    console.error(err)
    setError(`Unable to delete application: ${err.message}`)
  }
}

// DATE FORMAT
function formatDate(date) {
  if (!date) return '—'

  const parsed = new Date(`${date}T00:00:00`)

  if (Number.isNaN(parsed.getTime())) return date

  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function statusClass(status = '') {
  return status.toLowerCase().replaceAll(' ', '-')
}

// REUSABLE APPLICATION TABLE
function renderApplicationsTable(data) {
  return (
      <>
        <div className="table-toolbar">
          <div className="search-box">
            <span>⌕</span>

            <input
                placeholder="Search company or role..."
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select
              className="filter-select"
              value={filter}
              onChange={e => setFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Applied">Applied</option>
            <option value="Waiting">Waiting</option>
            <option value="Interview">Interview</option>
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
            <tr>
              <th>COMPANY & ROLE</th>
              <th>LOCATION</th>
              <th>APPLIED DATE</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
            </thead>

            <tbody>
            {loading ? (
                <tr>
                  <td colSpan="5" className="empty-state">
                    Loading applications...
                  </td>
                </tr>
            ) : data.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state">
                    No applications found.
                  </td>
                </tr>
            ) : (
                data.map(job => (
                    <tr key={job.id}>
                      <td>
                        <div className="company-cell">
                          <div className="company-logo">
                            {(job.companyName || '?')
                                .charAt(0)
                                .toUpperCase()}
                          </div>

                          <div>
                            <strong>{job.companyName}</strong>
                            <p>{job.jobRole}</p>
                          </div>
                        </div>
                      </td>

                      <td>{job.jobLocation || '—'}</td>
                      <td>{formatDate(job.applicationDate)}</td>

                      <td>
                          <span className={`status-badge ${statusClass(job.status)}`}>
                            {job.status}
                          </span>
                      </td>

                      <td>
                        <div className="action-buttons">
                          <button
                              className="edit-button"
                              title="Edit application"
                              onClick={() => openEditModal(job)}
                          >
                            ✎
                          </button>

                          <button
                              className="delete-button"
                              title="Delete application"
                              onClick={() => handleDelete(job)}
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                ))
            )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          Showing {data.length} of {jobs.length} applications
        </div>
      </>
  )
}

return (
    <div className="app-layout">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="brand">
          <div className="brand-icon">J</div>

          <div>
            <h2>JobTrack<span>AI</span></h2>
            <p>CAREER WORKSPACE</p>
          </div>
        </div>

        {/* WORKSPACE NAVIGATION */}
        <div className="nav-section">

          <p className="nav-heading">WORKSPACE</p>

          <button
              className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`}
              onClick={() => navigateTo('dashboard')}
          >
            <span>▦</span> Dashboard
          </button>

          <button
              className={`nav-item ${activePage === 'applications' ? 'active' : ''}`}
              onClick={() => navigateTo('applications')}
          >
            <span>▤</span> My Applications
          </button>

          <button
              className={`nav-item ${activePage === 'interviews' ? 'active' : ''}`}
              onClick={() => navigateTo('interviews')}
          >
            <span>◷</span> Interviews
          </button>

          <button
              className={`nav-item ${activePage === 'offers' ? 'active' : ''}`}
              onClick={() => navigateTo('offers')}
          >
            <span>✦</span> Offers
          </button>

        </div>

        {/* SIDEBAR BOTTOM */}
        <div className="sidebar-bottom">

          <div className="upgrade-card">
            <div className="upgrade-star">✦</div>

            <h3>Career Insights</h3>

            <p>AI-powered career insights are coming soon.</p>

            <button onClick={() => navigateTo('insights')}>
              Explore AI →
            </button>
          </div>

          <div className="profile">
            <div className="avatar">S</div>

            <div>
              <h4>My Workspace</h4>
              <p>Free Plan</p>
            </div>
          </div>

        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">

        {/* HEADER */}
        <header className="topbar">

          <div>
            <p className="breadcrumb">WORKSPACE / OVERVIEW</p>
            <h1>{pageTitles[activePage] || 'Dashboard'}</h1>
          </div>

          <div className="topbar-right">

              <span className="date-label">
                {new Date().toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>

            <div className="top-avatar">S</div>

          </div>
        </header>

        {/* ERROR MESSAGE */}
        {error && (
            <div className="error-message">
              {error}

              <button onClick={() => setError('')}>
                ×
              </button>
            </div>
        )}

        {/* DASHBOARD */}
        {activePage === 'dashboard' && (
            <>

              <section className="welcome-section">

                <div>
                  <p className="eyebrow">YOUR CAREER, ORGANIZED</p>

                  <h2>
                    Welcome back! <span>✦</span>
                  </h2>

                  <p className="welcome-description">
                    Keep track of your opportunities and stay one step ahead.
                  </p>
                </div>

                <button
                    className="add-button"
                    onClick={openAddModal}
                >
                  ＋ Add Application
                </button>

              </section>

              {/* STATISTICS */}
              <section className="stats-grid">

                {stats.map(stat => (
                    <div className="stat-card" key={stat.label}>

                      <div className={`stat-icon ${stat.color}`}>
                        {stat.icon}
                      </div>

                      <p>{stat.label}</p>

                      <h2>
                        {loading ? '—' : String(stat.value).padStart(2, '0')}
                      </h2>

                      <span className="stat-note">
                          Your current progress
                        </span>

                    </div>
                ))}

              </section>

              {/* RECENT APPLICATIONS */}
              <section className="applications-section">

                <div className="section-header">

                  <div>
                    <p className="eyebrow">YOUR OPPORTUNITIES</p>
                    <h2>Recent Applications</h2>

                    <p className="section-description">
                      Manage and monitor all your job applications.
                    </p>
                  </div>

                  <button
                      className="view-button"
                      onClick={() => navigateTo('applications')}
                  >
                    View all →
                  </button>

                </div>

                {renderApplicationsTable(
                    filteredJobs.slice(0, 5)
                )}

              </section>

              <footer className="footer">
                <p>© 2026 JobTrack AI. Built for your next opportunity.</p>
                <p>Made with care <span>✦</span></p>
              </footer>

            </>
        )}

        {/* MY APPLICATIONS */}
        {activePage === 'applications' && (
            <section className="applications-section">

              <div className="section-header">
                <div>
                  <p className="eyebrow">YOUR OPPORTUNITIES</p>
                  <h2>All Applications</h2>

                  <p className="section-description">
                    View, search, update and manage your job applications.
                  </p>
                </div>

                <button
                    className="add-button"
                    onClick={openAddModal}
                >
                  ＋ Add Application
                </button>
              </div>

              {renderApplicationsTable(pageJobs)}

            </section>
        )}

        {/* INTERVIEWS */}
        {activePage === 'interviews' && (
            <section className="applications-section">

              <div className="section-header">
                <div>
                  <p className="eyebrow">NEXT CAREER STEP</p>
                  <h2>Interview Tracker</h2>

                  <p className="section-description">
                    Manage multiple interview rounds and track your results.
                  </p>
                </div>
              </div>

              {/* INTERVIEW RESULT SUMMARY */}
              <div className="stats-grid">

                {[
                  {
                    label: 'Scheduled',
                    value: interviews.filter(i => (i.interviewStatus || 'Scheduled') === 'Scheduled').length,
                    color: 'icon-blue',
                  },
                  {
                    label: 'Completed',
                    value: interviews.filter(i => i.interviewStatus === 'Completed').length,
                    color: 'icon-purple',
                  },
                  {
                    label: 'Passed',
                    value: interviews.filter(i => i.interviewStatus === 'Passed').length,
                    color: 'icon-green',
                  },
                  {
                    label: 'Failed',
                    value: interviews.filter(i => i.interviewStatus === 'Failed').length,
                    color: 'icon-gold',
                  },
                ].map(stat => (
                    <div className="stat-card" key={stat.label}>
                      <p>{stat.label}</p>
                      <h2>{stat.value}</h2>
                    </div>
                ))}

              </div>

              <div className="table-toolbar">
                <div className="search-box">
                  <span>⌕</span>

                  <input
                      placeholder="Search company or role..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                  <tr>
                    <th>COMPANY & ROLE</th>
                    <th>INTERVIEW DATE</th>
                    <th>TIME</th>
                    <th>ROUND</th>
                    <th>RESULT</th>
                    <th>ACTIONS</th>
                  </tr>
                  </thead>

                  <tbody>
                  {interviewLoading ? (
                      <tr>
                        <td colSpan="6" className="empty-state">
                          Loading interviews...
                        </td>
                      </tr>
                  ) : pageJobs.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="empty-state">
                          No applications have reached the interview stage.
                        </td>
                      </tr>
                  ) : (
                      pageJobs.flatMap(job => {
                        const jobInterviews = interviews
                            .filter(interview =>
                                Number(interview.jobApplicationId) === Number(job.id)
                            )
                            .sort((a, b) =>
                                `${a.interviewDate || ''} ${a.interviewTime || ''}`
                                    .localeCompare(`${b.interviewDate || ''} ${b.interviewTime || ''}`)
                            )

                        if (jobInterviews.length === 0) {
                          return [
                            <tr key={`empty-${job.id}`}>
                              <td>
                                <div className="company-cell">
                                  <div className="company-logo">
                                    {(job.companyName || '?').charAt(0).toUpperCase()}
                                  </div>

                                  <div>
                                    <strong>{job.companyName}</strong>
                                    <p>{job.jobRole}</p>
                                  </div>
                                </div>
                              </td>

                              <td>Not scheduled</td>
                              <td>—</td>
                              <td>Not set</td>

                              <td>
                                  <span className="status-badge scheduled">
                                    Not scheduled
                                  </span>
                              </td>

                              <td>
                                <button
                                    className="edit-button"
                                    type="button"
                                    title="Add interview round"
                                    onClick={() => openInterviewModal(job)}
                                >
                                  +
                                </button>
                              </td>
                            </tr>
                          ]
                        }

                        return jobInterviews.map(interview => (
                            <tr key={`interview-${interview.id}`}>
                              <td>
                                <div className="company-cell">
                                  <div className="company-logo">
                                    {(job.companyName || '?').charAt(0).toUpperCase()}
                                  </div>

                                  <div>
                                    <strong>{job.companyName}</strong>
                                    <p>{job.jobRole}</p>
                                  </div>
                                </div>
                              </td>

                              <td>{formatDate(interview.interviewDate)}</td>

                              <td>
                                {formatInterviewTime(interview.interviewTime)}
                              </td>

                              <td>{interview.interviewRound || 'Not set'}</td>

                              <td>
                                  <span
                                      className={`status-badge ${statusClass(interview.interviewStatus || 'Scheduled')}`}
                                  >
                                    {interview.interviewStatus || 'Scheduled'}
                                  </span>
                              </td>

                              <td>
                                <div className="action-buttons">

                                  <button
                                      className="edit-button"
                                      type="button"
                                      title="Add another round"
                                      onClick={() => openInterviewModal(job)}
                                  >
                                    +
                                  </button>

                                  <button
                                      className="edit-button"
                                      type="button"
                                      title="Edit this round"
                                      onClick={() => openInterviewModal(job, interview)}
                                  >
                                    ✎
                                  </button>

                                  <button
                                      className="delete-button"
                                      type="button"
                                      title="Delete this round"
                                      onClick={() => handleDeleteInterview(interview.id)}
                                  >
                                    🗑
                                  </button>

                                </div>
                              </td>
                            </tr>
                        ))
                      })
                  )}
                  </tbody>
                </table>
              </div>

              <div className="table-footer">
                Showing {interviews.filter(interview =>
                  pageJobs.some(job =>
                      Number(job.id) === Number(interview.jobApplicationId)
                  )
              ).length} scheduled interview rounds
              </div>

            </section>
        )}

        {/* OFFERS */}
        {activePage === 'offers' && (
            <section className="applications-section">

              <div className="section-header">
                <div>
                  <p className="eyebrow">SUCCESS & ACHIEVEMENTS</p>
                  <h2>Your Job Offers</h2>

                  <p className="section-description">
                    View your selected applications and job offers.
                  </p>
                </div>
              </div>

              {renderApplicationsTable(pageJobs)}

            </section>
        )}

        {/* CAREER INSIGHTS */}
        {activePage === 'insights' && (
            <section className="applications-section">

              <p className="eyebrow">AI POWERED</p>
              <h2>Career Insights ✦</h2>

              <p className="section-description">
                Discover opportunities and improve your career journey.
              </p>

              <div className="insights-grid">

                <div className="stat-card">
                  <h3>Resume Improvement</h3>
                  <p>Get tips to improve your resume.</p>
                </div>

                <div className="stat-card">
                  <h3>Interview Preparation</h3>
                  <p>Prepare for your upcoming interviews.</p>
                </div>

                <div className="stat-card">
                  <h3>Career Recommendations</h3>
                  <p>Explore skills and career opportunities.</p>
                </div>

              </div>

            </section>
        )}

      </main>

      {/* INTERVIEW MODAL */}
      {showInterviewModal && selectedInterview && (
          <div
              className="modal-overlay"
              onClick={() => !interviewSaving && setShowInterviewModal(false)}
          >

            <div
                className="modal"
                onClick={e => e.stopPropagation()}
            >

              <div className="modal-header">

                <div>
                  <p className="eyebrow">INTERVIEW TRACKER</p>

                  <h2>
                    {editingInterview
                        ? 'Update Interview Round'
                        : 'Schedule New Round'}
                  </h2>

                  <p className="section-description">
                    {selectedInterview.companyName} · {selectedInterview.jobRole}
                  </p>
                </div>

                <button
                    className="close-button"
                    type="button"
                    onClick={() => setShowInterviewModal(false)}
                    disabled={interviewSaving}
                >
                  ×
                </button>

              </div>

              <form onSubmit={saveInterviewDetails}>

                <label>
                  Interview Date

                  <input
                      type="date"
                      required
                      value={interviewForm.interviewDate}
                      onChange={e =>
                          setInterviewForm({
                            ...interviewForm,
                            interviewDate: e.target.value,
                          })
                      }
                  />
                </label>

                <label>
                  Interview Time

                  <input
                      type="time"
                      required
                      value={interviewForm.interviewTime}
                      onChange={e =>
                          setInterviewForm({
                            ...interviewForm,
                            interviewTime: e.target.value,
                          })
                      }
                  />
                </label>

                <label>
                  Interview Round

                  <select
                      value={interviewForm.interviewRound}
                      onChange={e =>
                          setInterviewForm({
                            ...interviewForm,
                            interviewRound: e.target.value,
                          })
                      }
                  >
                    <option>HR Round</option>
                    <option>Technical Round</option>
                    <option>Managerial Round</option>
                    <option>Assessment</option>
                    <option>Final Round</option>
                    <option>Other</option>
                  </select>
                </label>

                <label>
                  Interview Result

                  <select
                      value={interviewForm.interviewStatus}
                      onChange={e =>
                          setInterviewForm({
                            ...interviewForm,
                            interviewStatus: e.target.value,
                          })
                      }
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Passed">Passed</option>
                    <option value="Failed">Failed</option>
                    <option value="Rescheduled">Rescheduled</option>
                  </select>
                </label>

                <label>
                  Notes

                  <textarea
                      rows="3"
                      value={interviewForm.notes}
                      placeholder="Add meeting link, preparation notes, or reminders..."
                      onChange={e =>
                          setInterviewForm({
                            ...interviewForm,
                            notes: e.target.value,
                          })
                      }
                  />
                </label>

                <div className="modal-actions">

                  <button
                      type="button"
                      className="cancel-button"
                      onClick={() => setShowInterviewModal(false)}
                      disabled={interviewSaving}
                  >
                    Cancel
                  </button>

                  <button
                      type="submit"
                      className="add-button"
                      disabled={interviewSaving}
                  >
                    {interviewSaving
                        ? 'Saving...'
                        : editingInterview
                            ? 'Update Round'
                            : 'Add Round'}
                  </button>

                </div>

              </form>

            </div>
          </div>
      )}

      {/* ADD / EDIT APPLICATION MODAL */}
      {showModal && (
          <div
              className="modal-overlay"
              onClick={() => !saving && setShowModal(false)}
          >

            <div
                className="modal"
                onClick={e => e.stopPropagation()}
            >

              <div className="modal-header">

                <div>
                  <p className="eyebrow">
                    {editingJob ? 'UPDATE OPPORTUNITY' : 'NEW OPPORTUNITY'}
                  </p>

                  <h2>
                    {editingJob ? 'Edit Application' : 'Add Application'}
                  </h2>
                </div>

                <button
                    className="close-button"
                    onClick={() => setShowModal(false)}
                    disabled={saving}
                >
                  ×
                </button>

              </div>

              <form onSubmit={handleSubmit}>

                <label>
                  Company Name

                  <input
                      required
                      value={form.companyName}
                      placeholder="e.g. Google"
                      onChange={e =>
                          setForm({ ...form, companyName: e.target.value })
                      }
                  />
                </label>

                <label>
                  Job Role

                  <input
                      required
                      value={form.jobRole}
                      placeholder="e.g. Software Engineer"
                      onChange={e =>
                          setForm({ ...form, jobRole: e.target.value })
                      }
                  />
                </label>

                <label>
                  Job Location

                  <input
                      required
                      value={form.jobLocation}
                      placeholder="e.g. Bengaluru"
                      onChange={e =>
                          setForm({ ...form, jobLocation: e.target.value })
                      }
                  />
                </label>

                <div className="form-row">

                  <label>
                    Status

                    <select
                        value={form.status}
                        onChange={e =>
                            setForm({ ...form, status: e.target.value })
                        }
                    >
                      <option>Applied</option>
                      <option>Waiting</option>
                      <option>Interview</option>
                      <option>Selected</option>
                      <option>Rejected</option>
                    </select>
                  </label>

                  <label>
                    Application Date

                    <input
                        type="date"
                        required
                        value={form.applicationDate}
                        onChange={e =>
                            setForm({
                              ...form,
                              applicationDate: e.target.value,
                            })
                        }
                    />
                  </label>

                </div>

                <div className="modal-actions">

                  <button
                      type="button"
                      className="cancel-button"
                      disabled={saving}
                      onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>

                  <button
                      type="submit"
                      className="add-button"
                      disabled={saving}
                  >
                    {saving
                        ? 'Saving...'
                        : editingJob
                            ? 'Update Application'
                            : 'Save Application'}
                  </button>

                </div>

              </form>

            </div>
          </div>
      )}

    </div>
)
}

export default App