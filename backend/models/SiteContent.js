import mongoose from 'mongoose';

/**
 * SiteContent — singleton document (one parish per database) holding the
 * editorial copy for the static pages (Home, About, page intros). Structured
 * by page with typed fields so the frontend stays type-safe. If absent, the
 * frontend falls back to its shipped defaults (data/defaultSiteContent.ts).
 */
const cardSchema = new mongoose.Schema({
  eyebrow: { type: String, default: '' },
  title: { type: String, default: '' },
  body: { type: String, default: '' },
  linkUrl: { type: String, default: '' },
  linkLabel: { type: String, default: '' }
}, { _id: false });

const introSchema = new mongoose.Schema({
  heading: { type: String, default: '' },
  subhead: { type: String, default: '' }
}, { _id: false });

const siteContentSchema = new mongoose.Schema({
  key: {
    type: String,
    default: 'default',
    unique: true,
    index: true
  },
  home: {
    heroHeadingLead: { type: String, default: '' },
    heroHeadingEmph: { type: String, default: '' },
    heroSubhead: { type: String, default: '' },
    sanctuaryEyebrow: { type: String, default: '' },
    sanctuaryHeadingLead: { type: String, default: '' },
    sanctuaryHeadingEmph: { type: String, default: '' },
    sanctuaryBody: { type: String, default: '' },
    formationHeading: { type: String, default: '' },
    formationSubhead: { type: String, default: '' },
    scriptureCard: { type: cardSchema, default: () => ({}) },
    doctrineCard: { type: cardSchema, default: () => ({}) },
    closingQuote: { type: String, default: '' },
    closingAttribution: { type: String, default: '' }
  },
  about: {
    subHero: { type: String, default: '' },
    historyParagraphs: { type: [String], default: [] },
    missionIntro: { type: String, default: '' },
    missionPoints: { type: [String], default: [] },
    pastoralTeam: {
      type: [{
        name: { type: String, default: '' },
        role: { type: String, default: '' },
        description: { type: String, default: '' },
        image: { type: String, default: '' }
      }],
      default: []
    },
    getInTouch: { type: String, default: '' }
  },
  pageIntros: {
    contact: { type: introSchema, default: () => ({}) },
    donations: { type: introSchema, default: () => ({}) },
    privacy: {
      heading: { type: String, default: '' },
      subhead: { type: String, default: '' },
      effectiveDate: { type: String, default: '' }
    }
  }
}, {
  timestamps: true
});

export default mongoose.model('SiteContent', siteContentSchema);
