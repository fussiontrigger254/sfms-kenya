// frontend/src/pages/Crops.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import apiClient from '../api/client'
import offlineApi from '../services/offlineApi'
import './Crops.css'

export default function Crops() {
  const { t } = useTranslation()
  const [crops, setCrops] = useState([])
  const [farms, setFarms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState({
    farm: '',
    crop_name: '',
    variety: '',
    planting_date: '',
    plot_size: '',
    season: 'long_rains',
    spray_interval_days: 14,
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const [cropsRes, farmsRes] = await Promise.all([
        offlineApi.get('crops/'),
        offlineApi.get('farms/'),
      ])
      setCrops(cropsRes.data)
      setFarms(farmsRes.data)
    } catch (err) {
      setError(t('crops.error'))
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
      await offlineApi.post('crops/', formData)
      setFormData({
        farm: '',
        crop_name: '',
        variety: '',
        planting_date: '',
        plot_size: '',
        season: 'long_rains',
        spray_interval_days: 14,
      })
      setShowForm(false)
      fetchData()
    } catch (err) {
      setError(t('crops.error'))
    }
  }

  const sprayLabel = (crop) => {
    if (crop.days_to_next_spray === null) return t('crops.noSpray')
    if (crop.days_to_next_spray < 0) return t('crops.overdue', { days: -crop.days_to_next_spray })
    if (crop.days_to_next_spray === 0) return t('crops.dueToday')
    return t('crops.dueIn', { days: crop.days_to_next_spray })
  }

  return (
    <div className="crops-container">
      <div className="crops-header">
        <h1>{t('crops.title')}</h1>
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? t('crops.cancel') : t('crops.addCrop')}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="crop-form">
          <select name="farm" value={formData.farm} onChange={handleChange} required>
            <option value="">{t('crops.selectFarm')}</option>
            {farms.map((f) => (
              <option key={f.id} value={f.id}>{f.farm_name}</option>
            ))}
          </select>
          <input
            type="text"
            name="crop_name"
            placeholder={t('crops.cropName')}
            value={formData.crop_name}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="variety"
            placeholder={t('crops.variety')}
            value={formData.variety}
            onChange={handleChange}
          />
          <label className="crop-form-label">{t('crops.plantingDate')}</label>
          <input
            type="date"
            name="planting_date"
            value={formData.planting_date}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            step="0.1"
            name="plot_size"
            placeholder={t('crops.plotSize')}
            value={formData.plot_size}
            onChange={handleChange}
            required
          />
          <select name="season" value={formData.season} onChange={handleChange}>
            <option value="long_rains">{t('crops.seasonLong')}</option>
            <option value="short_rains">{t('crops.seasonShort')}</option>
            <option value="irrigation">{t('crops.seasonIrrigation')}</option>
          </select>
          <label className="crop-form-label">{t('crops.sprayInterval')}</label>
          <input
            type="number"
            name="spray_interval_days"
            value={formData.spray_interval_days}
            onChange={handleChange}
          />
          {error && <p className="crops-error">{error}</p>}
          <button type="submit">{t('crops.save')}</button>
        </form>
      )}

      {loading ? (
        <p>{t('crops.loading')}</p>
      ) : crops.length === 0 ? (
        <p>{t('crops.empty')}</p>
      ) : (
        <div className="crops-list">
          {crops.map((crop) => (
            <Link to={`/crops/${crop.id}`} key={crop.id} className="crop-card">
              <h3>{crop.crop_name}</h3>
              {crop.variety && <p className="crop-variety">{crop.variety}</p>}
              <p>{crop.plot_size} {t('farms.acres')} Â· {crop.status}</p>
              <p className="crop-spray">{sprayLabel(crop)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}