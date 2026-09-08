import { atom } from 'nanostores'
import { FirebaseError } from 'firebase/app'
import {
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  linkWithCredential,
  GoogleAuthProvider,
  linkWithPopup,
  updateProfile,
  updatePassword,
  signOut as firebaseSignOut,
  signInWithCredential,
  type User,
} from 'firebase/auth'
import { auth } from '@lib/firebase'
import { trackEvent } from '@lib/firebase'

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
    if (currentUser?.isAnonymous) {
      try {
        const credential = await linkWithPopup(currentUser, provider)
        trackEvent('login', { method: 'google' })
        return credential.user
      } catch (e) {
        if (
          e instanceof FirebaseError &&
          e.code === 'auth/credential-already-in-use'
        ) {
          const credentialFromError = GoogleAuthProvider.credentialFromError(e)

          if (credentialFromError) {
            const userCredential = await signInWithCredential(
              auth,
              credentialFromError
            )
            trackEvent('login', { method: 'google' })

            return userCredential.user
          }
        }

        throw e
      }
    }

    const credential = await signInWithPopup(auth, provider)
    trackEvent('login', { method: 'google' })
    return credential.user
  } catch (error) {
    console.error('Error signing in with Google:', error)
    return null
  }
}

export async function loginWithEmail(
  email: string,
  password: string,
  createAccount = false
): Promise<User | null> {
  try {
    const currentUser = auth.currentUser
    const credential = EmailAuthProvider.credential(email, password)
    if (currentUser?.isAnonymous) {
      const linked = await linkWithCredential(currentUser, credential)
      trackEvent('sign_up', { method: 'password' })
      return linked.user
    }
    const result = createAccount
      ? await createUserWithEmailAndPassword(auth, email, password)
      : await signInWithEmailAndPassword(auth, email, password)
    trackEvent(createAccount ? 'sign_up' : 'login', { method: 'password' })
    return result.user
  } catch (error) {
    console.error('Error signing in with email:', error)
    return null
  }
}

export async function updateUserProfile(
  name: string,
  password?: string
): Promise<void> {
  const user = auth.currentUser
  if (!user) throw new Error('You must be signed in to update your profile')

  if (name.trim() && name.trim() !== user.displayName) {
    await updateProfile(user, { displayName: name.trim() })
  }
  if (password) await updatePassword(user, password)
}

export async function logout(): Promise<void> {
  try {
    await firebaseSignOut(auth)
  } catch (error) {
    console.error('Error signing out:', error)
  }
}
