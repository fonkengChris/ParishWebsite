import { useEffect } from 'react';

/**
 * Analytics component
 * Supports both Plausible and Google Analytics
 * Set VITE_PLAUSIBLE_DOMAIN or VITE_GA_ID in .env
 */
export default function Analytics() {
  useEffect(() => {
    // Plausible Analytics
    const plausibleDomain = import.meta.env.VITE_PLAUSIBLE_DOMAIN;
    if (plausibleDomain) {
      const script = document.createElement('script');
      script.defer = true;
      script.setAttribute('data-domain', plausibleDomain);
      script.src = 'https://plausible.io/js/script.js';
      document.head.appendChild(script);
    }

    // Google Analytics
    const gaId = import.meta.env.VITE_GA_ID;
    if (gaId) {
      // Google Analytics 4
      const script1 = document.createElement('script');
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script1);

      const script2 = document.createElement('script');
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${gaId}');
      `;
      document.head.appendChild(script2);
    }
  }, []);

  return null;
}

