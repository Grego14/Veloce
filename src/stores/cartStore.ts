import { atom, map } from 'nanostores'
import type { CollectionEntry } from 'astro:content'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db, trackEvent } from '@lib/firebase'
import { ensureAnonymousUser } from '@stores/authStore'

export type ProductData = CollectionEntry<'products'>['data']

export interface CartItem extends ProductData {
  quantity: number
}

export const isCartOpen = atom(false)

export const cartItems = map<Record<string, CartItem | undefined>>({})

const storageKey = 'veloce-cart'

function persistLocal() {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(storageKey, JSON.stringify(cartItems.get()))
}

async function persistRemote() {
  const user = auth.currentUser
  if (!user) return
  const items = Object.fromEntries(
    Object.entries(cartItems.get()).filter(([, item]) => item !== undefined)
  )
  await setDoc(doc(db, 'users', user.uid, 'cart', 'items'), { items })
}

export async function hydrateCart() {
  if (typeof localStorage !== 'undefined') {
    const local = localStorage.getItem(storageKey)
    if (local) {
      try {
        const parsed = JSON.parse(local) as Record<string, CartItem>
        cartItems.set(parsed)
      } catch (error) {
        console.error('Unable to restore local cart:', error)
      }
    }
  }

  const user = auth.currentUser
  if (!user) return
  const snapshot = await getDoc(doc(db, 'users', user.uid, 'cart', 'items'))
  if (snapshot.exists()) {
    const remote = snapshot.data().items as Record<string, CartItem>
    cartItems.set(remote)
    persistLocal()
  } else {
    await persistRemote()
  }
}

export async function addToCart(product: ProductData) {
  const productId = product.id
  const currentItems = cartItems.get()
  const existingItem = currentItems[productId]

  if (existingItem) {
    cartItems.setKey(productId, {
      ...existingItem,
      quantity: existingItem.quantity + 1,
    })
  } else {
    cartItems.setKey(productId, {
      ...product,
      quantity: 1,
    })
  }

  persistLocal()
  const user = auth.currentUser ?? (await ensureAnonymousUser())
  if (user) await persistRemote()
  trackEvent('add_to_cart', {
    currency: 'USD',
    value: product.price,
    items: [
      { item_id: product.id, item_name: product.name.en, price: product.price },
    ],
  })
}

export async function removeFromCart(productId: string) {
  cartItems.setKey(productId, undefined)
  persistLocal()
  await persistRemote()
}

export async function clearCart() {
  cartItems.set({})
  persistLocal()
  await persistRemote()
}

if (typeof window !== 'undefined') {
  void hydrateCart()
}
