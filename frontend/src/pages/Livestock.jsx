// frontend/src/pages/Livestock.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
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
      setError(t('livestock.error'))
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
      setError(t('livestock.error'))
    }
  }

  const dueLabel = (animal) => {
    const upcoming = animal.health_records
      .filter((r) => r.days_to_next_due !== null)
      .sort((a, b) => a.days_to_next_due - b.days_to_next_due)[0]
    if (!upcoming) return null
    if (upcoming.days_to_next_due < 0) return t('livestock.overdue', { days: -upcoming.days_to_next_due })
    if (upcoming.days_to_next_due === 0) return t('livestock.dueToday')
    return t('livestock.dueIn', { days: upcoming.days_to_next_due })
  }

  return (
    <div className="livestock-container">
      <div className="livestock-header">
        <h1>{t('livestock.title')}</h1>
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? t('livestock.cancel') : t('livestock.addAnimal')}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="animal-form">
          <select name="farm" value={formData.farm} onChange={handleChange} required>
            <option value="">{t('livestock.selectFarm')}</option>
            {farms.map((f) => (
              <option key={f.id} value={f.id}>{f.farm_name}</option>
            ))}
          </select>
          <input
            type="text"
            name="animal_tag"
            placeholder={t('livestock.tag')}
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
            placeholder={t('livestock.breed')}
            value={formData.breed}
            onChange={handleChange}
          />
          <label className="animal-form-label">{t('livestock.birthDate')}</label>
          <input
            type="date"
            name="birth_date"
            value={formData.birth_date}
            onChange={handleChange}
          />
          <select name="gender" value={formData.gender} onChange={handleChange}>
            <option value="female">{t('livestock.genderFemale')}</option>
            <option value="male">{t('livestock.genderMale')}</option>
          </select>
          <input
            type="number"
            step="0.1"
            name="weight_kg"
            placeholder={t('livestock.weight')}
            value={formData.weight_kg}
            onChange={handleChange}
          />
          {error && <p className="livestock-error">{error}</p>}
          <button type="submit">{t('livestock.save')}</button>
        </form>
      )}

      {loading ? (
        <p>{t('livestock.loading')}</p>
      ) : animals.length === 0 ? (
        <p>{t('livestock.empty')}</p>
      ) : (
        <div className="livestock-list">
          {animals.map((animal) => (
            <Link to={`/livestock/${animal.id}`} key={animal.id} className="animal-card">
              <h3>{animal.animal_tag}</h3>
              <p>
                {ANIMAL_TYPES.find(([v]) => v === animal.animal_type)?.[1] || animal.animal_type}
                {animal.breed && ` · ${animal.breed}`}
              </p>
              <p>{animal.age_years !== null ? `${animal.age_years} ${t('livestock.yrs')}` : t('livestock.ageUnknown')} · {animal.status}</p>
              {dueLabel(animal) && <p className="animal-due">{dueLabel(animal)}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}