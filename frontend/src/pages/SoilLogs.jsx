// frontend/src/pages/SoilLogs.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import apiClient from '../api/client'
import offlineApi from '../services/offlineApi'
import './SoilLogs.css'

export default function SoilLogs() {
  const { t } = useTranslation()
  const [logs, setLogs] = useState([])
  const [farms, setFarms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState({
    farm: '',
    test_date: '',
    ph_level: '',
    soil_type: '',
    last_fertilised: '',
    notes: '',
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const [logsRes, farmsRes] = await Promise.all([
        offlineApi.get('farms/soil-logs/'),
        offlineApi.get('farms/'),
      ])
      setLogs(logsRes.data)
      setFarms(farmsRes.data)
    } catch (err) {
      setError(t('soilLogs.error'))
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
      await offlineApi.post('farms/soil-logs/', formData)
      setFormData({
        farm: '',
        test_date: '',
        ph_level: '',
        soil_type: '',
        last_fertilised: '',
        notes: '',
      })
      setShowForm(false)
      fetchData()
    } catch (err) {
      setError(t('soilLogs.error'))
    }
  }

  const farmName = (farmId) => farms.find((f) => f.id === farmId)?.farm_name || 'Unknown farm'

  return (
    <div className="soil-container">
      <div className="soil-header">
        <h1>{t('soilLogs.title')}</h1>
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? t('soilLogs.cancel') : t('soilLogs.addTest')}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="soil-form">
          <select name="farm" value={formData.farm} onChange={handleChange} required>
            <option value="">{t('soilLogs.selectFarm')}</option>
            {farms.map((f) => (
              <option key={f.id} value={f.id}>{f.farm_name}</option>
            ))}
          </select>
          <label className="soil-form-label">{t('soilLogs.testDate')}</label>
          <input
            type="date"
            name="test_date"
            value={formData.test_date}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            step="0.01"
            name="ph_level"
            placeholder={t('soilLogs.phLevel')}
            value={formData.ph_level}
            onChange={handleChange}
          />
          <input
            type="text"
            name="soil_type"
            placeholder={t('soilLogs.soilType')}
            value={formData.soil_type}
            onChange={handleChange}
          />
          <label className="soil-form-label">{t('soilLogs.lastFertilised')}</label>
          <input
            type="date"
            name="last_fertilised"
            value={formData.last_fertilised}
            onChange={handleChange}
          />
          <textarea
            name="notes"
            placeholder={t('soilLogs.notes')}
            value={formData.notes}
            onChange={handleChange}
          />
          {error && <p className="soil-error">{error}</p>}
          <button type="submit">{t('soilLogs.save')}</button>
        </form>
      )}

      {loading ? (
        <p>{t('soilLogs.loading')}</p>
      ) : logs.length === 0 ? (
        <p>{t('soilLogs.empty')}</p>
      ) : (
        <div className="soil-list">
          {logs.map((log) => (
            <div key={log.id} className="soil-card">
              <h3>{farmName(log.farm)}</h3>
              <p>{t('soilLogs.tested')}: {log.test_date}</p>
              {log.ph_level && <p>pH: {log.ph_level}</p>}
              {log.soil_type && <p>{t('soilLogs.type')}: {log.soil_type}</p>}
              {log.last_fertilised && <p>{t('soilLogs.lastFertilised')}: {log.last_fertilised}</p>}
              {log.notes && <p className="soil-notes">{log.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}