/**
 * Build frontend URLs for chatbot resource links.
 * Set FRONTEND_URL in production (e.g. https://your-parish-site.vercel.app).
 */
export function getFrontendBaseUrl() {
  const url = process.env.FRONTEND_URL || 'http://localhost:3000';
  return url.replace(/\/$/, '');
}

export function buildResourceLink(type, id) {
  if (!id) {
    return null;
  }

  const base = getFrontendBaseUrl();

  switch (type) {
    case 'announcement':
      return `${base}/announcements/${id}`;
    case 'prayer':
      return `${base}/prayers#resource-${id}`;
    case 'sermon':
    case 'catechisis':
      return `${base}/sermons#resource-${id}`;
    default:
      return null;
  }
}

export function formatResourceLinkLine(type, id, label = 'Read more') {
  const url = buildResourceLink(type, id);
  if (!url) {
    return '';
  }

  return `  ${label}: ${url}`;
}
