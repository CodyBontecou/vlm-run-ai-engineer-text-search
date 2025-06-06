// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-05-15',
    devtools: { enabled: true },

    runtimeConfig: {
        vlmrunApiKey: process.env.NUXT_VLMRUN_API_KEY || '',
    },

    css: [],

    modules: ['@nuxt/ui', '@nuxtjs/tailwindcss'],

    colorMode: {
        preference: 'dark',
    },

    app: {
        head: {
            htmlAttrs: {
                lang: 'en'
            },
            title: 'VLM Transcript Search - AI Video Analysis'
        }
    }
})
