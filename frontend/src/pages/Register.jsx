// frontend/src/pages/Register.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import './Register.css'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const { register, user } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  if (user) {
    navigate('/', { replace: true })
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError(t('register.errorMismatch'))
      return
    }
    if (password.length < 6) {
      setError(t('register.errorShort'))
      return
    }

    try {
      await register(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError(t('register.errorInUse'))
      } else {
        setError(t('register.errorGeneric'))
      }
    }
  }

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit} className="register-form">
        <h1>{t('register.title')}</h1>
        <p className="register-subtitle">{t('register.subtitle')}</p>
        <input
          type="email"
          placeholder={t('register.email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder={t('register.password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder={t('register.confirmPassword')}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        {error && <p className="register-error">{error}</p>}
        <button type="submit">{t('register.submit')}</button>
        <p className="register-link">
          {t('register.haveAccount')} <Link to="/login">{t('register.login')}</Link>
        </p>
      </form>
    </div>
  )
}