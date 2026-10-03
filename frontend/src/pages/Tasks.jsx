// frontend/src/pages/Tasks.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import apiClient from '../api/client'
import offlineApi from '../services/offlineApi'
import './Tasks.css'

export default function Tasks() {
  const { t } = useTranslation()
  const [tasks, setTasks] = useState([])
  const [farms, setFarms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState({
    farm: '',
    title: '',
    frequency: 'daily',
    due_date: '',
    notes: '',
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const [tasksRes, farmsRes] = await Promise.all([
        offlineApi.get('farms/tasks/'),
        offlineApi.get('farms/'),
      ])
      setTasks(tasksRes.data)
      setFarms(farmsRes.data)
    } catch (err) {
      setError(t('tasks.error'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await offlineApi.post('farms/tasks/', formData)
      setFormData({ farm: '', title: '', frequency: 'daily', due_date: '', notes: '' })
      setShowForm(false)
      fetchData()
    } catch (err) {
      setError(t('tasks.error'))
    }
  }

  const toggleStatus = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    try {
      await offlineApi.patch(`farms/tasks/${task.id}/`, { status: newStatus })
      setTasks(tasks.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)))
    } catch (err) {
      setError(t('tasks.error'))
    }
  }

  const farmName = (farmId) => farms.find((f) => f.id === farmId)?.farm_name || 'Unknown farm'

  const pending = tasks.filter((t) => t.status !== 'completed')
  const completed = tasks.filter((t) => t.status === 'completed')

  return (
    <div className="tasks-container">
      <div className="tasks-header">
        <h1>{t('tasks.title')}</h1>
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? t('tasks.cancel') : t('tasks.addTask')}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="task-form">
          <select name="farm" value={formData.farm} onChange={handleChange} required>
            <option value="">{t('tasks.selectFarm')}</option>
            {farms.map((f) => (
              <option key={f.id} value={f.id}>{f.farm_name}</option>
            ))}
          </select>
          <input
            type="text"
            name="title"
            placeholder={t('tasks.taskTitle')}
            value={formData.title}
            onChange={handleChange}
            required
          />
          <select name="frequency" value={formData.frequency} onChange={handleChange}>
            <option value="daily">{t('tasks.daily')}</option>
            <option value="weekly">{t('tasks.weekly')}</option>
            <option value="monthly">{t('tasks.monthly')}</option>
            <option value="one_time">{t('tasks.oneTime')}</option>
          </select>
          {formData.frequency === 'one_time' && (
            <>
              <label className="task-form-label">{t('tasks.dueDate')}</label>
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
              />
            </>
          )}
          <textarea
            name="notes"
            placeholder={t('tasks.notes')}
            value={formData.notes}
            onChange={handleChange}
          />
          {error && <p className="tasks-error">{error}</p>}
          <button type="submit">{t('tasks.save')}</button>
        </form>
      )}

      {loading ? (
        <p>{t('tasks.loading')}</p>
      ) : tasks.length === 0 ? (
        <p>{t('tasks.empty')}</p>
      ) : (
        <>
          <div className="task-list">
            {pending.map((task) => (
              <div key={task.id} className="task-item">
                <input
                  type="checkbox"
                  checked={false}
                  onChange={() => toggleStatus(task)}
                />
                <div className="task-item-content">
                  <p className="task-title">{task.title}</p>
                  <p className="task-meta">
                    {farmName(task.farm)} Â· {task.frequency.replace('_', '-')}
                    {task.due_date && ` Â· due ${task.due_date}`}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {completed.length > 0 && (
            <div className="task-completed-section">
              <h2>{t('tasks.completed')}</h2>
              <div className="task-list">
                {completed.map((task) => (
                  <div key={task.id} className="task-item task-item-done">
                    <input
                      type="checkbox"
                      checked={true}
                      onChange={() => toggleStatus(task)}
                    />
                    <div className="task-item-content">
                      <p className="task-title">{task.title}</p>
                      <p className="task-meta">{farmName(task.farm)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}