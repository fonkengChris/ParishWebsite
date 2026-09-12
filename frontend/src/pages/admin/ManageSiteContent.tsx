import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { siteContentAPI } from '../../services/api';
import { getStoredUser } from '../../utils/auth';
import { useSiteContent } from '../../contexts/SiteContentContext';
import ImageUploadField from '../../components/admin/ImageUploadField';
import type { SiteContent, SiteContentCard } from '../../types';

const inputClass =
  'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors';
const labelClass = 'block text-sm font-semibold text-gray-700 mb-2';

function Field({ label, value, onChange, textarea }: {
  label: string; value: string; onChange: (v: string) => void; textarea?: boolean;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {textarea ? (
        <textarea rows={3} className={`${inputClass} resize-none`} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className={inputClass} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <legend className="text-lg font-bold text-gray-900 px-2">{title}</legend>
      <div className="space-y-5 mt-2">{children}</div>
    </fieldset>
  );
}

function CardEditor({ label, card, onChange }: {
  label: string; card: SiteContentCard; onChange: (c: SiteContentCard) => void;
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/60 space-y-4">
      <p className="text-sm font-bold text-gray-800">{label}</p>
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Eyebrow" value={card.eyebrow} onChange={(v) => onChange({ ...card, eyebrow: v })} />
        <Field label="Title" value={card.title} onChange={(v) => onChange({ ...card, title: v })} />
      </div>
      <Field label="Body" textarea value={card.body} onChange={(v) => onChange({ ...card, body: v })} />
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Link URL" value={card.linkUrl} onChange={(v) => onChange({ ...card, linkUrl: v })} />
        <Field label="Link Label" value={card.linkLabel} onChange={(v) => onChange({ ...card, linkLabel: v })} />
      </div>
    </div>
  );
}

function ListEditor({ label, items, onChange, addLabel }: {
  label: string; items: string[]; onChange: (items: string[]) => void; addLabel: string;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input className={inputClass} value={item}
              onChange={(e) => onChange(items.map((it, idx) => (idx === i ? e.target.value : it)))} />
            <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="px-3 text-sm font-medium text-red-600 hover:text-red-800">Remove</button>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => onChange([...items, ''])}
        className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-800">+ {addLabel}</button>
    </div>
  );
}

export default function ManageSiteContent() {
  const navigate = useNavigate();
  const { content, refresh } = useSiteContent();
  const [user, setUser] = useState(getStoredUser());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<SiteContent>(content);

  useEffect(() => {
    const currentUser = getStoredUser();
    setUser(currentUser);
    if (!currentUser) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  // Keep the form in sync with the loaded content. `content` only changes on
  // initial load and after our own save (via refresh), never mid-edit, so this
  // seeds the editor without clobbering in-progress changes.
  useEffect(() => {
    setForm(content);
  }, [content]);

  const home = form.home;
  const about = form.about;
  const intros = form.pageIntros;
  const setHome = (patch: Partial<SiteContent['home']>) => setForm((f) => ({ ...f, home: { ...f.home, ...patch } }));
  const setAbout = (patch: Partial<SiteContent['about']>) => setForm((f) => ({ ...f, about: { ...f.about, ...patch } }));
  const setIntros = (patch: Partial<SiteContent['pageIntros']>) => setForm((f) => ({ ...f, pageIntros: { ...f.pageIntros, ...patch } }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await siteContentAPI.update(form);
      await refresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (error) {
      console.error('Error saving site content:', error);
      alert('Failed to save site content');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Site Content</h1>
              <p className="text-sm text-gray-500">Editorial copy for the Home & About pages</p>
            </div>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-800">
          Tip: use tokens <code>{'{name}'}</code>, <code>{'{city}'}</code>, <code>{'{diocese}'}</code>,{' '}
          <code>{'{tagline}'}</code>, <code>{'{patronName}'}</code>, <code>{'{patronDescriptor}'}</code> in any
          field — they are replaced with the live Parish Settings values when the page renders.
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Section title="Home — Hero">
            <Field label="Heading Lead" value={home.heroHeadingLead} onChange={(v) => setHome({ heroHeadingLead: v })} />
            <Field label="Heading Emphasis (italic)" value={home.heroHeadingEmph} onChange={(v) => setHome({ heroHeadingEmph: v })} />
            <Field label="Subhead" textarea value={home.heroSubhead} onChange={(v) => setHome({ heroSubhead: v })} />
          </Section>

          <Section title="Home — Sanctuary Band">
            <Field label="Eyebrow" value={home.sanctuaryEyebrow} onChange={(v) => setHome({ sanctuaryEyebrow: v })} />
            <div className="grid md:grid-cols-2 gap-5">
              <Field label="Heading Lead" value={home.sanctuaryHeadingLead} onChange={(v) => setHome({ sanctuaryHeadingLead: v })} />
              <Field label="Heading Emphasis (italic)" value={home.sanctuaryHeadingEmph} onChange={(v) => setHome({ sanctuaryHeadingEmph: v })} />
            </div>
            <Field label="Body" textarea value={home.sanctuaryBody} onChange={(v) => setHome({ sanctuaryBody: v })} />
          </Section>

          <Section title="Home — Formation">
            <Field label="Heading" value={home.formationHeading} onChange={(v) => setHome({ formationHeading: v })} />
            <Field label="Subhead" textarea value={home.formationSubhead} onChange={(v) => setHome({ formationSubhead: v })} />
            <CardEditor label="Scripture Card" card={home.scriptureCard} onChange={(c) => setHome({ scriptureCard: c })} />
            <CardEditor label="Doctrine Card" card={home.doctrineCard} onChange={(c) => setHome({ doctrineCard: c })} />
          </Section>

          <Section title="Home — Closing Verse">
            <Field label="Quote" textarea value={home.closingQuote} onChange={(v) => setHome({ closingQuote: v })} />
            <Field label="Attribution" value={home.closingAttribution} onChange={(v) => setHome({ closingAttribution: v })} />
          </Section>

          <Section title="About">
            <Field label="Sub-hero" value={about.subHero} onChange={(v) => setAbout({ subHero: v })} />
            <ListEditor label="History Paragraphs" items={about.historyParagraphs} addLabel="Add paragraph"
              onChange={(items) => setAbout({ historyParagraphs: items })} />
            <Field label="Mission Intro" value={about.missionIntro} onChange={(v) => setAbout({ missionIntro: v })} />
            <ListEditor label="Mission Points" items={about.missionPoints} addLabel="Add point"
              onChange={(items) => setAbout({ missionPoints: items })} />
            <div>
              <label className={labelClass}>Pastoral Team</label>
              <div className="space-y-3">
                {about.pastoralTeam.map((member, i) => (
                  <div key={i} className="flex gap-2 items-start border border-gray-200 rounded-lg p-3 bg-gray-50/60">
                    <div className="flex-1 space-y-3">
                      <div className="grid md:grid-cols-2 gap-3">
                        <input className={inputClass} placeholder="Name (e.g. Fr. John Doe)" value={member.name || ''}
                          onChange={(e) => setAbout({ pastoralTeam: about.pastoralTeam.map((m, idx) => idx === i ? { ...m, name: e.target.value } : m) })} />
                        <input className={inputClass} placeholder="Role" value={member.role}
                          onChange={(e) => setAbout({ pastoralTeam: about.pastoralTeam.map((m, idx) => idx === i ? { ...m, role: e.target.value } : m) })} />
                      </div>
                      <input className={inputClass} placeholder="Description" value={member.description}
                        onChange={(e) => setAbout({ pastoralTeam: about.pastoralTeam.map((m, idx) => idx === i ? { ...m, description: e.target.value } : m) })} />
                      <ImageUploadField label="Photo" value={member.image || ''}
                        onChange={(url) => setAbout({ pastoralTeam: about.pastoralTeam.map((m, idx) => idx === i ? { ...m, image: url } : m) })} />
                    </div>
                    <button type="button" className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800"
                      onClick={() => setAbout({ pastoralTeam: about.pastoralTeam.filter((_, idx) => idx !== i) })}>Remove</button>
                  </div>
                ))}
              </div>
              <button type="button" className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                onClick={() => setAbout({ pastoralTeam: [...about.pastoralTeam, { name: '', role: '', description: '', image: '' }] })}>+ Add team member</button>
            </div>
            <Field label="Get in Touch" textarea value={about.getInTouch} onChange={(v) => setAbout({ getInTouch: v })} />
          </Section>

          <Section title="Page Intros">
            <div className="grid md:grid-cols-2 gap-5">
              <Field label="Contact — Heading" value={intros.contact.heading} onChange={(v) => setIntros({ contact: { ...intros.contact, heading: v } })} />
              <Field label="Contact — Subhead" value={intros.contact.subhead} onChange={(v) => setIntros({ contact: { ...intros.contact, subhead: v } })} />
              <Field label="Donations — Heading" value={intros.donations.heading} onChange={(v) => setIntros({ donations: { ...intros.donations, heading: v } })} />
              <Field label="Donations — Subhead" value={intros.donations.subhead} onChange={(v) => setIntros({ donations: { ...intros.donations, subhead: v } })} />
              <Field label="Privacy — Heading" value={intros.privacy.heading} onChange={(v) => setIntros({ privacy: { ...intros.privacy, heading: v } })} />
              <Field label="Privacy — Subhead" value={intros.privacy.subhead} onChange={(v) => setIntros({ privacy: { ...intros.privacy, subhead: v } })} />
              <Field label="Privacy — Effective Date" value={intros.privacy.effectiveDate} onChange={(v) => setIntros({ privacy: { ...intros.privacy, effectiveDate: v } })} />
            </div>
          </Section>

          <div className="flex items-center justify-end gap-4 sticky bottom-0 bg-gradient-to-t from-gray-50 to-transparent py-4">
            {saved && <span className="text-sm font-medium text-green-700">Saved ✓</span>}
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save Site Content'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
