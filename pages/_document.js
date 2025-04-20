import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="it">
      <Head>
        {/* ✅ Usercentrics cookie scripts - versione ottimizzata (2025) */}
        <script
          id="usercentrics-cmp"
          data-settings-id="NSWi6bW3umY52e"
          src="https://app.usercentrics.eu/browser-ui/latest/loader.js"
          async
        ></script>
        
        {/* Google Maps API - spostato in _app.js per caricamento ottimizzato */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}