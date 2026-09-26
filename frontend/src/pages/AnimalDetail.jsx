// frontend/src/pages/AnimalDetail.jsx
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import apiClient from '../api/client'
import './AnimalDetail.css'

export default function AnimalDetail() {
  const { id } = useParams()
  const { t } = useTranslation()
  const [animal, setAnimal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState({
    record_type: 'vaccination',
    product_used: '',
    date_given: '',
    next_due_date: '',
    administered_by: '',
    notes: '',
  })

  const fetchAnimal = async () => {
    setLoading(true)
    try {
      const res = await apiClient.get(`animals/${id}/`)
      setAnimal(res.data)
    } catch (err) {
      setError('Could not load animal.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnimal()
  }, [id])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await apiClient.post('health/', { ...formData, animal: id })
      setFormData({
        record_type: 'vaccination',
        product_used: '',
        date_given: '',
        next_due_date: '',
        administered_by: '',
        notes: '',
      })
      setShowForm(false)
      fetchAnimal()
    } catch (err) {
      setError('Could not log health record.')
    }
  }

  if (loading) return <p className="animal-detail-container">{t('animalDetail.loading')}</p>
  if (!animal) return <p className="animal-detail-container">{t('animalDetail.notFound')}</p>

  return (
    <div className="animal-detail-container">
      <Link to="/livestock" className="back-link">{t('animalDetail.back')}</Link>
      <h1>{animal.animal_tag}</h1>
      <p>
        {animal.animal_type}{animal.breed && ` · ${animal.breed}`}
        {' · '}{animal.gender}
        {animal.age_years !== null && ` · ${animal.age_years} ${t('livestock.yrs')}`}
      </p>
      <p>{t('animalDetail.status')}: {animal.status}{animal.weight_kg && ` · ${animal.weight_kg}kg`}</p>

      {error && <p className="animal-detail-error">{error}</p>}

      <div className="animal-section">
        <div className="animal-section-header">
          <h2>{t('animalDetail.healthRecords')}</h2>
          <button onClick={() => setShowForm(!showForm)}>
            {showForm ? t('animalDetail.cancel') : t('animalDetail.logRecord')}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="animal-log-form">
            <select name="record_type" value={formData.record_type} onChange={handleChange}>
              <option value="vaccination">Vaccination</option>
              <option value="deworming">Deworming</option>
              <option value="treatment">Treatment</option>
              <option value="checkup">Checkup</option>
            </select>
            <input
              type="text"
              name="product_used"
              placeholder={t('animalDetail.productUsed')}
              value={formData.product_used}
              onChange={handleChange}
            />
            <label className="animal-form-label">{t('animalDetail.dateGiven')}</label>
            <input
              type="date"
              name="date_given"
              value={formData.date_given}
              onChange={handleChange}
              required
            />
            <label className="animal-form-label">{t('animalDetail.nextDueDate')}</label>
            <input
              type="date"
              name="next_due_date"
              value={formData.next_due_date}
              onChange={handleChange}
            />
            <input
              type="text"
              name="administered_by"
              placeholder={t('animalDetail.administeredBy')}
              value={formData.administered_by}
              onChange={handleChange}
            />
            <textarea
              name="notes"
              placeholder={t('animalDetail.notes')}
              value={formData.notes}
              onChange={handleChange}
            />
            <button type="submit">{t('animalDetail.save')}</button>
          </form>
        )}

        {animal.health_records.length === 0 ? (
          <p className="animal-empty">{t('animalDetail.noRecords')}</p>
        ) : (
          animal.health_records.map((r) => (
            <div key={r.id} className="animal-log-item">
              <strong>{r.record_type}</strong> — {r.date_given}
              {r.product_used && ` · ${r.product_used}`}
              {r.next_due_date && (
                <p className="animal-log-due">
                  {t('animalDetail.nextDue')}: {r.next_due_date}
                  {r.days_to_next_due !== null && ` (${r.days_to_next_due}d)`}
                </p>
              )}
              {r.notes && <p className="animal-log-notes">{r.notes}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  )
}