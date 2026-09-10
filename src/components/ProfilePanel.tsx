import { useStore } from '@nanostores/preact'
import { useEffect, useReducer } from 'preact/hooks'
import GoogleIcon from '@icons/Google'
import LogOut from '@icons/LogOut'

import {
  $user,
  loginWithEmail,
  loginWithGoogle,
  logout,
  updateUserProfile,
} from '@stores/authStore'
import { $dictionary } from '@stores/i18nStore'

interface State {
  email: string
  loginPassword: string
  name: string
  password: string
  message: string
  error: boolean
  loading: boolean
}

type Action =
  | {
      type: 'field'
      field: 'email' | 'loginPassword' | 'name' | 'password'
      value: string
    }
  | { type: 'message'; message: string; error?: boolean }
  | { type: 'loading'; loading: boolean }

const initialState: State = {
  email: '',
  loginPassword: '',
  name: '',
  password: '',
  message: '',
  error: false,
  loading: false,
}

function reducer(state: State, action: Action): State {
  if (action.type === 'field') return { ...state, [action.field]: action.value }
  if (action.type === 'message')
    return { ...state, message: action.message, error: action.error ?? false }
  return { ...state, loading: action.loading }
}

export default function ProfilePanel() {
  const user = useStore($user)
  const dictionary = useStore($dictionary)
  const [state, dispatch] = useReducer(reducer, initialState)
  const signedIn = Boolean(user && !user.isAnonymous)

  const loading = state.loading

  useEffect(() => {
    if (user)
      dispatch({ type: 'field', field: 'name', value: user.displayName ?? '' })
  }, [user])

  if (!dictionary) {
    return (
      <div
        class="min-h-[34rem] animate-pulse border-2 border-zinc-100 bg-zinc-50"
        aria-busy="true"
      />
    )
  }

  const submitEmail = async (createAccount: boolean) => {
    dispatch({ type: 'loading', loading: true })

    const result = await loginWithEmail(
      state.email,
      state.loginPassword,
      createAccount
    )

    dispatch({ type: 'loading', loading: false })
    if (!result)
      dispatch({
        type: 'message',
        message: dictionary['profile.loginError'] as string,
        error: true,
      })
  }

  const saveProfile = async (event: Event) => {
    event.preventDefault()
    dispatch({ type: 'loading', loading: true })

    try {
      await updateUserProfile(state.name, state.password)

      dispatch({ type: 'field', field: 'password', value: '' })
      dispatch({
        type: 'message',
        message: dictionary['profile.saved'] as string,
      })
    } catch (error) {
      console.error('Unable to update profile:', error)

      dispatch({
        type: 'message',
        message: dictionary['profile.updateError'] as string,
        error: true,
      })
    } finally {
      dispatch({ type: 'loading', loading: false })
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      dispatch({ type: 'loading', loading: true })
      await loginWithGoogle()
    } finally {
      dispatch({ type: 'loading', loading: false })
    }
  }

  const usedGoogle = user?.providerData?.[0]?.providerId === 'google.com'

  return (
    <section class="min-h-[34rem] border-2 border-zinc-950 p-6 sm:p-8 max-w-xl mx-auto">
      <h2>{dictionary[signedIn ? 'profile.config' : 'profile.enter']}</h2>

      {!user && <p class="mt-3 text-lg">{dictionary['profile.loginPrompt']}</p>}

      <p
        class="mt-4 text-sm font-semibold uppercase"
        aria-live="polite"
        role="status"
      >
        {loading ? dictionary['profile.loading'] : null}
      </p>

      {!signedIn ? (
        <>
          <button
            type="button"
            class="mt-8 btn-primary flex items-center justify-center gap-4"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <GoogleIcon />
            {dictionary['login.google']}
          </button>
          <form
            class="mt-5 space-y-3"
            onSubmit={async (event) => {
              event.preventDefault()
              await submitEmail(false)
            }}
          >
            <input
              class="w-full border-2 border-zinc-950 px-3 py-3"
              type="email"
              placeholder={dictionary['login.email'] as string}
              value={state.email}
              disabled={loading}
              onInput={(event) =>
                dispatch({
                  type: 'field',
                  field: 'email',
                  value: event.currentTarget.value,
                })
              }
              required
            />
            <input
              class="w-full border-2 border-zinc-950 px-3 py-3"
              type="password"
              placeholder={dictionary['login.password'] as string}
              value={state.loginPassword}
              disabled={loading}
              onInput={(event) =>
                dispatch({
                  type: 'field',
                  field: 'loginPassword',
                  value: event.currentTarget.value,
                })
              }
              minLength={6}
              required
            />
            <div class="flex gap-3">
              <button type="submit" class="btn-secondary" disabled={loading}>
                {dictionary['login.emailAction']}
              </button>
              <button
                type="button"
                class="btn-secondary"
                onClick={async () => {
                  await submitEmail(true)
                }}
                disabled={loading}
              >
                {dictionary['login.createAccount']}
              </button>
            </div>
          </form>
        </>
      ) : (
        <form class="mt-8 space-y-5" onSubmit={saveProfile}>
          <label class="block text-sm font-semibold uppercase tracking-wide">
            {dictionary['profile.name']}
            <input
              class="mt-2 w-full border-2 border-zinc-950 px-3 py-3 font-normal"
              value={state.name}
              onInput={(event) =>
                dispatch({
                  type: 'field',
                  field: 'name',
                  value: event.currentTarget.value,
                })
              }
              required
            />
          </label>
          {!usedGoogle && (
            <label class="block text-sm font-semibold uppercase tracking-wide">
              {dictionary['profile.password']}
              <input
                class="mt-2 w-full border-2 border-zinc-950 px-3 py-3 font-normal"
                type="password"
                value={state.password}
                onInput={(event) =>
                  dispatch({
                    type: 'field',
                    field: 'password',
                    value: event.currentTarget.value,
                  })
                }
                minLength={6}
              />
            </label>
          )}
          <button
            type="submit"
            class="w-full border-2 border-zinc-950 px-4 py-3 text-sm font-semibold uppercase tracking-wide transition-colors hover:bg-zinc-950 hover:text-white"
          >
            {dictionary['profile.save']}
          </button>
          <button
            type="button"
            class="text-sm font-semibold uppercase tracking-wide underline flex gap-2 items-center group"
            onClick={async () => {
              await logout()
            }}
          >
            {dictionary['login.signOut']}
            <span class="transition-transform group-hover:translate-x-1">
              <LogOut />
            </span>
          </button>
        </form>
      )}

      {state.message ? (
        <p
          class={`mt-4 text-sm ${state.error ? 'text-rose-600' : 'text-emerald-700'}`}
        >
          {state.message}
        </p>
      ) : null}
    </section>
  )
}
