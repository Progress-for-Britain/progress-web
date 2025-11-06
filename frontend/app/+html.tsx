// app/+html.tsx
// Learn more https://docs.expo.dev/router/reference/static-rendering/#root-html
import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en-GB">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <meta name="color-scheme" content="light dark" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta name="apple-mobile-web-app-capable" content="yes" />

        {/* Keep body scroll behavior consistent with Expo's template */}
        <ScrollViewStyleReset />

        {/* Google Fonts - preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />

        {/* ---- Your global meta & link tags ---- */}

        <meta name="description" content="Join Progress UK, a political movement focused on pragmatic solutions for Britain's future. Beyond traditional politics, we champion evidence-based policies and citizen engagement." />
        <meta name="robots" content="index,follow" />
        {/* Theme colors for browser UI */}
        <meta name="theme-color" content="#660033" />
        <meta name="theme-color" content="#1e1b4b" media="(prefers-color-scheme: dark)" />
        {/* iOS: allow a translucent/transparent status bar when saved to home screen */}
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        {/* Canonical + OG URL */}
        <link rel="canonical" href="https://progressforbritain.org" />
        <meta property="og:url" content="https://progressforbritain.org" />

        {/* Favicon / PWA assets */}
        <link rel="icon" href="/assets/favicon.png" />
        <link rel="apple-touch-icon" href="/assets/favicon.png" />
        <link rel="mask-icon" href="/assets/safari-pinned-tab.svg" color="#660033" />
        <link rel="manifest" href="/assets/manifest.json" />
        
        {/* Global styles */}
        <link rel="stylesheet" href="/assets/global.css" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_GB" />
        <meta property="og:locale:alternate" content="en_US" />
        <meta property="og:site_name" content="Progress UK" />
        <meta property="og:title" content="Progress UK - A Political Party Beyond Left and Right" />
        <meta property="og:description" content="Join Progress UK, a political movement focused on pragmatic solutions for Britain's future. Beyond traditional politics, we champion evidence-based policies and citizen engagement." />
        <meta
          property="og:image"
          content="https://progress-web-backend.vercel.app/assets/og-image.png"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Progress UK - Political Party Logo" />

        {/* Twitter - inherits title/description/image from OG tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ProgressUK" />
        <meta name="twitter:creator" content="@ProgressUK" />
        <meta name="twitter:title" content="Progress UK - A Political Party Beyond Left and Right" />
        <meta name="twitter:description" content="Join Progress UK, a political movement focused on pragmatic solutions for Britain's future. Beyond traditional politics, we champion evidence-based policies and citizen engagement." />
        <meta name="twitter:image" content="https://progress-web-backend.vercel.app/assets/og-image.png" />
        <meta name="twitter:image:alt" content="Progress UK - Political Party Logo" />

        {/* Structured Data */}
        <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://progressforbritain.org/#organization",
              "name": "Progress UK",
              "alternateName": "Progress for Britain",
              "url": "https://progressforbritain.org",
              "logo": {
                "@type": "ImageObject",
                "url": "https://progress-web-backend.vercel.app/assets/og-image.png",
                "width": 1200,
                "height": 630
              },
              "description": "A political movement focused on pragmatic solutions for Britain's future. Beyond traditional politics, we champion evidence-based policies and citizen engagement.",
              "sameAs": [
                "https://twitter.com/ProgressUK"
              ]
            },
            {
              "@type": "WebSite",
              "@id": "https://progressforbritain.org/#website",
              "url": "https://progressforbritain.org",
              "name": "Progress UK",
              "description": "Join Progress UK, a political movement focused on pragmatic solutions for Britain's future. Beyond traditional politics, we champion evidence-based policies and citizen engagement.",
              "publisher": {
                "@id": "https://progressforbritain.org/#organization"
              },
              "inLanguage": "en-GB"
            }
          ]
        })}
        </script>

        {/* ---- /Your tags ---- */}
      </head>
      <body>{children}</body>
    </html>
  );
}
