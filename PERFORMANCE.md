# Performance Optimizations

This document describes the performance optimizations implemented in the Parish Website.

## 1. Image Optimization

### Client-Side Image Optimization

Before uploading images, they can be optimized using the `optimizeImage` utility:

```typescript
import { optimizeImage, validateImage } from '../utils/imageOptimization';

// Validate image
const validation = validateImage(file, 5); // Max 5MB
if (!validation.isValid) {
  alert(validation.error);
  return;
}

// Optimize image (resize to max 1920x1920, 80% quality)
const optimizedFile = await optimizeImage(file, 1920, 1920, 0.8);
```

### Features

- **Automatic resizing**: Images larger than specified dimensions are resized
- **Compression**: JPEG quality can be adjusted (default: 80%)
- **Format preservation**: Original format is maintained
- **Validation**: File type and size validation before processing

### Usage in Admin Dashboard

When implementing file uploads in the admin dashboard, use:

```typescript
const handleImageUpload = async (file: File) => {
  // Validate
  const validation = validateImage(file);
  if (!validation.isValid) {
    setError(validation.error);
    return;
  }

  // Optimize
  const optimized = await optimizeImage(file);
  
  // Upload optimized file
  // ... upload logic
};
```

## 2. Lazy Loading

### Gallery Images

All gallery images use lazy loading via the `LazyImage` component:

```tsx
<LazyImage
  src={item.imageUrl}
  alt={item.title}
  className="w-full h-64 object-cover"
/>
```

### How It Works

- Uses Intersection Observer API
- Images start loading 50px before entering viewport
- Placeholder shown until image loads
- Smooth fade-in transition
- Fallback error handling

### Benefits

- Faster initial page load
- Reduced bandwidth usage
- Better user experience
- Improved Core Web Vitals

## 3. Response Caching

### Frontend Caching

API responses are cached in memory for 5 minutes:

```typescript
import { cache, CACHE_KEYS } from '../utils/cache';

// Check cache first
const cached = cache.get<GalleryItem[]>(CACHE_KEYS.GALLERY);
if (cached) {
  return cached;
}

// Fetch and cache
const data = await galleryAPI.getAll();
cache.set(CACHE_KEYS.GALLERY, data, 5 * 60 * 1000);
```

### Cached Endpoints

- Gallery items (`/api/gallery`)
- Announcements (`/api/announcements`)
- Events (`/api/events`)

### Cache Invalidation

Cache is automatically invalidated when:
- Page is refreshed
- Cache expires (5 minutes)
- Manual cache clear: `cache.clearAll()`

### HTTP Cache Headers

API responses include Cache-Control headers:

```
Cache-Control: public, max-age=300
```

This allows browsers and CDNs to cache responses.

## 4. Code Splitting

### Vite Automatic Code Splitting

Vite automatically splits code by:
- Route boundaries (React Router)
- Dynamic imports
- Vendor chunks

### Manual Code Splitting

For large components, use dynamic imports:

```typescript
const HeavyComponent = lazy(() => import('./HeavyComponent'));

<Suspense fallback={<Loading />}>
  <HeavyComponent />
</Suspense>
```

## 5. Static Generation (Vercel)

### Pre-rendering

Vercel automatically pre-renders pages that:
- Use static data
- Don't require authentication
- Have predictable routes

### ISR (Incremental Static Regeneration)

For dynamic content, use ISR:

```typescript
// pages/gallery.tsx
export async function getStaticProps() {
  const items = await fetchGalleryItems();
  return {
    props: { items },
    revalidate: 300 // Revalidate every 5 minutes
  };
}
```

### Benefits

- Instant page loads
- Better SEO
- Reduced server load
- CDN caching

## 6. Image CDN

### Recommended: Cloudinary or Imgix

For production, use an image CDN:

1. Upload images to CDN
2. CDN automatically optimizes:
   - Format conversion (WebP, AVIF)
   - Responsive images
   - Compression
   - Lazy loading

### Example Integration

```typescript
// utils/imageUrl.ts
export const getOptimizedImageUrl = (url: string, width?: number) => {
  if (url.includes('cloudinary.com')) {
    return url.replace('/upload/', `/upload/w_${width || 'auto'},q_auto,f_auto/`);
  }
  return url;
};
```

## 7. Database Optimization

### Indexes

Ensure MongoDB indexes are set up:

```javascript
// models/GalleryItem.js
galleryItemSchema.index({ isActive: 1, createdAt: -1 });
galleryItemSchema.index({ eventId: 1 });
```

### Query Optimization

- Use `.select()` to limit fields
- Use `.populate()` efficiently
- Add `.lean()` for read-only queries
- Use pagination for large datasets

## 8. Bundle Size Optimization

### Current Bundle Size

- Main bundle: ~616 KB (gzipped: ~155 KB)
- CSS: ~50 KB (gzipped: ~12 KB)

### Optimization Tips

1. **Tree shaking**: Remove unused code
2. **Dynamic imports**: Load components on demand
3. **Code splitting**: Split by route
4. **Asset optimization**: Compress images, use WebP

## 9. Performance Metrics

### Core Web Vitals

Monitor these metrics:
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### Tools

- Google PageSpeed Insights
- Lighthouse
- WebPageTest
- Chrome DevTools Performance

## 10. Checklist

- [x] Lazy loading for images
- [x] Response caching
- [x] Image optimization utilities
- [x] HTTP cache headers
- [ ] Image CDN integration
- [ ] Database indexes
- [ ] Bundle size optimization
- [ ] Performance monitoring

