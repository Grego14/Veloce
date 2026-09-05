import { initializeApp } from "firebase/app"
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics, isSupported, logEvent, type Analytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

export let analytics: Analytics | null = null

if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app)
    }
  })
}

interface ItemParam {
  item_id: string
  item_name: string
  price: number
  quantity?: number
}

interface TrackEventParams {
  currency?: string
  value?: number
  items?: ItemParam[]
  transaction_id?: string
  [key: string]: unknown
}

export function trackEvent(eventName: string, eventParams: TrackEventParams = {}) {
  if (analytics) logEvent(analytics, eventName, eventParams)
}
