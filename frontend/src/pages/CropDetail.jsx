// frontend/src/pages/CropDetail.jsx
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import apiClient from '../api/client'
import './CropDetail.css'

export default function CropDetail() {
  const { id } = useParams()
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
      const res = await apiClient.get(`crops/${id}/`)
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
      await apiClient.post('sprays/', { ...sprayData, crop: id })
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
      await apiClient.post('harvests/', { ...harvestData, crop: id })
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

  if (loading) return <p className="crop-detail-container">Loading...</p>
  if (!crop) return <p className="crop-detail-container">Crop not found.</p>

  return (
    <div className="crop-detail-container">
      <Link to="/crops" className="back-link">← Back to Crops</Link>
      <h1>{crop.crop_name}</h1>
      {crop.variety && <p className="crop-variety">{crop.variety}</p>}
      <p>Status: {crop.status} · {crop.plot_size} acres</p>
      <p>Planted: {crop.planting_date}</p>
      {crop.next_spray_date && (
        <p className="crop-next-spray">
          Next spray: {crop.next_spray_date}
          {crop.days_to_next_spray !== null && ` (${crop.days_to_next_spray}d)`}
        </p>
      )}

      {error && <p className="crop-detail-error">{error}</p>}

      <div className="crop-section">
        <div className="crop-section-header">
          <h2>Spray Logs</h2>
          <button onClick={() => setShowSprayForm(!showSprayForm)}>
            {showSprayForm ? 'Cancel' : '+ Log Spray'}
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
              placeholder="Product used (optional)"
              value={sprayData.product_used}
              onChange={(e) => setSprayData({ ...sprayData, product_used: e.target.value })}
            />
            <textarea
              placeholder="Notes (optional)"
              value={sprayData.notes}
              onChange={(e) => setSprayData({ ...sprayData, notes: e.target.value })}
            />
            <button type="submit">Save Spray Log</button>
          </form>
        )}

        {crop.spray_logs.length === 0 ? (
          <p className="crop-empty">No sprays logged yet.</p>
        ) : (
          crop.spray_logs.map((s) => (
            <div key={s.id} className="crop-log-item">
              <strong>{s.spray_date}</strong> {s.product_used && `· ${s.product_used}`}
              {s.notes && <p className="crop-log-notes">{s.notes}</p>}
            </div>
          ))
        )}
      </div>

      <div className="crop-section">
        <div className="crop-section-header">
          <h2>Harvest Logs</h2>
          <button onClick={() => setShowHarvestForm(!showHarvestForm)}>
            {showHarvestForm ? 'Cancel' : '+ Log Harvest'}
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
              placeholder="Expected yield (kg)"
              value={harvestData.expected_yield_kg}
              onChange={(e) => setHarvestData({ ...harvestData, expected_yield_kg: e.target.value })}
              required
            />
            <input
              type="number"
              step="0.1"
              placeholder="Actual yield (kg)"
              value={harvestData.actual_yield_kg}
              onChange={(e) => setHarvestData({ ...harvestData, actual_yield_kg: e.target.value })}
              required
            />
            <select
              value={harvestData.quality_grade}
              onChange={(e) => setHarvestData({ ...harvestData, quality_grade: e.target.value })}
            >
              <option value="A">Grade A</option>
              <option value="B">Grade B</option>
              <option value="C">Grade C</option>
              <option value="custom">Custom</option>
            </select>
            <textarea
              placeholder="Notes (optional)"
              value={harvestData.notes}
              onChange={(e) => setHarvestData({ ...harvestData, notes: e.target.value })}
            />
            <button type="submit">Save Harvest Log</button>
          </form>
        )}

        {crop.harvest_logs.length === 0 ? (
          <p className="crop-empty">No harvests logged yet.</p>
        ) : (
          crop.harvest_logs.map((h) => (
            <div key={h.id} className="crop-log-item">
              <strong>{h.harvest_date}</strong> · {h.actual_yield_kg}kg
              {' '}({h.yield_variance_kg >= 0 ? '+' : ''}{h.yield_variance_kg}kg vs expected)
              · Grade {h.quality_grade}
              {h.notes && <p className="crop-log-notes">{h.notes}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  )
}