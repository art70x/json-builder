import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import AutoImport from 'unplugin-auto-import/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // https://github.com/unplugin/unplugin-auto-import
    AutoImport({
      include: [/\.[tj]sx?$/],
      imports: ['react'],
      dirs: ['src/hooks', 'src/lib', 'src/types'],
      resolvers: [
        IconsResolver({
          prefix: 'I',
          extension: 'jsx',
        }),
      ],
      dirsScanOptions: {
        filePatterns: ['*.ts'],
        types: true,
      },
      dts: 'src/auto-imports.d.ts',
    }),

    // https://github.com/unplugin/unplugin-icons
    Icons({ autoInstall: true, compiler: 'jsx', jsx: 'react' }),

    // https://github.com/antfu/vite-plugin-pwa
    VitePWA({
      registerType: 'autoUpdate',

      pwaAssets: {
        disabled: false,
        config: true,
      },

      manifest: {
        name: 'JSON Data Builder',
        short_name: 'JSON Builder',
        description:
          'A free online JSON builder. Add properties with names, values, and types (string, number, boolean, array) to construct structured JSON objects. Live preview, import, and export.',

        start_url: '/',
        scope: '/',

        display: 'standalone',
        orientation: 'portrait',

        theme_color: '#29de9c',
        background_color: '#09090b',

        lang: 'en-US',
        dir: 'ltr',

        id: '/',

        categories: ['developer', 'productivity', 'utilities'],
      },

      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
      },
    }),

    tailwindcss(),
    react(),
  ],

  server: {
    port: 3000,
  },

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('src', import.meta.url)),
      components: fileURLToPath(new URL('src/components', import.meta.url)),
    },
  },
})
