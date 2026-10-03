// frontend/src/services/offlineApi.js
import apiClient from '../api/client'
import db from '../db'

const tableForEndpoint = (endpoint) => {
  if (endpoint.startsWith('farms/tasks')) return 'tasks'
  if (endpoint.startsWith('farms/soil-logs')) return 'soil_logs'
  if (endpoint.startsWith('farms/')) return 'farms'
  if (endpoint.startsWith('crops')) return 'crops'
  if (endpoint.startsWith('sprays')) return 'sprays'
  if (endpoint.startsWith('harvests')) return 'harvests'
  if (endpoint.startsWith('animals')) return 'animals'
  if (endpoint.startsWith('health')) return 'health'
  if (endpoint.startsWith('financials/records')) return 'financials'
  if (endpoint.startsWith('community/posts')) return 'community_posts'
  if (endpoint.startsWith('notifications')) return 'notifications'
  return null
}

const tableKey = (endpoint) => endpoint.split('?')[0].replace(/\/$/, '').split('/').pop()

async function cacheResponse(tableName, data) {
  if (!tableName || !db[tableName]) return
  if (Array.isArray(data)) {
    await db[tableName].bulkPut(data.map((item) => ({ ...item, _synced: true })))
  } else if (data?.id) {
    await db[tableName].put({ ...data, _synced: true })
  }
}

async function cachedData(tableName, endpoint) {
  if (!tableName || !db[tableName]) return []
  const id = tableKey(endpoint)
  if (id && id !== tableName && await db[tableName].get(id)) {
    return await db[tableName].get(id)
  }
  return db[tableName].toArray()
}

async function queueMutation(tableName, endpoint, method, payload) {
  const id = payload?.id || crypto.randomUUID()
  const record = payload ? { ...payload, id, _synced: false } : null

  if (record && db[tableName]) await db[tableName].put(record)
  await db.sync_queue.add({
    tableName,
    endpoint,
    method,
    payload: record || payload,
    createdAt: new Date().toISOString(),
  })

  return record || payload
}

export const offlineApi = {
  async get(endpoint, config = {}) {
    const tableName = tableForEndpoint(endpoint)
    if (navigator.onLine) {
      try {
        const response = await apiClient.get(endpoint, config)
        await cacheResponse(tableName, response.data)
        return response
      } catch (error) {
        if (error.response) throw error
      }
    }

    return { data: await cachedData(tableName, endpoint), offline: true }
  },

  async post(endpoint, payload) {
    const tableName = tableForEndpoint(endpoint)
    if (navigator.onLine) {
      try {
        const response = await apiClient.post(endpoint, payload)
        await cacheResponse(tableName, response.data)
        return response
      } catch (error) {
        if (error.response) throw error
      }
    }

    return { data: await queueMutation(tableName, endpoint, 'POST', payload), offline: true }
  },

  async patch(endpoint, payload) {
    const tableName = tableForEndpoint(endpoint)
    if (navigator.onLine) {
      try {
        const response = await apiClient.patch(endpoint, payload)
        await cacheResponse(tableName, response.data)
        return response
      } catch (error) {
        if (error.response) throw error
      }
    }

    const recordId = endpoint.replace(/\/$/, '').split('/').pop()
    const current = tableName && db[tableName] ? await db[tableName].get(recordId) : {}
    const updated = { ...current, ...payload, id: recordId, _synced: false }
    if (tableName && db[tableName]) await db[tableName].put(updated)
    await db.sync_queue.add({ tableName, endpoint, method: 'PATCH', payload, createdAt: new Date().toISOString() })
    return { data: updated, offline: true }
  },

  async delete(endpoint) {
    const tableName = tableForEndpoint(endpoint)
    if (navigator.onLine) {
      try {
        const response = await apiClient.delete(endpoint)
        const id = endpoint.replace(/\/$/, '').split('/').pop()
        if (tableName && db[tableName]) await db[tableName].delete(id)
        return response
      } catch (error) {
        if (error.response) throw error
      }
    }

    const id = endpoint.replace(/\/$/, '').split('/').pop()
    if (tableName && db[tableName]) await db[tableName].delete(id)
    await db.sync_queue.add({ tableName, endpoint, method: 'DELETE', createdAt: new Date().toISOString() })
    return { data: null, offline: true }
  },
}

export default offlineApi
