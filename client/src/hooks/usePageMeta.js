import { useEffect } from 'react';

export function usePageMeta(title, description, keywords) {
  useEffect(() => {
    // Update page title
    document.title = title ? `${title} | DuesJobs` : 'DuesJobs - AI-Powered Remote Job Matching Platform';
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description || 'DuesJobs - AI-powered job matching platform. Find remote jobs tailored to your skills and preferences.');
    }
    
    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', keywords || 'remote jobs, job search, career, job matching, AI jobs');
    }
    
    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', title ? `${title} | DuesJobs` : 'DuesJobs - AI-Powered Remote Job Matching Platform');
    }
    
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', description || 'DuesJobs - AI-powered job matching platform. Find remote jobs tailored to your skills and preferences.');
    }
    
    // Update Twitter tags
    const twitterTitle = document.querySelector('meta[property="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', title ? `${title} | DuesJobs` : 'DuesJobs - AI-Powered Remote Job Matching Platform');
    }
    
    const twitterDescription = document.querySelector('meta[property="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.setAttribute('content', description || 'DuesJobs - AI-powered job matching platform. Find remote jobs tailored to your skills and preferences.');
    }
  }, [title, description, keywords]);
}
