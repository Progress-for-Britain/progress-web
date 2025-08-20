import React from 'react';
import Head from 'expo-router/head';
import { generateSEOTags, SEOData } from '../util/seo';

interface SEOHeadProps {
  pageKey: string;
  customData?: Partial<SEOData>;
}

export default function SEOHead({ pageKey, customData }: SEOHeadProps) {
  const tags = generateSEOTags(pageKey, customData);
  
  return (
    <Head>
      <title>{tags.title}</title>
      <meta name="description" content={tags.description} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={tags['og:type']} />
      <meta property="og:url" content={tags['og:url']} />
      <meta property="og:title" content={tags['og:title']} />
      <meta property="og:description" content={tags['og:description']} />
      <meta property="og:image" content={tags['og:image']} />
      <meta property="og:image:width" content={tags['og:image:width']} />
      <meta property="og:image:height" content={tags['og:image:height']} />
      <meta property="og:site_name" content={tags['og:site_name']} />
      
      {/* Twitter */}
      <meta property="twitter:card" content={tags['twitter:card']} />
      <meta property="twitter:url" content={tags['twitter:url']} />
      <meta property="twitter:title" content={tags['twitter:title']} />
      <meta property="twitter:description" content={tags['twitter:description']} />
      <meta property="twitter:image" content={tags['twitter:image']} />
      
      {/* Additional meta tags */}
      {tags.keywords && <meta name="keywords" content={tags.keywords} />}
      <meta name="author" content={tags.author} />
      <link rel="canonical" href={tags.canonical} />
    </Head>
  );
}
