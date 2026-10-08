// frontend/src/App.jsx
import { useState, useEffect } from 'react'
import { Routes, Route, Link, NavLink } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Farms from './pages/Farms'
import Notifications from './pages/Notifications'
import Crops from './pages/Crops'
import CropDetail from './pages/CropDetail'
import Livestock from './pages/Livestock'
import AnimalDetail from './pages/AnimalDetail'
import SoilLogs from './pages/SoilLogs'
import Tasks from './pages/Tasks'
import Financials from './pages/Financials'
import Community from './pages/Community'
import Weather from './pages/Weather'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'
import { useTranslation } from 'react-i18next'
import apiClient from './api/client'
import { useSyncStatus } from './services/offlineSync'
import offlineApi from './services/offlineApi'
import './App.css'
// --- SVG Micro-Icons ---
function FarmIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function CropIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22v-9" />
      <path d="M9 10a5 5 0 0 1 8.5-3.5 5 5 0 0 1 1.5 5.5c-2 1-5 1-10-2z" />
      <path d="M15 13a5 5 0 0 0-8.5-3.5A5 5 0 0 0 5 15c2 1 5 1 10-2z" />
    </svg>
  )
}

function LivestockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="6" width="16" height="14" rx="4" />
      <path d="M4 10h16" />
      <path d="M8 3v3M16 3v3" />
      <circle cx="8" cy="14" r="1" />
      <circle cx="16" cy="14" r="1" />
    </svg>
  )
}

function SoilIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 2v7.31L4 19a2 2 0 0 0 1.66 3h12.68A2 2 0 0 0 20 19l-6-9.69V2" />
      <line x1="8" y1="2" x2="16" y2="2" />
      <line x1="6" y1="16" x2="18" y2="16" />
    </svg>
  )
}

function TaskIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  )
}

function FinanceIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
      <circle cx="16" cy="15" r="1.5" />
    </svg>
  )
}

function CommunityIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function WeatherIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function Home() {
  const { user, logout } = useAuth()
  const { t, i18n } = useTranslation()
  const [summary, setSummary] = useState(null)
  const [farms, setFarms] = useState([])
  const [selectedFarmId, setSelectedFarmId] = useState(() => localStorage.getItem('sfms_selected_weather_farm') || '')
  const [selectedWeather, setSelectedWeather] = useState(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [weatherOpen, setWeatherOpen] = useState(false)
  const [summaryError, setSummaryError] = useState('')
  const { isOnline, isSyncing, pendingCount, triggerSync } = useSyncStatus()

  useEffect(() => {
    // 1. Instant load from local cache if available
    try {
      const cached = localStorage.getItem('sfms_cached_summary')
      if (cached) {
        setSummary(JSON.parse(cached))
      }
    } catch {
      // ignore JSON parse issue
    }

    // 2. Fetch fresh from server when online
    if (navigator.onLine) {
      offlineApi.get('farms/')
        .then((response) => {
          const savedFarms = Array.isArray(response.data) ? response.data : []
          setFarms(savedFarms)
          setSelectedFarmId((current) => {
            const saved = savedFarms.find((farm) => String(farm.id) === String(current))
            return saved ? String(saved.id) : savedFarms[0] ? String(savedFarms[0].id) : ''
          })
        })
        .catch(() => {})

      apiClient.get('dashboard/summary/')
        .then((response) => {
          setSummary(response.data)
          localStorage.setItem('sfms_cached_summary', JSON.stringify(response.data))
        })
        .catch(() => {
          const cached = localStorage.getItem('sfms_cached_summary')
          if (!cached) setSummaryError(t('dashboard.error'))
        })
    }
  }, [t])

  const formatDate = (value) => value ? new Date(`${value}T00:00:00`).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' }) : ''
  const formatKES = (value) => `KES ${Number(value || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  useEffect(() => {
    if (!selectedFarmId) {
      setSelectedWeather(null)
      return
    }

    localStorage.setItem('sfms_selected_weather_farm', selectedFarmId)
    const cachedWeather = localStorage.getItem(`sfms_weather_${selectedFarmId}`)
    if (cachedWeather) {
      try {
        setSelectedWeather(JSON.parse(cachedWeather))
      } catch {
        localStorage.removeItem(`sfms_weather_${selectedFarmId}`)
      }
    }

    if (!navigator.onLine) return

    setWeatherLoading(true)
    apiClient.get(`weather/${selectedFarmId}/`)
      .then((response) => {
        setSelectedWeather(response.data)
        localStorage.setItem(`sfms_weather_${selectedFarmId}`, JSON.stringify(response.data))
      })
      .catch(() => {})
      .finally(() => setWeatherLoading(false))
  }, [selectedFarmId])

  const selectedFarm = farms.find((farm) => String(farm.id) === String(selectedFarmId))
  const farmLocation = selectedFarm?.location || 'Your farm location'
  const currentForecast = selectedWeather?.forecast?.[0]
  const weatherSummary = currentForecast
    ? `${currentForecast.temp_min}°–${currentForecast.temp_max}°C · ${currentForecast.condition}`
    : weatherLoading
      ? 'Loading weather...'
      : 'View farm forecast'
  const farmerName = user?.displayName || user?.email?.split('@')[0] || 'Farmer'

  const renderUrgencyBadge = (daysLeft, dueDate) => {
    if (daysLeft === undefined || daysLeft === null) {
      return <span className="urgency-badge urgency-neutral">{formatDate(dueDate)}</span>
    }
    if (daysLeft < 0) {
      return <span className="urgency-badge urgency-danger">{t('dashboard.overdueDays', { days: Math.abs(daysLeft) })}</span>
    }
    if (daysLeft === 0) {
      return <span className="urgency-badge urgency-warning">{t('dashboard.dueToday')}</span>
    }
    return <span className="urgency-badge urgency-info">{t('dashboard.inDays', { days: daysLeft })} · {formatDate(dueDate)}</span>
  }

  return (
    <div className="dashboard-container">
      {/* Top Application Bar */}
      <header className="dashboard-header">
        <div className="dashboard-branding">
          <span className="dashboard-logo-icon">🌿</span>
          <div className="dashboard-brand-text">
            <span className="dashboard-eyebrow">SFMS KENYA</span>
            <h1>{t('dashboard.title')}</h1>
          </div>
        </div>

        <div className="dashboard-header-actions">
          {/* Real-time Cloud & Offline Sync Badge */}
          <div
            className={`dashboard-sync-pill ${!isOnline ? 'sync-offline' : isSyncing ? 'sync-active' : 'sync-online'}`}
            onClick={isOnline ? triggerSync : undefined}
            title={isOnline ? 'Connected: Click to trigger cloud sync' : 'Offline Mode: Data saved to phone storage'}
          >
            <span className="sync-status-dot" />
            <span className="sync-status-text">
              {!isOnline
                ? `Offline (${pendingCount} queued)`
                : isSyncing
                ? 'Syncing...'
                : pendingCount > 0
                ? `Syncing (${pendingCount})...`
                : 'Cloud Synced'}
            </span>
          </div>

          <div className="dashboard-user-badge">
            <span className="dashboard-user-dot" />
            <span className="dashboard-user-email">{user?.email}</span>
          </div>
          <div className="lang-toggle" aria-label="Language selection">
            <button
              className={i18n.language === 'en' ? 'active-lang' : ''}
              onClick={() => i18n.changeLanguage('en')}
            >
              EN
            </button>
            <button
              className={i18n.language === 'sw' ? 'active-lang' : ''}
              onClick={() => i18n.changeLanguage('sw')}
            >
              SW
            </button>
          </div>
          <button className="dashboard-logout-btn" onClick={logout} title={t('nav.logout')}>
            {t('nav.logout')}
          </button>
        </div>
      </header>

      {/* Hero Welcome Banner */}
      <section className="dashboard-hero">
        <div className="hero-content">
          <div className="hero-badge-strip">
            <span className="hero-season-tag">🇰🇪 Kenya Agricultural Hub</span>
            <span className="hero-season-dot">•</span>
            <span className="hero-season-name">Short Rains Season · Vuli</span>
          </div>
          <h2>{t('dashboard.welcome', { defaultValue: `Habari, ${farmerName}!` })}</h2>
          <p>{t('dashboard.welcomeSub')}</p>
        </div>

        <button
          type="button"
          className="hero-weather-card"
          onClick={() => setWeatherOpen((open) => !open)}
          aria-expanded={weatherOpen}
          aria-label="Select farm weather"
        >
          <div className="weather-icon-badge">⛅</div>
          <div className="weather-meta">
            <span className="weather-title">{farmLocation}</span>
            <span className="weather-sub">{weatherSummary}</span>
          </div>
          <span className="weather-selector-chevron">⌄</span>
        </button>
        {weatherOpen && (
          <div className="weather-picker" role="dialog" aria-label="Farm weather selection">
            <div className="weather-picker-title">Select farm weather</div>
            {farms.length === 0 ? (
              <p>No saved farms yet.</p>
            ) : (
              farms.map((farm) => (
                <button
                  type="button"
                  key={farm.id}
                  className={String(farm.id) === String(selectedFarmId) ? 'weather-farm-option selected' : 'weather-farm-option'}
                  onClick={() => {
                    setSelectedFarmId(String(farm.id))
                    setWeatherOpen(false)
                  }}
                >
                  <span>{farm.farm_name}</span>
                  <small>{farm.location}</small>
                </button>
              ))
            )}
            <Link to="/weather" className="weather-full-link" onClick={() => setWeatherOpen(false)}>
              View full forecast →
            </Link>
          </div>
        )}
      </section>

      {/* Module Navigation Bar */}
      <nav className="dashboard-nav" aria-label="Main navigation">
        <NavLink to="/farms"><FarmIcon /> {t('nav.farms')}</NavLink>
        <NavLink to="/crops"><CropIcon /> {t('nav.crops')}</NavLink>
        <NavLink to="/livestock"><LivestockIcon /> {t('nav.livestock')}</NavLink>
        <NavLink to="/soil-logs"><SoilIcon /> {t('nav.soilLogs')}</NavLink>
        <NavLink to="/tasks"><TaskIcon /> {t('nav.tasks')}</NavLink>
        <NavLink to="/financials"><FinanceIcon /> {t('nav.financials')}</NavLink>
        <NavLink to="/community"><CommunityIcon /> {t('nav.community')}</NavLink>
        <NavLink to="/notifications"><BellIcon /> {t('nav.notifications')}</NavLink>
        <NavLink to="/weather"><WeatherIcon /> {t('nav.weather')}</NavLink>
      </nav>

      {/* Quick Actions Speed-Dial */}
      <section className="quick-actions-bar" aria-label="Quick Actions">
        <span className="quick-actions-label">{t('dashboard.quickActions')}</span>
        <div className="quick-actions-list">
          <Link to="/farms" className="quick-action-pill">
            <PlusIcon /> {t('dashboard.addFarm')}
          </Link>
          <Link to="/crops" className="quick-action-pill">
            <PlusIcon /> {t('dashboard.logSpray')}
          </Link>
          <Link to="/livestock" className="quick-action-pill">
            <PlusIcon /> {t('dashboard.addAnimal')}
          </Link>
          <Link to="/financials" className="quick-action-pill">
            <PlusIcon /> {t('dashboard.addRecord')}
          </Link>
          <Link to="/tasks" className="quick-action-pill">
            <PlusIcon /> {t('dashboard.addTask')}
          </Link>
        </div>
      </section>

      <main className="dashboard-main">
        {summaryError && <p className="dashboard-error">{summaryError}</p>}

        {summary && (
          <>
            {/* KPI Cards Grid */}
            <section className="dashboard-kpis">
              <Link to="/farms" className="kpi-card kpi-farms">
                <div className="kpi-top">
                  <div className="kpi-icon-box"><FarmIcon /></div>
                  <span className="kpi-status-badge badge-green">Active</span>
                </div>
                <div className="kpi-value">{summary.farm_count}</div>
                <div className="kpi-title">{t('dashboard.farms')}</div>
                <div className="kpi-subtitle">Registered parcels</div>
              </Link>

              <Link to="/crops" className={`kpi-card kpi-sprays ${summary.sprays.length > 0 ? 'has-action' : ''}`}>
                <div className="kpi-top">
                  <div className="kpi-icon-box"><CropIcon /></div>
                  <span className={`kpi-status-badge ${summary.sprays.length > 0 ? 'badge-amber' : 'badge-green'}`}>
                    {summary.sprays.length > 0 ? `${summary.sprays.length} due` : 'Protected'}
                  </span>
                </div>
                <div className="kpi-value">{summary.sprays.length}</div>
                <div className="kpi-title">{summary.sprays.length === 1 ? 'Upcoming spray' : t('dashboard.sprays')}</div>
                <div className="kpi-subtitle">
                  {summary.sprays.length > 0 ? 'Requires attention' : 'Protection on track'}
                </div>
              </Link>

              <Link to="/livestock" className={`kpi-card kpi-health ${summary.health.length > 0 ? 'has-action' : ''}`}>
                <div className="kpi-top">
                  <div className="kpi-icon-box"><LivestockIcon /></div>
                  <span className={`kpi-status-badge ${summary.health.length > 0 ? 'badge-amber' : 'badge-green'}`}>
                    {summary.health.length > 0 ? `${summary.health.length} due` : 'Healthy'}
                  </span>
                </div>
                <div className="kpi-value">{summary.health.length}</div>
                <div className="kpi-title">{t('dashboard.health')}</div>
                <div className="kpi-subtitle">
                  {summary.health.length > 0 ? 'Vaccines / checkups due' : 'All livestock healthy'}
                </div>
              </Link>

              <Link to="/tasks" className={`kpi-card kpi-tasks ${summary.tasks.length > 0 ? 'has-action' : ''}`}>
                <div className="kpi-top">
                  <div className="kpi-icon-box"><TaskIcon /></div>
                  <span className={`kpi-status-badge ${summary.tasks.length > 0 ? 'badge-purple' : 'badge-green'}`}>
                    {summary.tasks.length > 0 ? `${summary.tasks.length} pending` : 'Done'}
                  </span>
                </div>
                <div className="kpi-value">{summary.tasks.length}</div>
                <div className="kpi-title">{t('dashboard.tasks')}</div>
                <div className="kpi-subtitle">
                  {summary.tasks.length > 0 ? 'Action required today' : 'All caught up'}
                </div>
              </Link>
            </section>

            {/* Monthly Financial Cashflow Card */}
            <section className="dashboard-finance-card">
              <div className="finance-main-col">
                <div className="finance-header-row">
                  <span className="finance-period-tag">💰 {summary.month.label}</span>
                  <span className={`finance-profit-pill ${summary.month.net >= 0 ? 'is-profit' : 'is-loss'}`}>
                    {summary.month.net >= 0 ? `▲ ${t('dashboard.netProfit')}` : `▼ ${t('dashboard.netLoss')}`}
                  </span>
                </div>
                <div className="finance-headline-amount">{formatKES(summary.month.net)}</div>
                <div className="finance-sublabel">{t('dashboard.monthlyProfit')}</div>
              </div>

              <div className="finance-stats-col">
                <div className="finance-sub-stat income-stat">
                  <span className="stat-indicator green-dot" />
                  <div className="stat-details">
                    <span className="stat-name">{t('dashboard.revenue')}</span>
                    <strong className="stat-num">+{formatKES(summary.month.revenue)}</strong>
                  </div>
                </div>

                <div className="finance-sub-stat expense-stat">
                  <span className="stat-indicator red-dot" />
                  <div className="stat-details">
                    <span className="stat-name">{t('dashboard.expenses')}</span>
                    <strong className="stat-num">-{formatKES(summary.month.expense)}</strong>
                  </div>
                </div>

                <Link to="/financials" className="finance-view-link">
                  {t('dashboard.viewAll')}
                </Link>
              </div>
            </section>

            {/* Agendas & Action Feed Grid */}
            <section className="dashboard-agendas-grid">
              {/* Upcoming Sprays */}
              <div className="agenda-block">
                <div className="agenda-head">
                  <div className="agenda-title-group">
                    <span className="agenda-icon-wrap spray-wrap"><CropIcon /></span>
                    <h3>{t('dashboard.upcomingSprays')}</h3>
                  </div>
                  <Link to="/crops" className="agenda-view-more">{t('dashboard.viewAll')}</Link>
                </div>

                <div className="agenda-body">
                  {summary.sprays.length === 0 ? (
                    <div className="agenda-empty-state">
                      <span className="empty-emoji">🌱</span>
                      <p className="empty-title">All crops protected</p>
                      <span className="empty-desc">{t('dashboard.emptySprays')}</span>
                    </div>
                  ) : (
                    <div className="agenda-items-list">
                      {summary.sprays.map((item) => (
                        <Link to="/crops" key={item.crop_id} className="agenda-item-card">
                          <div className="item-main-info">
                            <strong className="item-title">{item.crop_name}</strong>
                            <span className="item-subtitle">📍 {item.farm_name}</span>
                          </div>
                          <div className="item-side-badge">
                            {renderUrgencyBadge(item.days_left, item.due_date)}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Health Interventions Due */}
              <div className="agenda-block">
                <div className="agenda-head">
                  <div className="agenda-title-group">
                    <span className="agenda-icon-wrap health-wrap"><LivestockIcon /></span>
                    <h3>{t('dashboard.healthDue')}</h3>
                  </div>
                  <Link to="/livestock" className="agenda-view-more">{t('dashboard.viewAll')}</Link>
                </div>

                <div className="agenda-body">
                  {summary.health.length === 0 ? (
                    <div className="agenda-empty-state">
                      <span className="empty-emoji">🐄</span>
                      <p className="empty-title">Livestock healthy</p>
                      <span className="empty-desc">{t('dashboard.emptyHealth')}</span>
                    </div>
                  ) : (
                    <div className="agenda-items-list">
                      {summary.health.map((item) => (
                        <Link to="/livestock" key={item.animal_id} className="agenda-item-card">
                          <div className="item-main-info">
                            <strong className="item-title">{item.animal_tag}</strong>
                            <span className="item-subtitle">🩺 {item.record_type}</span>
                          </div>
                          <div className="item-side-badge">
                            {renderUrgencyBadge(item.days_left, item.due_date)}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Pending Tasks */}
              <div className="agenda-block">
                <div className="agenda-head">
                  <div className="agenda-title-group">
                    <span className="agenda-icon-wrap task-wrap"><TaskIcon /></span>
                    <h3>{t('dashboard.pendingTasks')}</h3>
                  </div>
                  <Link to="/tasks" className="agenda-view-more">{t('dashboard.viewAll')}</Link>
                </div>

                <div className="agenda-body">
                  {summary.tasks.length === 0 ? (
                    <div className="agenda-empty-state">
                      <span className="empty-emoji">✨</span>
                      <p className="empty-title">All caught up</p>
                      <span className="empty-desc">{t('dashboard.emptyTasks')}</span>
                    </div>
                  ) : (
                    <div className="agenda-items-list">
                      {summary.tasks.map((item) => (
                        <Link to="/tasks" key={item.task_id} className="agenda-item-card">
                          <div className="item-main-info">
                            <strong className="item-title">{item.title}</strong>
                            <span className="item-subtitle">📅 {formatDate(item.due_date)}</span>
                          </div>
                          <div className="item-side-badge">
                            <span className="urgency-badge urgency-neutral">Due</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </main>
      <footer className="dashboard-copyright">©Nate2026</footer>
    </div>
  )
}
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farms"
        element={
          <ProtectedRoute>
            <Farms />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/crops"
        element={
          <ProtectedRoute>
            <Crops />
          </ProtectedRoute>
        }
      />
      <Route
        path="/crops/:id"
        element={
          <ProtectedRoute>
            <CropDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/livestock"
        element={
          <ProtectedRoute>
            <Livestock />
          </ProtectedRoute>
        }
      />
      <Route
        path="/livestock/:id"
        element={
          <ProtectedRoute>
            <AnimalDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/soil-logs"
        element={
          <ProtectedRoute>
            <SoilLogs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <Tasks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/financials"
        element={
          <ProtectedRoute>
            <Financials />
          </ProtectedRoute>
        }
      />
      <Route
        path="/weather"
        element={
          <ProtectedRoute>
            <Weather />
          </ProtectedRoute>
        }
      />
      <Route
        path="/community"
        element={
          <ProtectedRoute>
            <Community />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}