// frontend/src/pages/Farms.jsx
import { useState, useEffect } from 'react'
import apiClient from '../api/client'
import './Farms.css'

export default function Farms() {
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
      setError('Could not load farms.')
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
      setError('Could not create farm. Check the fields and try again.')
    }
  }

  return (
    <div className="farms-container">
      <div className="farms-header">
        <h1>My Farms</h1>
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Farm'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="farm-form">
          <input
            type="text"
            name="farm_name"
            placeholder="Farm name"
            value={formData.farm_name}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="location"
            placeholder="Location (e.g. Nakuru, Njoro)"
            value={formData.location}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            step="0.1"
            name="farm_size"
            placeholder="Size (acres)"
            value={formData.farm_size}
            onChange={handleChange}
            required
          />
          <select name="farm_type" value={formData.farm_type} onChange={handleChange}>
            <option value="crop">Crop</option>
            <option value="livestock">Livestock</option>
            <option value="mixed">Mixed</option>
          </select>
          {error && <p className="farms-error">{error}</p>}
          <button type="submit">Save Farm</button>
        </form>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : farms.length === 0 ? (
        <p>No farms yet. Add your first one above.</p>
      ) : (
        <div className="farms-list">
          {farms.map((farm) => (
            <div key={farm.id} className="farm-card">
              <h3>{farm.farm_name}</h3>
              <p>{farm.location}</p>
              <p>{farm.farm_size} acres · {farm.farm_type}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}