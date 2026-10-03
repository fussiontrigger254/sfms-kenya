// frontend/src/pages/Farms.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import apiClient from '../api/client'
import 'leaflet/dist/leaflet.css'
import './Farms.css'

const defaultMapCenter = [-0.0236, 37.9062]
const emptyForm = {
  farm_name: '',
  location: '',
  farm_size: '',
  farm_type: 'mixed',
  latitude: '',
  longitude: '',
}

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

function LocationMarker({ position, onChange }) {
  useMapEvents({
    click(event) {
      onChange(event.latlng.lat, event.latlng.lng)
    },
  })

  return position ? <Marker position={position} icon={markerIcon} /> : null
}

function getErrorMessage(error, fallback) {
  const data = error.response?.data
  const message = data?.location || data?.detail
  return Array.isArray(message) ? message[0] : message || fallback
}

export default function Farms() {
  const { t } = useTranslation()
  const [farms, setFarms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingFarm, setEditingFarm] = useState(null)
  const [formData, setFormData] = useState(emptyForm)

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

  const setCoordinates = (latitude, longitude) => {
    setFormData((current) => ({
      ...current,
      latitude: Number(latitude).toFixed(6),
      longitude: Number(longitude).toFixed(6),
    }))
  }

  const useCurrentLocation = () => {
    setError('')

    if (!navigator.geolocation) {
      setError('Your browser does not support location detection.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => setCoordinates(
        position.coords.latitude,
        position.coords.longitude,
      ),
      () => setError('Unable to detect your location. Allow location access or enter coordinates manually.'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  }

  const openCreateForm = () => {
    setEditingFarm(null)
    setFormData(emptyForm)
    setError('')
    setShowForm(true)
  }

  const openEditForm = (farm) => {
    setEditingFarm(farm)
    setFormData({
      farm_name: farm.farm_name || '',
      location: farm.location || '',
      farm_size: farm.farm_size || '',
      farm_type: farm.farm_type || 'mixed',
      latitude: farm.latitude || '',
      longitude: farm.longitude || '',
    })
    setError('')
    setShowForm(true)
  }

  const closeForm = () => {
    setEditingFarm(null)
    setFormData(emptyForm)
    setError('')
    setShowForm(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const payload = {
      farm_name: formData.farm_name,
      location: formData.location,
      farm_size: formData.farm_size,
      farm_type: formData.farm_type,
      latitude: formData.latitude || null,
      longitude: formData.longitude || null,
    }

    try {
      if (editingFarm) {
        await apiClient.patch(`farms/${editingFarm.id}/`, payload)
      } else {
        await apiClient.post('farms/', payload)
      }

      closeForm()
      await fetchFarms()
    } catch (err) {
      setError(getErrorMessage(err, t('farms.error')))
    }
  }

  const handleDelete = async (farm) => {
    const confirmed = window.confirm(
      `Delete ${farm.farm_name}? This will also delete its related records.`
    )

    if (!confirmed) return

    setError('')
    try {
      await apiClient.delete(`farms/${farm.id}/`)
      setFarms((currentFarms) => currentFarms.filter((item) => item.id !== farm.id))
    } catch (err) {
      setError(t('farms.error'))
    }
  }

  const latitude = Number(formData.latitude)
  const longitude = Number(formData.longitude)
  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude)
  const mapPosition = hasCoordinates ? [latitude, longitude] : defaultMapCenter

  return (
    <div className="farms-container">
      <div className="farms-header">
        <h1>{t('farms.title')}</h1>
        <button onClick={showForm ? closeForm : openCreateForm}>
          {showForm ? t('farms.cancel') : t('farms.addFarm')}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="farm-form">
          <h2>{editingFarm ? 'Edit Farm' : t('farms.addFarm')}</h2>
          <input type="text" name="farm_name" placeholder={t('farms.farmName')} value={formData.farm_name} onChange={handleChange} required />
          <input type="text" name="location" placeholder="Location or nearest town" value={formData.location} onChange={handleChange} required />
          <input type="number" step="0.1" min="0.01" name="farm_size" placeholder={t('farms.size')} value={formData.farm_size} onChange={handleChange} required />
          <select name="farm_type" value={formData.farm_type} onChange={handleChange}>
            <option value="crop">{t('farms.typeCrop')}</option>
            <option value="livestock">{t('farms.typeLivestock')}</option>
            <option value="mixed">{t('farms.typeMixed')}</option>
          </select>

          <div className="location-tools">
            <div className="location-tools-header">
              <strong>Farm coordinates</strong>
              <span>Optional: use GPS, enter them, or select a map point.</span>
            </div>
            <div className="coordinate-fields">
              <input type="number" step="any" name="latitude" placeholder="Latitude" value={formData.latitude} onChange={handleChange} />
              <input type="number" step="any" name="longitude" placeholder="Longitude" value={formData.longitude} onChange={handleChange} />
            </div>
            <button type="button" className="location-button" onClick={useCurrentLocation}>
              Use my current location
            </button>
            <div className="farm-map-wrapper">
              <MapContainer center={mapPosition} zoom={hasCoordinates ? 14 : 6} scrollWheelZoom className="farm-map">
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={hasCoordinates ? mapPosition : null} onChange={setCoordinates} />
              </MapContainer>
            </div>
            <small>Click the map to place the exact farm pin.</small>
          </div>

          {error && <p className="farms-error">{error}</p>}
          <button type="submit">{editingFarm ? 'Update Farm' : t('farms.save')}</button>
        </form>
      )}

      {!showForm && error && <p className="farms-error">{error}</p>}

      {loading ? <p>{t('farms.loading')}</p> : farms.length === 0 ? <p>{t('farms.empty')}</p> : (
        <div className="farms-list">
          {farms.map((farm) => (
            <div key={farm.id} className="farm-card">
              <div className="farm-card-content">
                <h3>{farm.farm_name}</h3>
                <p>{farm.location}</p>
                <p>{farm.farm_size} {t('farms.acres')} · {farm.farm_type}</p>
              </div>
              <div className="farm-actions">
                <button className="farm-edit-button" onClick={() => openEditForm(farm)}>Edit</button>
                <button className="farm-delete-button" onClick={() => handleDelete(farm)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
