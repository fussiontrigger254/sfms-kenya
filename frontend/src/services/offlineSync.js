// frontend/src/services/offlineSync.js
import { useState, useEffect } from 'react'
import apiClient from '../api/client'
import db from '../db'

let isSyncing = false
const listeners = new Set()

function notifyListeners(state) {
  listeners.forEach((listener) => listener(state))
}

/**
 * Background Sync Engine
 * Replays any queued actions stored while the farmer was offline.
 */
export async function processSyncQueue() {
  if (isSyncing || !navigator.onLine) return
  isSyncing = true
  notifyListeners({ isSyncing: true })

  try {
    const queue = await db.sync_queue.orderBy('id').toArray()

    for (const item of queue) {
      try {
        if (item.method === 'POST') {
          const res = await apiClient.post(item.endpoint, item.payload)
          // If the backend returned a new ID or updated data, save it
          if (item.tableName && res.data?.id) {
            await db[item.tableName].put({ ...res.data, _synced: true })
          }
        } else if (item.method === 'PATCH') {
          await apiClient.patch(item.endpoint, item.payload)
        } else if (item.method === 'DELETE') {
          await apiClient.delete(item.endpoint)
        }

        // Successfully synced — remove from queue
        await db.sync_queue.delete(item.id)
      } catch (err) {
        // If network error, stop sync and try again later
        if (!err.response) {
          console.warn('[Sync] Network error during sync queue replay, will retry when connected.')
          break
        }
        // If it's a 4xx error (e.g. invalid data or already deleted), remove to prevent blockage
        if (err.response.status >= 400 && err.response.status < 500) {
          console.warn(`[Sync] Discarding invalid queued task ${item.id}:`, err.response.data)
          await db.sync_queue.delete(item.id)
        }
      }
    }
  } catch (error) {
    console.error('[Sync] Error processing queue:', error)
  } finally {
    isSyncing = false
    const pendingCount = await db.sync_queue.count()
    notifyListeners({ isSyncing: false, pendingCount })
  }
}

// Auto-trigger sync when device comes back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[Sync] Network reconnected — triggering offline queue sync...')
    processSyncQueue()
  })
}

/**
 * Offline-First GET:
 * 1. Returns cached local data immediately.
 * 2. If online, fetches fresh data from Django, updates local DB, and returns it.
 */
export async function offlineGet(tableName, endpoint, params = {}) {
  let localData = []
  try {
    localData = await db[tableName].toArray()
  } catch (e) {
    console.warn(`[OfflineDB] Could not read ${tableName}:`, e)
  }

  if (navigator.onLine) {
    try {
      const res = await apiClient.get(endpoint, { params })
      const cloudData = Array.isArray(res.data) ? res.data : []

      // Mirror cloud records into Dexie
      if (cloudData.length > 0) {
        await db[tableName].bulkPut(
          cloudData.map((item) => ({ ...item, _synced: true }))
        )
      }
      return { data: cloudData, fromCache: false }
    } catch (err) {
      console.warn(`[OfflineDB] Cloud fetch failed for ${endpoint}, using local cache.`)
    }
  }

  return { data: localData, fromCache: true }
}

/**
 * Offline-First CREATE:
 * Saves immediately to the phone's Dexie DB and queues for cloud upload.
 */
export async function offlinePost(tableName, endpoint, payload) {
  const localId = payload.id || crypto.randomUUID()
  const record = {
    ...payload,
    id: localId,
    _synced: false,
    created_at: payload.created_at || new Date().toISOString(),
  }

  // 1. Save directly to local phone storage
  await db[tableName].put(record)

  // 2. Queue for background sync
  await db.sync_queue.add({
    tableName,
    endpoint,
    method: 'POST',
    payload: record,
    createdAt: new Date().toISOString(),
  })

  // 3. Try to sync immediately if online
  if (navigator.onLine) {
    processSyncQueue()
  }

  return record
}

/**
 * Offline-First UPDATE:
 */
export async function offlinePatch(tableName, endpoint, id, patchData) {
  await db[tableName].update(id, { ...patchData, _synced: false })

  await db.sync_queue.add({
    tableName,
    endpoint: `${endpoint}${id}/`,
    method: 'PATCH',
    payload: patchData,
    createdAt: new Date().toISOString(),
  })

  if (navigator.onLine) {
    processSyncQueue()
  }
}

/**
 * Offline-First DELETE:
 */
export async function offlineDelete(tableName, endpoint, id) {
  await db[tableName].delete(id)

  await db.sync_queue.add({
    tableName,
    endpoint: `${endpoint}${id}/`,
    method: 'DELETE',
    createdAt: new Date().toISOString(),
  })

  if (navigator.onLine) {
    processSyncQueue()
  }
}

/**
 * React Hook for UI to display live Sync & Offline Status
 */
export function useSyncStatus() {
  const [online, setOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )
  const [syncing, setSyncing] = useState(isSyncing)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    db.sync_queue.count().then(setPendingCount)

    const unsubscribe = (state) => {
      if (state.isSyncing !== undefined) setSyncing(state.isSyncing)
      if (state.pendingCount !== undefined) setPendingCount(state.pendingCount)
    }
    listeners.add(unsubscribe)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      listeners.delete(unsubscribe)
    }
  }, [])

  return {
    isOnline: online,
    isSyncing: syncing,
    pendingCount,
    triggerSync: processSyncQueue,
  }
}
