// frontend/src/api/client.js
import axios from 'axios'
import { auth } from '../firebase'

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach the current Firebase user's ID token to every outgoing request
apiClient.interceptors.request.use(async (config) => {
  const user = auth.currentUser
  if (user) {
    const token = await user.getIdToken()
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Optional: handle 401s globally (e.g. token expired) in one place
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized — Firebase token may be missing or expired.')
    }
    return Promise.reject(error)
  }
)

export default apiClient