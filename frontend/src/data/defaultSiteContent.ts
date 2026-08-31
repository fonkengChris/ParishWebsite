import type { ParishConfig, SiteContent } from '../types';

/**
 * Default editorial copy for the static pages. This is the single source of
 * default copy — used for first paint, as the loading/empty-DB fallback in
 * SiteContentContext, and as the reference for the "Site Content" admin editor.
 *
 * Identity-bearing phrases use interpolation tokens ({name}, {city}, {diocese},
 * {tagline}, {patronName}, {patronDescriptor}) rather than literal parish names,
 * so these defaults render correctly for ANY parish that has only set its
 * ParishConfig. Use `fillParishTokens()` (below) when rendering these strings.
 */
export const defaultSiteContent: SiteContent = {
  home: {
    heroHeadingLead: 'Welcome home to',
    heroHeadingEmph: '{tagline}',
    heroSubhead:
      "{name} is a family of faith in {city} — gathering to worship, to serve the sick, and to walk together through the whole of the Church's year. There's a place for you here.",
    sanctuaryEyebrow: 'Come and Pray',
    sanctuaryHeadingLead: 'The doors are open.',
    sanctuaryHeadingEmph: 'Come and stand a while.',
    sanctuaryBody:
      "Beyond the news and the schedule there is the quiet of the sanctuary — Adoration, Confession, and the daily Mass, kept faithfully in step with the Church's year.",
    formationHeading: 'Grow in your faith',
    formationSubhead:
      'Nourish your soul each day through Scripture and the teaching of the Church.',
    scriptureCard: {
      eyebrow: 'Scripture',
      title: 'Immerse yourself in the Holy Bible',
      body: 'Make a habit of reading the Scriptures daily. God speaks to us through His Word — strengthening, guiding, and consoling us in every circumstance.',
      linkUrl: 'https://catenabible.com',
      linkLabel: 'Read the Bible online',
    },
    doctrineCard: {
      eyebrow: 'Doctrine',
      title: 'Deepen your faith with the Catechism',
      body: 'The Catechism of the Catholic Church presents the faith clearly and completely. Regular reading helps you understand what the Church believes and teaches.',
      linkUrl: 'https://www.vatican.va/archive/ENG0015/_INDEX.HTM',
      linkLabel: 'Read the Catechism online',
    },
    closingQuote:
      'Labour without stopping; do all the good you can while you still have the time.',
    closingAttribution: '{patronName} · {patronDescriptor}',
  },
  about: {
    subHero: 'Learn more about our parish community',
    historyParagraphs: [
      '{name} was established with a mission to serve the community and spread the message of faith, hope, and love. Over the years, we have grown into a vibrant community dedicated to worship, service, and fellowship.',
      'As part of {diocese}, we continue to build on the foundation laid by our founders, embracing both tradition and innovation in our ministry to serve God and our neighbors.',
    ],
    missionIntro: 'Our mission is to:',
    missionPoints: [
      'Provide a welcoming community for all who seek God',
      'Celebrate the sacraments with reverence and joy',
      'Serve those in need through acts of charity and compassion',
      'Educate and form disciples of Christ',
      'Build bridges of understanding and unity',
    ],
    pastoralTeam: [
      { role: 'Parish Priest', description: 'Leading our community in faith and service.' },
      { role: 'Associate Priests', description: 'Supporting the pastoral care of our parish.' },
      { role: 'Deacons', description: 'Assisting in liturgy and pastoral ministry.' },
      { role: 'Parish Staff', description: 'Dedicated team supporting parish operations.' },
    ],
    getInTouch:
      'For more information about our parish, please visit our contact page.',
  },
  pageIntros: {
    contact: {
      heading: 'Contact Us',
      subhead: "We'd love to hear from you",
    },
    donations: {
      heading: 'Support Our Parish',
      subhead:
        'Your generous donations help us continue our mission and serve our community. Thank you for your support!',
    },
    privacy: {
      heading: 'Privacy Policy',
      subhead: 'How we collect, use, and protect your information',
      effectiveDate: '',
    },
  },
};

/**
 * Replace parish identity tokens in an editorial string with live ParishConfig
 * values. Unknown tokens are left untouched. Safe to call on any string.
 */
export function fillParishTokens(text: string, parish: ParishConfig): string {
  if (!text) return text;
  const map: Record<string, string> = {
    name: parish.name,
    city: parish.city,
    diocese: parish.diocese,
    tagline: parish.tagline,
    patronName: parish.patron?.name ?? '',
    patronDescriptor: parish.patron?.descriptor ?? '',
  };
  return text.replace(/\{(\w+)\}/g, (match, key) =>
    key in map ? map[key] : match
  );
}
