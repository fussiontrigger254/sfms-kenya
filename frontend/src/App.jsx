// frontend/src/App.jsx
import { Routes, Route, Link } from 'react-router-dom'
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
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'
import { useTranslation } from 'react-i18next'

function Home() {
  const { user, logout } = useAuth()
  const { t, i18n } = useTranslation()
  return (
    <div style={{ padding: '2rem' }}>
      <div className="lang-toggle" style={{ position: 'static', marginBottom: '1rem' }}>
        <button onClick={() => i18n.changeLanguage('en')}>EN</button>
        <button onClick={() => i18n.changeLanguage('sw')}>SW</button>
      </div>
      <h1>{t('dashboard.title')}</h1>
      <p>{t('nav.loggedInAs')} {user?.email}</p>
      <p>
        <Link to="/farms">{t('nav.farms')}</Link>
        {' · '}
        <Link to="/crops">{t('nav.crops')}</Link>
        {' · '}
        <Link to="/livestock">{t('nav.livestock')}</Link>
        {' · '}
        <Link to="/soil-logs">{t('nav.soilLogs')}</Link>
        {' · '}
        <Link to="/tasks">{t('nav.tasks')}</Link>
        {' · '}
        <Link to="/financials">{t('nav.financials')}</Link>
        {' · '}
        <Link to="/community">{t('nav.community')}</Link>
        {' · '}
        <Link to="/notifications">{t('nav.notifications')}</Link>
      </p>
      <button onClick={logout}>{t('nav.logout')}</button>
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