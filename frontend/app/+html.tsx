// app/+html.tsx
// Learn more https://docs.expo.dev/router/reference/static-rendering/#root-html
import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        {/* Keep body scroll behavior consistent with Expo’s template */}
        <ScrollViewStyleReset />

        {/* ---- Your global meta & link tags ---- */}

        <title>Progress UK</title>
        <meta name="description" content="Progress for the future" />
        <meta name="robots" content="index,follow" />
        {/* Make the browser UI / status bar transparent where supported */}
        <meta name="theme-color" content="transparent" />
        {/* iOS: allow a translucent/transparent status bar when saved to home screen */}
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        {/* Canonical + OG URL */}
        <link rel="canonical" href="https://progressforbritain.org" />
        <meta property="og:url" content="https://progressforbritain.org" />

        {/* Favicon / PWA assets */}
        <link rel="icon" href="/assets/favicon.png" />
        <link rel="apple-touch-icon" href="/assets/icon.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_GB" />
        <meta property="og:site_name" content="Progress UK" />
        <meta property="og:title" content="Progress UK" />
        <meta property="og:description" content="Progress for the future" />
        <meta
          property="og:image"
          content="https://progress-web-backend.vercel.app/og/cover-1200x630.png"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Progress UK" />
        <meta
          name="twitter:description"
          content="A political party beyond the left and right. Progress for the future"
        />
        <meta
          name="twitter:image"
          content="https://progress-web-backend.vercel.app/og/cover-1200x630.png"
        />
        <meta name="twitter:site" content="@ProgressUK" />

        {/* Ensure the document background is transparent so underlying layers show through */}
        <style>{`html, body, #root { background: transparent !important; }`}</style>

        {/* ---- /Your tags ---- */}
      </head>
      <body>{children}</body>
    </html>
  );
}
