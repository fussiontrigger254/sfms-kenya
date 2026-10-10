// frontend/src/pwa.js
import { Capacitor } from '@capacitor/core'

export async function registerWebPwa() {
  if (Capacitor.isNativePlatform() || !('serviceWorker' in navigator)) return

  try {
    const registration = await navigator.serviceWorker.register('/sw.js')
    return registration
  } catch (error) {
    console.warn('PWA service worker registration failed.', error)
  }
}
