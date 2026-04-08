import react from '@vitejs/plugin-react'

export default {
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: ['localhost', 'frontend', '127.0.0.1'],
    proxy: {
      '/api': {
        target: 'http://backend:8000',
        changeOrigin: true,
        rewrite: (path) => path,
        secure: false,
      },
      '/static': {
        target: 'http://backend:8000',
        changeOrigin: true,
        rewrite: (path) => path,
        secure: false,
      },
    },
  },
}
