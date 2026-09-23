// frontend/src/App.jsx
import { Routes, Route, Link } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Farms from './pages/Farms'
import Notifications from './pages/Notifications'
import Crops from './pages/Crops'
import CropDetail from './pages/CropDetail'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'

function Home() {
  const { user, logout } = useAuth()
  return (
    <div style={{ padding: '2rem' }}>
      <h1>SFMS Kenya Dashboard</h1>
      <p>Logged in as: {user?.email}</p>
      <p>
        <Link to="/farms">My Farms</Link>
        {' · '}
        <Link to="/crops">Crops</Link>
        {' · '}
        <Link to="/notifications">Notifications</Link>
      </p>
      <button onClick={logout}>Log Out</button>
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
    </Routes>
  )
}