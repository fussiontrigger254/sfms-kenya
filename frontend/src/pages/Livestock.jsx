// frontend/src/pages/Livestock.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../api/client'
import './Livestock.css'

const ANIMAL_TYPES = [
  ['dairy_cow', 'Dairy Cow'],
  ['beef_cow', 'Beef Cow'],
  ['goat', 'Goat'],
  ['sheep', 'Sheep'],
  ['chicken', 'Chicken'],
  ['pig', 'Pig'],
  ['other', 'Other'],
]

export default function Livestock() {
  const [animals, setAnimals] = useState([])
  const [farms, setFarms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState({
    farm: '',
    animal_tag: '',
    animal_type: 'dairy_cow',
    breed: '',
    birth_date: '',
    gender: 'female',
    weight_kg: '',
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const [animalsRes, farmsRes] = await Promise.all([
        apiClient.get('animals/'),
        apiClient.get('farms/'),
      ])
      setAnimals(animalsRes.data)
      setFarms(farmsRes.data)
    } catch (err) {
      setError('Could not load animals.')
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
      await apiClient.post('animals/', formData)
      setFormData({
        farm: '',
        animal_tag: '',
        animal_type: 'dairy_cow',
        breed: '',
        birth_date: '',
        gender: 'female',
        weight_kg: '',
      })
      setShowForm(false)
      fetchData()
    } catch (err) {
      setError('Could not add animal. Check the fields and try again.')
    }
  }

  const dueLabel = (animal) => {
    const upcoming = animal.health_records
      .filter((r) => r.days_to_next_due !== null)
      .sort((a, b) => a.days_to_next_due - b.days_to_next_due)[0]
    if (!upcoming) return null
    if (upcoming.days_to_next_due < 0) return `${-upcoming.days_to_next_due}d overdue`
    if (upcoming.days_to_next_due === 0) return 'Due today'
    return `Due in ${upcoming.days_to_next_due}d`
  }

  return (
    <div className="livestock-container">
      <div className="livestock-header">
        <h1>My Livestock</h1>
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Animal'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="animal-form">
          <select name="farm" value={formData.farm} onChange={handleChange} required>
            <option value="">Select farm...</option>
            {farms.map((f) => (
              <option key={f.id} value={f.id}>{f.farm_name}</option>
            ))}
          </select>
          <input
            type="text"
            name="animal_tag"
            placeholder="Tag (e.g. COW-001)"
            value={formData.animal_tag}
            onChange={handleChange}
            required
          />
          <select name="animal_type" value={formData.animal_type} onChange={handleChange}>
            {ANIMAL_TYPES.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <input
            type="text"
            name="breed"
            placeholder="Breed (optional, e.g. Friesian)"
            value={formData.breed}
            onChange={handleChange}
          />
          <label className="animal-form-label">Birth date (optional)</label>
          <input
            type="date"
            name="birth_date"
            value={formData.birth_date}
            onChange={handleChange}
          />
          <select name="gender" value={formData.gender} onChange={handleChange}>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
          <input
            type="number"
            step="0.1"
            name="weight_kg"
            placeholder="Weight (kg, optional)"
            value={formData.weight_kg}
            onChange={handleChange}
          />
          {error && <p className="livestock-error">{error}</p>}
          <button type="submit">Save Animal</button>
        </form>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : animals.length === 0 ? (
        <p>No animals yet. Add your first one above.</p>
      ) : (
        <div className="livestock-list">
          {animals.map((animal) => (
            <Link to={`/livestock/${animal.id}`} key={animal.id} className="animal-card">
              <h3>{animal.animal_tag}</h3>
              <p>
                {ANIMAL_TYPES.find(([v]) => v === animal.animal_type)?.[1] || animal.animal_type}
                {animal.breed && ` · ${animal.breed}`}
              </p>
              <p>{animal.age_years !== null ? `${animal.age_years} yrs` : 'Age unknown'} · {animal.status}</p>
              {dueLabel(animal) && <p className="animal-due">{dueLabel(animal)}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}