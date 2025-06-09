import '../global.css'
import { useEffect } from 'react'

export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Set dark mode by default
    document.documentElement.classList.add('dark')
  }, [])

  return <Component {...pageProps} />
}
