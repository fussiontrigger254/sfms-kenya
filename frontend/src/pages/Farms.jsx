// frontend/src/pages/Farms.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import apiClient from '../api/client'
import './Farms.css'

export default function Farms() {
  const { t } = useTranslation()
  const [farms, setFarms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState({
    farm_name: '',
    location: '',
    farm_size: '',
    farm_type: 'mixed',
  })

  const fetchFarms = async () => {
    setLoading(true)
    try {
      const res = await apiClient.get('farms/')
      setFarms(res.data)
    } catch (err) {
      setError(t('farms.error'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFarms()
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await apiClient.post('farms/', formData)
      setFormData({ farm_name: '', location: '', farm_size: '', farm_type: 'mixed' })
      setShowForm(false)
      fetchFarms()
    } catch (err) {
      setError(t('farms.error'))
    }
  }

  return (
    <div className="farms-container">
      <div className="farms-header">
        <h1>{t('farms.title')}</h1>
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? t('farms.cancel') : t('farms.addFarm')}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="farm-form">
          <input
            type="text"
            name="farm_name"
            placeholder={t('farms.farmName')}
            value={formData.farm_name}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="location"
            placeholder={t('farms.location')}
            value={formData.location}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            step="0.1"
            name="farm_size"
            placeholder={t('farms.size')}
            value={formData.farm_size}
            onChange={handleChange}
            required
          />
          <select name="farm_type" value={formData.farm_type} onChange={handleChange}>
            <option value="crop">{t('farms.typeCrop')}</option>
            <option value="livestock">{t('farms.typeLivestock')}</option>
            <option value="mixed">{t('farms.typeMixed')}</option>
          </select>
          {error && <p className="farms-error">{error}</p>}
          <button type="submit">{t('farms.save')}</button>
        </form>
      )}

      {loading ? (
        <p>{t('farms.loading')}</p>
      ) : farms.length === 0 ? (
        <p>{t('farms.empty')}</p>
      ) : (
        <div className="farms-list">
          {farms.map((farm) => (
            <div key={farm.id} className="farm-card">
              <h3>{farm.farm_name}</h3>
              <p>{farm.location}</p>
              <p>{farm.farm_size} {t('farms.acres')} · {farm.farm_type}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}