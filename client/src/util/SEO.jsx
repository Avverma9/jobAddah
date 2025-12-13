// src/components/SEO.jsx
import { Helmet } from "react-helmet-async";

export default function SEO({ 
  title = "JobsAddah - Latest Government Jobs 2025", 
  description = "Find latest sarkari naukri and government job notifications",
  keywords = "government jobs, sarkari result, admit card",
  canonical = "/",
  ogImage = "/logo.png",
}) {
  const siteUrl = "https://jobsaddah.com";
  
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={`${siteUrl}${canonical}`} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${siteUrl}${ogImage}`} />
      <meta property="og:url" content={`${siteUrl}${canonical}`} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
}
