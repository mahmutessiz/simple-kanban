// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxtjs/i18n'],
  css: ['./app/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  runtimeConfig: {
    // Server-only config (not exposed to client)
    dbFileName: './data/kanban.db',
    authSecret: '',
    // Public config (exposed to client)
    public: {
      appUrl: 'http://localhost:3000',
    },
  },
  nitro: {
    preset: 'bun',
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
    rollupConfig: {
      external: (id: string) => {
        // Force these packages to be bundled (not external)
        const bundled = ['@libsql/client', '@libsql/hrana-client', '@libsql/isomorphic-ws', 'ws'];
        if (bundled.some(pkg => id.includes(pkg))) {
          return false;
        }
        return undefined; // Use default behavior for other packages
      },
    },
  },
  i18n: {
    vueI18n: './i18n.config.ts',
    locales: [
      { code: 'en', iso: 'en-US', file: 'en.json', name: 'English' },
      { code: 'tr', iso: 'tr-TR', file: 'tr.json', name: 'Türkçe' }
    ],
    defaultLocale: 'en',
    strategy: 'no_prefix',
    langDir: 'locales',
  },
  typescript: {
    tsConfig: {
      compilerOptions: {
        types: ['bun-types']
      }
    }
  }
})