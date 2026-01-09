// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint'],
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
})