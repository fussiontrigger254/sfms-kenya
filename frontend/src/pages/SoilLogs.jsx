// frontend/src/pages/SoilLogs.jsx
import { useState, useEffect } from 'react'
import apiClient from '../api/client'
import './SoilLogs.css'

export default function SoilLogs() {
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
        apiClient.get('farms/soil-logs/'),
        apiClient.get('farms/'),
      ])
      setLogs(logsRes.data)
      setFarms(farmsRes.data)
    } catch (err) {
      setError('Could not load soil logs.')
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
      await apiClient.post('farms/soil-logs/', formData)
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
      setError('Could not save soil log. Check the fields and try again.')
    }
  }

  const farmName = (farmId) => farms.find((f) => f.id === farmId)?.farm_name || 'Unknown farm'

  return (
    <div className="soil-container">
      <div className="soil-header">
        <h1>Soil Logs</h1>
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Soil Test'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="soil-form">
          <select name="farm" value={formData.farm} onChange={handleChange} required>
            <option value="">Select farm...</option>
            {farms.map((f) => (
              <option key={f.id} value={f.id}>{f.farm_name}</option>
            ))}
          </select>
          <label className="soil-form-label">Test date</label>
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
            placeholder="pH level (optional, e.g. 6.5)"
            value={formData.ph_level}
            onChange={handleChange}
          />
          <input
            type="text"
            name="soil_type"
            placeholder="Soil type (optional, e.g. Clay, Loam, Sandy)"
            value={formData.soil_type}
            onChange={handleChange}
          />
          <label className="soil-form-label">Last fertilised (optional)</label>
          <input
            type="date"
            name="last_fertilised"
            value={formData.last_fertilised}
            onChange={handleChange}
          />
          <textarea
            name="notes"
            placeholder="Notes (optional)"
            value={formData.notes}
            onChange={handleChange}
          />
          {error && <p className="soil-error">{error}</p>}
          <button type="submit">Save Soil Log</button>
        </form>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : logs.length === 0 ? (
        <p>No soil logs yet. Add your first test above.</p>
      ) : (
        <div className="soil-list">
          {logs.map((log) => (
            <div key={log.id} className="soil-card">
              <h3>{farmName(log.farm)}</h3>
              <p>Tested: {log.test_date}</p>
              {log.ph_level && <p>pH: {log.ph_level}</p>}
              {log.soil_type && <p>Type: {log.soil_type}</p>}
              {log.last_fertilised && <p>Last fertilised: {log.last_fertilised}</p>}
              {log.notes && <p className="soil-notes">{log.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}