import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import { parishConfigAPI } from '../services/api';
import { DEFAULT_PARISH_CONFIG } from '../data/defaultParishConfig';
import type { ParishConfig } from '../types';

interface ParishContextType {
  parish: ParishConfig;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const ParishContext = createContext<ParishContextType | undefined>(undefined);

export function ParishProvider({ children }: { children: ReactNode }) {
  const [parish, setParish] = useState<ParishConfig>(DEFAULT_PARISH_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(false);

  const applyFavicon = useCallback((url?: string) => {
    if (!url) return;
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = url;
  }, []);

  const fetchParish = useCallback(async () => {
    if (fetchingRef.current) return;
    try {
      fetchingRef.current = true;
      setIsLoading(true);
      setError(null);
      const data = await parishConfigAPI.get();
      // Merge over defaults so partial documents never leave gaps.
      const merged: ParishConfig = {
        ...DEFAULT_PARISH_CONFIG,
        ...data,
        coordinates: { ...DEFAULT_PARISH_CONFIG.coordinates, ...data.coordinates },
        contact: { ...DEFAULT_PARISH_CONFIG.contact, ...data.contact },
        social: { ...DEFAULT_PARISH_CONFIG.social, ...data.social },
        patron: { ...DEFAULT_PARISH_CONFIG.patron, ...data.patron },
        assets: { ...DEFAULT_PARISH_CONFIG.assets, ...data.assets },
      };
      setParish(merged);
      applyFavicon(merged.assets.faviconUrl);
      if (merged.name) document.title = merged.name;
    } catch (err) {
      console.error('Error fetching parish config:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch parish config');
    } finally {
      fetchingRef.current = false;
      setIsLoading(false);
    }
  }, [applyFavicon]);

  useEffect(() => {
    fetchParish();
  }, [fetchParish]);

  return (
    <ParishContext.Provider value={{ parish, isLoading, error, refresh: fetchParish }}>
      {children}
    </ParishContext.Provider>
  );
}

export function useParish() {
  const context = useContext(ParishContext);
  if (context === undefined) {
    throw new Error('useParish must be used within a ParishProvider');
  }
  return context;
}
