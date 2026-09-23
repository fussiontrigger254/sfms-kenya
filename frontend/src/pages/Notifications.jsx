// frontend/src/pages/Notifications.jsx
import { useState, useEffect } from 'react'
import apiClient from '../api/client'
import './Notifications.css'

const TYPE_LABELS = {
  spray_reminder: 'Spray Reminder',
  health_due: 'Health Due',
  weather_alert: 'Weather Alert',
  harvest_due: 'Harvest Due',
  task_due: 'Task Due',
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await apiClient.get('notifications/')
        setNotifications(res.data)
      } catch (err) {
        setError('Could not load notifications.')
      } finally {
        setLoading(false)
      }
    }
    fetchNotifications()
  }, [])

  return (
    <div className="notifications-container">
      <h1>Notifications</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="notifications-error">{error}</p>}

      {!loading && !error && notifications.length === 0 && (
        <p>No notifications yet.</p>
      )}

      <div className="notifications-list">
        {notifications.map((n) => (
          <div key={n.id} className={`notification-card status-${n.status}`}>
            <div className="notification-header">
              <span className="notification-type">
                {TYPE_LABELS[n.type] || n.type}
              </span>
              <span className={`notification-status status-badge-${n.status}`}>
                {n.status}
              </span>
            </div>
            <p className="notification-message">{n.message}</p>
            <p className="notification-due">Due: {n.due_date}</p>
          </div>
        ))}
      </div>
    </div>
  )
}