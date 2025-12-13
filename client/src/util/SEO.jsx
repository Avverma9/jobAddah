// src/components/SEO.jsx - Create this component
import { Helmet } from "react-helmet-async";

export default function SEO({ 
  title, 
  description, 
  keywords, 
  canonical,
  ogImage = "/logo.png",
  type = "website" 
}) {
  const siteUrl = "https://jobsaddah.com";
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title} | JobsAddah - Latest Govt Jobs 2025</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={`${siteUrl}${canonical}`} />
      
      {/* Open Graph (Facebook, WhatsApp) */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${siteUrl}${ogImage}`} />
      <meta property="og:url" content={`${siteUrl}${canonical}`} />
      <meta property="og:site_name" content="JobsAddah" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}${ogImage}`} />
      
      {/* Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta name="theme-color" content="#f43f5e" />
      
      {/* Language & Location */}
      <meta name="language" content="Hindi, English" />
      <meta name="geo.region" content="IN" />
      <meta name="geo.placename" content="India" />
    </Helmet>
  );
}
