// frontend/src/pages/Notifications.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import apiClient from '../api/client'
import './Notifications.css'

export default function Notifications() {
  const { t } = useTranslation()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const typeLabels = {
    spray_reminder: t('notifications.sprayReminder'),
    health_due: t('notifications.healthDue'),
    weather_alert: t('notifications.weatherAlert'),
    harvest_due: t('notifications.harvestDue'),
    task_due: t('notifications.taskDue'),
  }

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await apiClient.get('notifications/')
        setNotifications(res.data)
      } catch (err) {
        setError(t('notifications.error'))
      } finally {
        setLoading(false)
      }
    }
    fetchNotifications()
  }, [])

  return (
    <div className="notifications-container">
      <h1>{t('notifications.title')}</h1>

      {loading && <p>{t('notifications.loading')}</p>}
      {error && <p className="notifications-error">{error}</p>}

      {!loading && !error && notifications.length === 0 && (
        <p>{t('notifications.empty')}</p>
      )}

      <div className="notifications-list">
        {notifications.map((n) => (
          <div key={n.id} className={`notification-card status-${n.status}`}>
            <div className="notification-header">
              <span className="notification-type">
                {typeLabels[n.type] || n.type}
              </span>
              <span className={`notification-status status-badge-${n.status}`}>
                {n.status}
              </span>
            </div>
            <p className="notification-message">{n.message}</p>
            <p className="notification-due">{t('notifications.due')}: {n.due_date}</p>
          </div>
        ))}
      </div>
    </div>
  )
}