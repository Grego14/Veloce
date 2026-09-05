import { atom } from 'nanostores'
import {
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  linkWithPopup,
  signOut as firebaseSignOut,
  type User
} from 'firebase/auth'
import { auth } from '@lib/firebase'

export const $user = atom<User | null>(null)
export const $authLoading = atom<boolean>(true)

onAuthStateChanged(auth, (user) => {
  $user.set(user)
  $authLoading.set(false)
})

export async function ensureAnonymousUser(): Promise<User | null> {
  if (auth.currentUser) return auth.currentUser

  try {
    const credential = await signInAnonymously(auth)
    return credential.user
  } catch (error) {
    console.error('Error in anonymous auth:', error)
    return null
  }
}

export async function loginWithGoogle(): Promise<User | null> {
  const provider = new GoogleAuthProvider()
  const currentUser = auth.currentUser

  try {
    if (currentUser && currentUser.isAnonymous) {
      const credential = await linkWithPopup(currentUser, provider)
      return credential.user
    }

    const credential = await signInWithPopup(auth, provider)
    return credential.user
  } catch (error) {
    console.error('Error signing in with Google:', error)
    return null
  }
}

export async function logout(): Promise<void> {
  try {
    await firebaseSignOut(auth)
  } catch (error) {
    console.error('Error signing out:', error)
  }
}
