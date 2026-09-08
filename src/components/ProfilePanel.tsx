import { useStore } from '@nanostores/preact'
import { useState } from 'preact/hooks'

import {
  $user,
  loginWithEmail,
  loginWithGoogle,
  logout,
  updateUserProfile,
} from '@stores/authStore'

interface Props {
  lang: 'es' | 'en'
}

export default function ProfilePanel({ lang }: Props) {
  const user = useStore($user)
  const isEnglish = lang === 'en'
  const [email, setEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [messageIsError, setMessageIsError] = useState(false)

  const signedIn = Boolean(user && !user.isAnonymous)
  const setError = (text: string) => {
    setMessage(text)
    setMessageIsError(true)
  }

  const submitEmail = async (createAccount: boolean) => {
    const result = await loginWithEmail(email, loginPassword, createAccount)
    if (!result) {
      setError(
        isEnglish
          ? 'Unable to sign in with those credentials.'
          : 'No se pudo iniciar sesión con esas credenciales.'
      )
    }
  }

  const saveProfile = async (event: Event) => {
    event.preventDefault()
    try {
      await updateUserProfile(name, password)
      setMessage(isEnglish ? 'Profile updated' : 'Perfil actualizado')
      setMessageIsError(false)
      setPassword('')
    } catch (error) {
      console.error('Unable to update profile:', error)
      setError(
        isEnglish
          ? 'Unable to update the profile. Sign in again and try once more.'
          : 'No se pudo actualizar el perfil. Inicia sesión de nuevo e inténtalo otra vez.'
      )
    }
  }

  return (
    <section class="border-2 border-zinc-950 p-6 sm:p-8">
      <h2>{isEnglish ? 'My profile' : 'Mi perfil'}</h2>
      <p class="mt-3 text-lg">
        {isEnglish
          ? 'Sign in to sync your cart and manage your profile.'
          : 'Inicia sesión para sincronizar tu carrito y administrar tu perfil.'}
      </p>

      {!signedIn ? (
        <>
          <button
            type="button"
            class="mt-8 w-full bg-zinc-950 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-zinc-700"
            onClick={() => void loginWithGoogle()}
          >
            {isEnglish ? 'Continue with Google' : 'Continuar con Google'}
          </button>
          <form
            class="mt-5 space-y-3"
            onSubmit={(event) => {
              event.preventDefault()
              void submitEmail(false)
            }}
          >
            <input
              class="w-full border-2 border-zinc-950 px-3 py-3"
              type="email"
              placeholder={isEnglish ? 'Email' : 'Correo electrónico'}
              value={email}
              onInput={(event) => setEmail(event.currentTarget.value)}
              required
            />
            <input
              class="w-full border-2 border-zinc-950 px-3 py-3"
              type="password"
              placeholder={isEnglish ? 'Password' : 'Contraseña'}
              value={loginPassword}
              onInput={(event) => setLoginPassword(event.currentTarget.value)}
              minLength={6}
              required
            />
            <div class="flex gap-3">
              <button
                type="submit"
                class="flex-1 border-2 border-zinc-950 px-3 py-3 text-sm font-semibold uppercase"
              >
                {isEnglish ? 'Sign in with email' : 'Iniciar sesión con correo'}
              </button>
              <button
                type="button"
                class="flex-1 border-2 border-zinc-950 px-3 py-3 text-sm font-semibold uppercase"
                onClick={() => void submitEmail(true)}
              >
                {isEnglish ? 'Create account' : 'Crear cuenta'}
              </button>
            </div>
          </form>
        </>
      ) : (
        <form class="mt-8 space-y-5" onSubmit={saveProfile}>
          <label class="block text-sm font-semibold uppercase tracking-wide">
            {isEnglish ? 'Name' : 'Nombre'}
            <input
              class="mt-2 w-full border-2 border-zinc-950 px-3 py-3 font-normal"
              value={name || user?.displayName || ''}
              onInput={(event) => setName(event.currentTarget.value)}
              required
            />
          </label>
          <label class="block text-sm font-semibold uppercase tracking-wide">
            {isEnglish ? 'New password' : 'Nueva contraseña'}
            <input
              class="mt-2 w-full border-2 border-zinc-950 px-3 py-3 font-normal"
              type="password"
              value={password}
              onInput={(event) => setPassword(event.currentTarget.value)}
              minLength={6}
            />
          </label>
          <button
            type="submit"
            class="w-full border-2 border-zinc-950 px-4 py-3 text-sm font-semibold uppercase tracking-wide transition-colors hover:bg-zinc-950 hover:text-white"
          >
            {isEnglish ? 'Save changes' : 'Guardar cambios'}
          </button>
          <button
            type="button"
            class="w-full text-sm font-semibold uppercase tracking-wide underline"
            onClick={() => void logout()}
          >
            {isEnglish ? 'Sign out' : 'Cerrar sesión'}
          </button>
        </form>
      )}

      {message ? (
        <p
          class={`mt-4 text-sm ${messageIsError ? 'text-rose-600' : 'text-emerald-700'}`}
        >
          {message}
        </p>
      ) : null}
    </section>
  )
}
