import { useId } from 'react';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Parish mark — concept 1f "Window & Chalice": the chalice and host set in an
 * arched window (the site's arch motif) above a gold altar line.
 *
 * - The window takes the liturgical colour (`--color-primary-600`), so the mark
 *   follows the season with the rest of the site.
 * - The chalice is a true cut-out (SVG mask), so it shows whatever sits behind
 *   the mark — ivory, stone, a photo — without needing a background colour.
 * - Two drawings: `full` for 48px and up, `compact` (bolder window and chalice,
 *   no outline, altar line or host cross) for small sizes and the favicon.
 *   `variant="auto"` (default) picks by `size`.
 */

const COMPACT_BELOW = 48;

// White's primary scale is a cool grey and gold's would swallow the gold host,
// so those seasons fall back to the fixed palette.
const FALLBACK_SEASONS = new Set(['white', 'gold']);
const FALLBACK_FILL = { light: '#2a241c' /* ink */, dark: '#ece4d4' /* stone-ivory */ };
const GOLD = '#c29a4e';

// Chalice drawn in its own 64×64 space, then placed with a transform.
const CUP = 'M15 28 H49 A17 17 0 0 1 32 45 A17 17 0 0 1 15 28 Z';

interface LogoMarkProps {
  size?: number;
  variant?: 'auto' | 'full' | 'compact';
  /** Background the mark sits on; picks the off-season fallback colour. */
  tone?: 'light' | 'dark';
  className?: string;
  title?: string;
}

export function LogoMark({
  size = 64,
  variant = 'auto',
  tone = 'light',
  className,
  title,
}: LogoMarkProps) {
  const { liturgicalColor } = useTheme();
  const uid = useId().replace(/:/g, '');
  const compact = variant === 'compact' || (variant === 'auto' && size < COMPACT_BELOW);

  const season = liturgicalColor?.color.toLowerCase() ?? '';
  const fill = FALLBACK_SEASONS.has(season) ? FALLBACK_FILL[tone] : 'var(--color-primary-600)';

  const a11y = title
    ? { role: 'img', 'aria-label': title }
    : { 'aria-hidden': true as const };

  if (compact) {
    const cut = `lm-cut-${uid}`;
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" className={className} {...a11y}>
        <mask id={cut}>
          <rect width="64" height="64" fill="#fff" />
          <g transform="translate(8 10.75) scale(.75)" fill="#000">
            <circle cx="32" cy="15" r="10" />
            <path d={CUP} />
            <rect x="29.5" y="44" width="5" height="10" />
            <rect x="20" y="54" width="24" height="5" rx="2.5" />
          </g>
        </mask>
        <path d="M8 60 V32 a24 24 0 0 1 48 0 V60 Z" fill={fill} mask={`url(#${cut})`} />
      </svg>
    );
  }

  const cut = `lm-cut-${uid}`;
  const host = `lm-host-${uid}`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} {...a11y}>
      <mask id={cut}>
        <rect width="64" height="64" fill="#fff" />
        <g transform="translate(13.44 15.3) scale(.58)" fill="#000">
          {/* clear ring around the host keeps it legible on any season's fill */}
          <circle cx="32" cy="15" r="12.4" />
          <path d={CUP} />
          <rect x="29.5" y="44" width="5" height="10" />
          <rect x="20" y="54" width="24" height="5" rx="2.5" />
        </g>
      </mask>
      <mask id={host}>
        <rect width="64" height="64" fill="#fff" />
        <g transform="translate(13.44 15.3) scale(.58)" stroke="#000" strokeWidth="2.2" strokeLinecap="round">
          <line x1="32" y1="9" x2="32" y2="21" />
          <line x1="26" y1="15" x2="38" y2="15" />
        </g>
      </mask>
      <g fill={fill}>
        <path d="M9 61 V31 a23 23 0 0 1 46 0 V61" fill="none" stroke={fill} strokeWidth="3" />
        <path d="M16 56 V31.5 a16 16 0 0 1 32 0 V56 Z" mask={`url(#${cut})`} />
      </g>
      <circle cx="32" cy="24" r="5.8" fill={GOLD} mask={`url(#${host})`} />
      <rect x="16" y="51.5" width="32" height="2.5" fill={GOLD} />
    </svg>
  );
}

export default LogoMark;
