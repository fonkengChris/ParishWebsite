import { useEffect } from 'react';

/**
 * Scroll to a resource anchor when the page is opened with a hash (e.g. from chatbot links).
 */
export function useResourceHashScroll(loading: boolean) {
  useEffect(() => {
    if (loading || !window.location.hash) {
      return;
    }

    const hash = window.location.hash.slice(1);
    if (!hash.startsWith('resource-')) {
      return;
    }

    const scrollToResource = () => {
      const element = document.getElementById(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        element.classList.add('ring-2', 'ring-primary-400', 'ring-offset-2');
        window.setTimeout(() => {
          element.classList.remove('ring-2', 'ring-primary-400', 'ring-offset-2');
        }, 2500);
      }
    };

    const timeoutId = window.setTimeout(scrollToResource, 150);
    return () => window.clearTimeout(timeoutId);
  }, [loading]);
}
