import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import { siteContentAPI } from '../services/api';
import { defaultSiteContent } from '../data/defaultSiteContent';
import type { SiteContent } from '../types';

/**
 * Deep-merge a partial server document over the shipped defaults so an
 * unconfigured instance (empty document) renders identically to today, and a
 * parish that edited only one section keeps defaults for the rest. Arrays are
 * replaced wholesale (an edited list fully overrides the default list).
 */
const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

function deepMerge<T>(base: T, override: unknown): T {
  if (!isPlainObject(override)) return base;
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(override)) {
    if (value === undefined || value === null) continue;
    if (isPlainObject(value) && isPlainObject(out[key])) {
      out[key] = deepMerge(out[key], value);
    } else {
      out[key] = value;
    }
  }
  return out as T;
}

interface SiteContentContextType {
  content: SiteContent;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const SiteContentContext = createContext<SiteContentContextType | undefined>(undefined);

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(false);

  const fetchContent = useCallback(async () => {
    if (fetchingRef.current) return;
    try {
      fetchingRef.current = true;
      setIsLoading(true);
      setError(null);
      const data = await siteContentAPI.get();
      setContent(deepMerge(defaultSiteContent, data));
    } catch (err) {
      console.error('Error fetching site content:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch site content');
      // Keep defaults on failure — the page still renders.
    } finally {
      fetchingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return (
    <SiteContentContext.Provider value={{ content, isLoading, error, refresh: fetchContent }}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  const context = useContext(SiteContentContext);
  if (context === undefined) {
    throw new Error('useSiteContent must be used within a SiteContentProvider');
  }
  return context;
}
