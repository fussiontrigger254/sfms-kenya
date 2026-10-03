// frontend/src/pages/CropDetail.jsx
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import apiClient from '../api/client'
import offlineApi from '../services/offlineApi'
import './CropDetail.css'

export default function CropDetail() {
  const { id } = useParams()
  const { t } = useTranslation()
  const [crop, setCrop] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showSprayForm, setShowSprayForm] = useState(false)
  const [showHarvestForm, setShowHarvestForm] = useState(false)

  const [sprayData, setSprayData] = useState({
    spray_date: '',
    product_used: '',
    notes: '',
  })

  const [harvestData, setHarvestData] = useState({
    harvest_date: '',
    expected_yield_kg: '',
    actual_yield_kg: '',
    quality_grade: 'A',
    notes: '',
  })

  const fetchCrop = async () => {
    setLoading(true)
    try {
      const res = await offlineApi.get(`crops/${id}/`)
      setCrop(res.data)
    } catch (err) {
      setError('Could not load crop.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCrop()
  }, [id])

  const handleSpraySubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await offlineApi.post('sprays/', { ...sprayData, crop: id })
      setSprayData({ spray_date: '', product_used: '', notes: '' })
      setShowSprayForm(false)
      fetchCrop()
    } catch (err) {
      setError('Could not log spray.')
    }
  }

  const handleHarvestSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await offlineApi.post('harvests/', { ...harvestData, crop: id })
      setHarvestData({
        harvest_date: '',
        expected_yield_kg: '',
        actual_yield_kg: '',
        quality_grade: 'A',
        notes: '',
      })
      setShowHarvestForm(false)
      fetchCrop()
    } catch (err) {
      setError('Could not log harvest.')
    }
  }

  if (loading) return <p className="crop-detail-container">{t('cropDetail.loading')}</p>
  if (!crop) return <p className="crop-detail-container">{t('cropDetail.notFound')}</p>

  return (
    <div className="crop-detail-container">
      <Link to="/crops" className="back-link">{t('cropDetail.back')}</Link>
      <h1>{crop.crop_name}</h1>
      {crop.variety && <p className="crop-variety">{crop.variety}</p>}
      <p>{t('cropDetail.status')}: {crop.status} Â· {crop.plot_size} {t('farms.acres')}</p>
      <p>{t('cropDetail.planted')}: {crop.planting_date}</p>
      {crop.next_spray_date && (
        <p className="crop-next-spray">
          {t('cropDetail.nextSpray')}: {crop.next_spray_date}
          {crop.days_to_next_spray !== null && ` (${crop.days_to_next_spray}d)`}
        </p>
      )}

      {error && <p className="crop-detail-error">{error}</p>}

      <div className="crop-section">
        <div className="crop-section-header">
          <h2>{t('cropDetail.sprayLogs')}</h2>
          <button onClick={() => setShowSprayForm(!showSprayForm)}>
            {showSprayForm ? t('cropDetail.cancel') : t('cropDetail.logSpray')}
          </button>
        </div>

        {showSprayForm && (
          <form onSubmit={handleSpraySubmit} className="crop-log-form">
            <input
              type="date"
              value={sprayData.spray_date}
              onChange={(e) => setSprayData({ ...sprayData, spray_date: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder={t('cropDetail.productUsed')}
              value={sprayData.product_used}
              onChange={(e) => setSprayData({ ...sprayData, product_used: e.target.value })}
            />
            <textarea
              placeholder={t('cropDetail.notes')}
              value={sprayData.notes}
              onChange={(e) => setSprayData({ ...sprayData, notes: e.target.value })}
            />
            <button type="submit">{t('cropDetail.saveSpray')}</button>
          </form>
        )}

        {crop.spray_logs.length === 0 ? (
          <p className="crop-empty">{t('cropDetail.noSprays')}</p>
        ) : (
          crop.spray_logs.map((s) => (
            <div key={s.id} className="crop-log-item">
              <strong>{s.spray_date}</strong> {s.product_used && `Â· ${s.product_used}`}
              {s.notes && <p className="crop-log-notes">{s.notes}</p>}
            </div>
          ))
        )}
      </div>

      <div className="crop-section">
        <div className="crop-section-header">
          <h2>{t('cropDetail.harvestLogs')}</h2>
          <button onClick={() => setShowHarvestForm(!showHarvestForm)}>
            {showHarvestForm ? t('cropDetail.cancel') : t('cropDetail.logHarvest')}
          </button>
        </div>

        {showHarvestForm && (
          <form onSubmit={handleHarvestSubmit} className="crop-log-form">
            <input
              type="date"
              value={harvestData.harvest_date}
              onChange={(e) => setHarvestData({ ...harvestData, harvest_date: e.target.value })}
              required
            />
            <input
              type="number"
              step="0.1"
              placeholder={t('cropDetail.expectedYield')}
              value={harvestData.expected_yield_kg}
              onChange={(e) => setHarvestData({ ...harvestData, expected_yield_kg: e.target.value })}
              required
            />
            <input
              type="number"
              step="0.1"
              placeholder={t('cropDetail.actualYield')}
              value={harvestData.actual_yield_kg}
              onChange={(e) => setHarvestData({ ...harvestData, actual_yield_kg: e.target.value })}
              required
            />
            <select
              value={harvestData.quality_grade}
              onChange={(e) => setHarvestData({ ...harvestData, quality_grade: e.target.value })}
            >
              <option value="A">{t('cropDetail.gradeA')}</option>
              <option value="B">{t('cropDetail.gradeB')}</option>
              <option value="C">{t('cropDetail.gradeC')}</option>
              <option value="custom">{t('cropDetail.gradeCustom')}</option>
            </select>
            <textarea
              placeholder={t('cropDetail.notes')}
              value={harvestData.notes}
              onChange={(e) => setHarvestData({ ...harvestData, notes: e.target.value })}
            />
            <button type="submit">{t('cropDetail.saveHarvest')}</button>
          </form>
        )}

        {crop.harvest_logs.length === 0 ? (
          <p className="crop-empty">{t('cropDetail.noHarvests')}</p>
        ) : (
          crop.harvest_logs.map((h) => (
            <div key={h.id} className="crop-log-item">
              <strong>{h.harvest_date}</strong> Â· {h.actual_yield_kg}kg
              {' '}({h.yield_variance_kg >= 0 ? '+' : ''}{h.yield_variance_kg}kg {t('cropDetail.vsExpected')})
              Â· {t('cropDetail.grade')} {h.quality_grade}
              {h.notes && <p className="crop-log-notes">{h.notes}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  )
}