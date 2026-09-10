// @ts-check
import { defineConfig } from 'astro/config'

import tailwindcss from '@tailwindcss/vite'
import preact from '@astrojs/preact'

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        'preact/debug': 'preact/devtools',
        react: 'preact/compat',
        'react-dom': 'preact/compat',
      },
      dedupe: ['preact', 'preact/hooks', 'preact/compat'],
    },
    optimizeDeps: {
      include: [
        'preact',
        'preact/hooks',
        'preact/compat',
        '@nanostores/preact',
      ],
    },
  },

  integrations: [preact({ compat: true })],

  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
  },
})
