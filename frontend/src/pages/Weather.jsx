// frontend/src/pages/Weather.jsx
import { useState, useEffect } from 'react'
import apiClient from '../api/client'
import './Weather.css'

export default function Weather() {
  const [farms, setFarms] = useState([])
  const [selectedFarm, setSelectedFarm] = useState('')
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const res = await apiClient.get('farms/')
        setFarms(res.data)
        if (res.data.length > 0) setSelectedFarm(res.data[0].id)
      } catch (err) {
        setError('Could not load farms.')
      }
    }
    fetchFarms()
  }, [])

  useEffect(() => {
    if (!selectedFarm) return

    const fetchWeather = async () => {
      setLoading(true)
      setError('')
      setWeather(null)
      try {
        const res = await apiClient.get(`weather/${selectedFarm}/`)
        setWeather(res.data)
      } catch (err) {
        if (err.response?.status === 400) {
          setError('This farm has no location coordinates set. Edit it to add latitude/longitude.')
        } else {
          setError('Could not load weather for this farm.')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchWeather()
  }, [selectedFarm])

  return (
    <div className="weather-container">
      <h1>Weather Forecast</h1>

      {farms.length === 0 ? (
        <p>Add a farm first to see its weather forecast.</p>
      ) : (
        <select value={selectedFarm} onChange={(e) => setSelectedFarm(e.target.value)}>
          {farms.map((f) => (
            <option key={f.id} value={f.id}>{f.farm_name}</option>
          ))}
        </select>
      )}

      {loading && <p>Loading forecast...</p>}
      {error && <p className="weather-error">{error}</p>}

      {weather && (
        <>
          {weather.spray_conflicts.length > 0 && (
            <div className="weather-alert">
              ⚠️ Rain expected on a scheduled spray date:
              {weather.spray_conflicts.map((c, i) => (
                <p key={i}>{c.crop_name} — spray due {c.next_spray_date}. Consider rescheduling.</p>
              ))}
            </div>
          )}

          <div className="weather-forecast">
            {weather.forecast.map((day) => (
              <div key={day.date} className={`weather-day ${day.rain_expected ? 'weather-day-rain' : ''}`}>
                <p className="weather-date">{day.date}</p>
                <p className="weather-temp">{day.temp_min}° – {day.temp_max}°C</p>
                <p className="weather-condition">{day.condition}</p>
                {day.rain_expected && <p className="weather-rain">🌧️ {day.rain_mm}mm expected</p>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}