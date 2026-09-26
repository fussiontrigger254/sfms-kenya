// frontend/src/pages/Login.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import './Login.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()

  if (user) {
    navigate('/', { replace: true })
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(t('login.error'))
    }
  }

  return (
    <div className="login-container">
      <div className="lang-toggle">
        <button onClick={() => i18n.changeLanguage('en')}>EN</button>
        <button onClick={() => i18n.changeLanguage('sw')}>SW</button>
      </div>
      <form onSubmit={handleSubmit} className="login-form">
        <h1>{t('login.title')}</h1>
        <input
          type="email"
          placeholder={t('login.email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder={t('login.password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="login-error">{error}</p>}
        <button type="submit">{t('login.submit')}</button>
        <p className="login-link">
          {t('login.noAccount')} <Link to="/register">{t('login.register')}</Link>
        </p>
      </form>
    </div>
  )
}