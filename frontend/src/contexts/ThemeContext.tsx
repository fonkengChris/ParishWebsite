import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import { liturgicalColorAPI, type LiturgicalColorResponse } from '../services/api';

interface ThemeContextType {
  liturgicalColor: LiturgicalColorResponse | null;
  isLoading: boolean;
  error: string | null;
  refreshColor: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [liturgicalColor, setLiturgicalColor] = useState<LiturgicalColorResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(false);

  const updateCSSVariables = useCallback((colorData: LiturgicalColorResponse) => {
    const root = document.documentElement;
    const tailwind = colorData.tailwind;
    const colorName = colorData.color.toLowerCase();
    
    // Update CSS variables for primary colors on :root
    // These will cascade to all elements using the primary color classes
    // Tailwind will automatically use these variables via the config
    root.style.setProperty('--color-primary-50', tailwind[50]);
    root.style.setProperty('--color-primary-100', tailwind[100]);
    root.style.setProperty('--color-primary-200', tailwind[200]);
    root.style.setProperty('--color-primary-300', tailwind[300]);
    root.style.setProperty('--color-primary-400', tailwind[400]);
    root.style.setProperty('--color-primary-500', tailwind[500]);
    root.style.setProperty('--color-primary-600', tailwind[600]);
    root.style.setProperty('--color-primary-700', tailwind[700]);
    root.style.setProperty('--color-primary-800', tailwind[800]);
    root.style.setProperty('--color-primary-900', tailwind[900]);
    
    // Update text contrast colors based on theme
    root.style.setProperty('--text-on-light', tailwind[900]);
    root.style.setProperty('--text-on-medium', tailwind[800]);
    root.style.setProperty('--text-on-dark', '#ffffff');
    
    // Adjust typography based on color theme for optimal readability
    // Darker themes (purple, red) benefit from slightly heavier weights
    // Lighter themes (white, gold) benefit from clearer sizing
    if (colorName === 'purple' || colorName === 'red' || colorName === 'rose') {
      // Darker themes: use slightly bolder weights for better contrast
      root.style.setProperty('--font-weight-normal', '450');
      root.style.setProperty('--font-weight-medium', '550');
      root.style.setProperty('--font-weight-semibold', '650');
      root.style.setProperty('--font-weight-bold', '750');
      // Slightly larger base font size for readability
      root.style.setProperty('--font-size-base', '1.0625rem'); // 17px
      root.style.setProperty('--font-size-sm', '0.9375rem');  // 15px
    } else if (colorName === 'white') {
      // White theme: standard weights with good sizing
      root.style.setProperty('--font-weight-normal', '400');
      root.style.setProperty('--font-weight-medium', '500');
      root.style.setProperty('--font-weight-semibold', '600');
      root.style.setProperty('--font-weight-bold', '700');
      root.style.setProperty('--font-size-base', '1rem');      // 16px
      root.style.setProperty('--font-size-sm', '0.875rem');   // 14px
    } else if (colorName === 'gold') {
      // Gold theme: slightly heavier weights for warmth
      root.style.setProperty('--font-weight-normal', '425');
      root.style.setProperty('--font-weight-medium', '525');
      root.style.setProperty('--font-weight-semibold', '625');
      root.style.setProperty('--font-weight-bold', '725');
      root.style.setProperty('--font-size-base', '1.0625rem'); // 17px
      root.style.setProperty('--font-size-sm', '0.9375rem');   // 15px
    } else {
      // Green theme (default): balanced approach
      root.style.setProperty('--font-weight-normal', '400');
      root.style.setProperty('--font-weight-medium', '500');
      root.style.setProperty('--font-weight-semibold', '600');
      root.style.setProperty('--font-weight-bold', '700');
      root.style.setProperty('--font-size-base', '1rem');      // 16px
      root.style.setProperty('--font-size-sm', '0.875rem');     // 14px
    }
    
    console.log('[Theme] Updated liturgical color to:', colorData.color, 'for date:', colorData.date);
  }, []);

  const fetchLiturgicalColor = useCallback(async (forceRefresh = false) => {
    // Prevent multiple simultaneous requests
    if (fetchingRef.current && !forceRefresh) {
      return;
    }
    
    try {
      fetchingRef.current = true;
      setIsLoading(true);
      setError(null);
      
      // If forcing refresh, clear cache first
      if (forceRefresh) {
        localStorage.removeItem('liturgicalColor');
        localStorage.removeItem('liturgicalColorDate');
      }
      
      const colorData = await liturgicalColorAPI.getCurrent();
      setLiturgicalColor(colorData);
      updateCSSVariables(colorData);
      
      // Store in localStorage for persistence
      localStorage.setItem('liturgicalColor', JSON.stringify(colorData));
      localStorage.setItem('liturgicalColorDate', colorData.date);
    } catch (err) {
      console.error('Error fetching liturgical color:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch liturgical color');
      
      // Try to use cached color if available (only if not forcing refresh)
      if (!forceRefresh) {
        const cached = localStorage.getItem('liturgicalColor');
        const cachedDate = localStorage.getItem('liturgicalColorDate');
        const today = new Date().toISOString().split('T')[0];
        
        if (cached && cachedDate === today) {
          try {
            const colorData = JSON.parse(cached);
            setLiturgicalColor(colorData);
            updateCSSVariables(colorData);
          } catch (parseError) {
            console.error('Error parsing cached color:', parseError);
          }
        }
      }
    } finally {
      fetchingRef.current = false;
      setIsLoading(false);
    }
  }, [updateCSSVariables]);

  useEffect(() => {
    // Check if we have a cached color for today
    const cached = localStorage.getItem('liturgicalColor');
    const cachedDate = localStorage.getItem('liturgicalColorDate');
    const today = new Date().toISOString().split('T')[0];
    
    if (cached && cachedDate === today) {
      try {
        const colorData = JSON.parse(cached);
        setLiturgicalColor(colorData);
        updateCSSVariables(colorData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error parsing cached color:', err);
        fetchLiturgicalColor();
      }
    } else {
      fetchLiturgicalColor();
    }

    // Set up interval to check for color updates (check every hour)
    const interval = setInterval(() => {
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0];
      const cachedDate = localStorage.getItem('liturgicalColorDate');
      
      // If date changed, fetch new color
      if (cachedDate !== currentDate) {
        fetchLiturgicalColor();
      }
    }, 60 * 60 * 1000); // Check every hour

    // Check at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const midnightTimeout = setTimeout(() => {
      fetchLiturgicalColor();
      // Then check every 24 hours
      setInterval(fetchLiturgicalColor, 24 * 60 * 60 * 1000);
    }, msUntilMidnight);

    return () => {
      clearInterval(interval);
      clearTimeout(midnightTimeout);
    };
  }, [fetchLiturgicalColor]);

  return (
    <ThemeContext.Provider
      value={{
        liturgicalColor,
        isLoading,
        error,
        refreshColor: () => fetchLiturgicalColor(true),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

