// frontend/src/pages/Crops.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../api/client'
import './Crops.css'

export default function Crops() {
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
        apiClient.get('crops/'),
        apiClient.get('farms/'),
      ])
      setCrops(cropsRes.data)
      setFarms(farmsRes.data)
    } catch (err) {
      setError('Could not load crops.')
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
      await apiClient.post('crops/', formData)
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
      setError('Could not create crop. Check the fields and try again.')
    }
  }

  const sprayLabel = (crop) => {
    if (crop.days_to_next_spray === null) return 'No spray scheduled'
    if (crop.days_to_next_spray < 0) return `Overdue by ${-crop.days_to_next_spray}d`
    if (crop.days_to_next_spray === 0) return 'Spray due today'
    return `Spray in ${crop.days_to_next_spray}d`
  }

  return (
    <div className="crops-container">
      <div className="crops-header">
        <h1>My Crops</h1>
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Crop'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="crop-form">
          <select name="farm" value={formData.farm} onChange={handleChange} required>
            <option value="">Select farm...</option>
            {farms.map((f) => (
              <option key={f.id} value={f.id}>{f.farm_name}</option>
            ))}
          </select>
          <input
            type="text"
            name="crop_name"
            placeholder="Crop name (e.g. Maize)"
            value={formData.crop_name}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="variety"
            placeholder="Variety (optional, e.g. H614D)"
            value={formData.variety}
            onChange={handleChange}
          />
          <label className="crop-form-label">Planting date</label>
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
            placeholder="Plot size (acres)"
            value={formData.plot_size}
            onChange={handleChange}
            required
          />
          <select name="season" value={formData.season} onChange={handleChange}>
            <option value="long_rains">Long Rains (Mar–Jun)</option>
            <option value="short_rains">Short Rains (Oct–Dec)</option>
            <option value="irrigation">Irrigation / Dry Season</option>
          </select>
          <label className="crop-form-label">Spray interval (days)</label>
          <input
            type="number"
            name="spray_interval_days"
            value={formData.spray_interval_days}
            onChange={handleChange}
          />
          {error && <p className="crops-error">{error}</p>}
          <button type="submit">Save Crop</button>
        </form>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : crops.length === 0 ? (
        <p>No crops yet. Add your first one above.</p>
      ) : (
        <div className="crops-list">
          {crops.map((crop) => (
            <Link to={`/crops/${crop.id}`} key={crop.id} className="crop-card">
              <h3>{crop.crop_name}</h3>
              {crop.variety && <p className="crop-variety">{crop.variety}</p>}
              <p>{crop.plot_size} acres · {crop.status}</p>
              <p className="crop-spray">{sprayLabel(crop)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}