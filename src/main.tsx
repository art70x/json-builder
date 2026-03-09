import { Layout } from 'components/layout.tsx'
// import { OgImage } from 'components/og-image.tsx'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app.tsx'
import './main.css'

createRoot(document.querySelector('#root')!).render(
  <StrictMode>
    <Layout>
      <App />
    </Layout>
    {/*<OgImage />*/}
  </StrictMode>,
)
