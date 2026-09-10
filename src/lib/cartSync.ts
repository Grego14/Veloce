import { auth, trackEvent, app } from './firebase'
import type { Firestore } from 'firebase/firestore'
import { ensureAnonymousUser } from '@stores/authStore'

let db: Firestore

export async function getFirestoreMethods() {
  const { doc, getDoc, setDoc, getFirestore, arrayUnion } =
    await import('firebase/firestore')

  if (!db) {
    db = getFirestore(app)
  }

  return { doc, getDoc, setDoc, db, arrayUnion }
}

export async function syncRemoteCart<T>(
  items: Record<string, T | undefined>
): Promise<void> {
  const user = auth.currentUser ?? (await ensureAnonymousUser())
  if (!user) return

  const { doc, setDoc, db } = await getFirestoreMethods()
  const cleanItems = Object.fromEntries(
    Object.entries(items).filter(([, item]) => item !== undefined)
  )

  await setDoc(
    doc(db, 'users', user.uid),
    { cartItems: cleanItems },
    { merge: true }
  )
}

export async function fetchRemoteCart<T>(): Promise<Record<string, T> | null> {
  const user = auth.currentUser ?? (await ensureAnonymousUser())
  if (!user) return null

  const { doc, getDoc, db } = await getFirestoreMethods()
  const snapshot = await getDoc(doc(db, 'users', user.uid))

  if (snapshot.exists()) {
    return snapshot.data().cartItems as Record<string, T>
  }
  return null
}

interface AddProductProps {
  id: string
  price: number
  name: string
}

export function logAddToCartEvent(product: AddProductProps): void {
  trackEvent('add_to_cart', {
    currency: 'USD',
    value: product.price,
    items: [
      { item_id: product.id, item_name: product.name, price: product.price },
    ],
  })
}
