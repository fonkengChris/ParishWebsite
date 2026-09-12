import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { parishConfigAPI, uploadAPI } from '../../services/api';
import { getStoredUser } from '../../utils/auth';
import { useParish } from '../../contexts/ParishContext';
import type { ParishConfig, ChurchLeader } from '../../types';

const inputClass =
  'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors';
const labelClass = 'block text-sm font-semibold text-gray-700 mb-2';

const EMPTY_LEADER: ChurchLeader = { name: '', title: '', image: '' };
const emptyLeadership = () => ({ pope: { ...EMPTY_LEADER }, bishops: [] as ChurchLeader[] });

/**
 * Image field with upload + manual URL entry. Uploads the chosen file to
 * /api/uploads and calls onChange with the returned public URL. The URL stays
 * editable by hand so existing /images/… paths still work.
 */
function ImageUploadField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file
    if (!file) return;
    try {
      setError('');
      setUploading(true);
      const url = await uploadAPI.uploadImage(file);
      onChange(url);
    } catch (err) {
      console.error('Image upload failed:', err);
      setError('Upload failed. Try a JPEG/PNG/WebP under 5 MB.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="flex items-start gap-3">
        {value ? (
          <img src={value} alt="" className="w-14 h-14 rounded-lg object-cover border border-gray-200 flex-shrink-0" />
        ) : (
          <div className="w-14 h-14 rounded-lg border border-dashed border-gray-300 flex-shrink-0 flex items-center justify-center text-gray-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 6h16v12H4z" />
            </svg>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <input className={inputClass} value={value} onChange={(e) => onChange(e.target.value)} placeholder="/images/… or upload" />
          <div className="mt-2 flex items-center gap-3">
            <label className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
              {uploading ? 'Uploading…' : 'Upload image'}
              <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={handleFile} />
            </label>
            {error && <span className="text-xs text-red-600">{error}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ManageParishSettings() {
  const navigate = useNavigate();
  const { refresh } = useParish();
  const [user, setUser] = useState(getStoredUser());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<ParishConfig | null>(null);
  const [officeHoursText, setOfficeHoursText] = useState('');
  const hasFetchedRef = useRef(false);

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      const data = await parishConfigAPI.get();
      setForm(data);
      setOfficeHoursText((data.contact?.officeHours || []).join('\n'));
    } catch (error) {
      console.error('Error fetching parish config:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const currentUser = getStoredUser();
    setUser(currentUser);
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchConfig();
    }
  }, [navigate, fetchConfig]);

  const set = <K extends keyof ParishConfig>(key: K, value: ParishConfig[K]) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  const setPope = (field: keyof ChurchLeader, value: string) =>
    setForm((prev) => {
      if (!prev) return prev;
      const lead = prev.leadership ?? emptyLeadership();
      return { ...prev, leadership: { ...lead, pope: { ...lead.pope, [field]: value } } };
    });

  const setBishop = (i: number, field: keyof ChurchLeader, value: string) =>
    setForm((prev) => {
      if (!prev) return prev;
      const lead = prev.leadership ?? emptyLeadership();
      const bishops = lead.bishops.map((b, idx) => (idx === i ? { ...b, [field]: value } : b));
      return { ...prev, leadership: { ...lead, bishops } };
    });

  const addBishop = () =>
    setForm((prev) => {
      if (!prev) return prev;
      const lead = prev.leadership ?? emptyLeadership();
      return { ...prev, leadership: { ...lead, bishops: [...lead.bishops, { ...EMPTY_LEADER }] } };
    });

  const removeBishop = (i: number) =>
    setForm((prev) => {
      if (!prev) return prev;
      const lead = prev.leadership ?? emptyLeadership();
      return { ...prev, leadership: { ...lead, bishops: lead.bishops.filter((_, idx) => idx !== i) } };
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    try {
      setSaving(true);
      const payload: Partial<ParishConfig> = {
        ...form,
        contact: {
          ...form.contact,
          officeHours: officeHoursText.split('\n').map((l) => l.trim()).filter(Boolean),
        },
      };
      await parishConfigAPI.update(payload);
      await refresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (error) {
      console.error('Error saving parish config:', error);
      alert('Failed to save parish settings');
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
              <h1 className="text-2xl font-bold text-gray-900">Parish Settings</h1>
              <p className="text-sm text-gray-500">Identity, contacts, branding & assets</p>
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
        {loading || !form ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading parish settings...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Identity */}
            <fieldset className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <legend className="text-lg font-bold text-gray-900 px-2">Identity</legend>
              <div className="grid md:grid-cols-2 gap-5 mt-2">
                <div>
                  <label className={labelClass}>Parish Name</label>
                  <input className={inputClass} value={form.name} onChange={(e) => set('name', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Tagline</label>
                  <input className={inputClass} value={form.tagline} onChange={(e) => set('tagline', e.target.value)} placeholder="e.g. Holy Ground" />
                </div>
                <div>
                  <label className={labelClass}>Diocese</label>
                  <input className={inputClass} value={form.diocese} onChange={(e) => set('diocese', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Diocese Website URL</label>
                  <input className={inputClass} value={form.dioceseUrl} onChange={(e) => set('dioceseUrl', e.target.value)} placeholder="https://…" />
                </div>
                <div>
                  <label className={labelClass}>City</label>
                  <input className={inputClass} value={form.city} onChange={(e) => set('city', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Region / State</label>
                  <input className={inputClass} value={form.region} onChange={(e) => set('region', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Country</label>
                  <input className={inputClass} value={form.country} onChange={(e) => set('country', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Neighbourhood</label>
                  <input className={inputClass} value={form.neighbourhood} onChange={(e) => set('neighbourhood', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Latitude</label>
                  <input type="number" step="any" className={inputClass} value={form.coordinates.lat}
                    onChange={(e) => set('coordinates', { ...form.coordinates, lat: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className={labelClass}>Longitude</label>
                  <input type="number" step="any" className={inputClass} value={form.coordinates.lng}
                    onChange={(e) => set('coordinates', { ...form.coordinates, lng: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className={labelClass}>Display Currency</label>
                  <input className={inputClass} value={form.currency} onChange={(e) => set('currency', e.target.value)} placeholder="XAF" />
                </div>
              </div>
            </fieldset>

            {/* Patron */}
            <fieldset className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <legend className="text-lg font-bold text-gray-900 px-2">Patron Saint</legend>
              <div className="grid md:grid-cols-2 gap-5 mt-2">
                <div>
                  <label className={labelClass}>Patron Name</label>
                  <input className={inputClass} value={form.patron.name} onChange={(e) => set('patron', { ...form.patron, name: e.target.value })} />
                </div>
                <div>
                  <label className={labelClass}>Patron Descriptor</label>
                  <input className={inputClass} value={form.patron.descriptor} onChange={(e) => set('patron', { ...form.patron, descriptor: e.target.value })} placeholder="e.g. Patron of the Sick" />
                </div>
              </div>
            </fieldset>

            {/* Church Leadership */}
            <fieldset className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <legend className="text-lg font-bold text-gray-900 px-2">Church Leadership</legend>
              <p className="text-sm text-gray-500 mt-1 mb-4 px-2">
                Shown on the Home page. The Holy Father is the same for the whole Church; the
                bishop(s) depend on your diocese. Image URLs work like assets (e.g. <code>/images/bishop.jpeg</code>).
              </p>

              <h3 className="text-sm font-bold text-gray-800 px-2 mb-2">Holy Father</h3>
              <div className="grid md:grid-cols-3 gap-5 mb-6">
                <div>
                  <label className={labelClass}>Name</label>
                  <input className={inputClass} value={(form.leadership ?? emptyLeadership()).pope.name}
                    onChange={(e) => setPope('name', e.target.value)} placeholder="Pope Leo XIV" />
                </div>
                <div>
                  <label className={labelClass}>Title</label>
                  <input className={inputClass} value={(form.leadership ?? emptyLeadership()).pope.title}
                    onChange={(e) => setPope('title', e.target.value)} placeholder="Bishop of Rome · Successor of St. Peter" />
                </div>
                <ImageUploadField
                  label="Photo"
                  value={(form.leadership ?? emptyLeadership()).pope.image}
                  onChange={(url) => setPope('image', url)}
                />
              </div>

              <div className="flex items-center justify-between px-2 mb-2">
                <h3 className="text-sm font-bold text-gray-800">Bishop(s)</h3>
                <button type="button" onClick={addBishop}
                  className="text-sm font-medium text-blue-700 hover:text-blue-900">+ Add bishop</button>
              </div>
              {(form.leadership ?? emptyLeadership()).bishops.length === 0 ? (
                <p className="text-sm text-gray-400 px-2">No bishops added yet.</p>
              ) : (
                (form.leadership ?? emptyLeadership()).bishops.map((bishop, i) => (
                  <div key={i} className="grid md:grid-cols-[1fr_1fr_1.4fr_auto] gap-5 items-start mb-4 pb-4 border-b border-gray-100 last:border-0">
                    <div>
                      <label className={labelClass}>Name</label>
                      <input className={inputClass} value={bishop.name}
                        onChange={(e) => setBishop(i, 'name', e.target.value)} placeholder="Most Rev. …" />
                    </div>
                    <div>
                      <label className={labelClass}>Title</label>
                      <input className={inputClass} value={bishop.title}
                        onChange={(e) => setBishop(i, 'title', e.target.value)} placeholder="Bishop of …" />
                    </div>
                    <ImageUploadField
                      label="Photo"
                      value={bishop.image}
                      onChange={(url) => setBishop(i, 'image', url)}
                    />
                    <button type="button" onClick={() => removeBishop(i)}
                      className="mt-9 px-3 py-2.5 text-sm font-medium text-red-600 hover:text-red-800">Remove</button>
                  </div>
                ))
              )}
            </fieldset>

            {/* Contact */}
            <fieldset className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <legend className="text-lg font-bold text-gray-900 px-2">Contact</legend>
              <div className="grid md:grid-cols-2 gap-5 mt-2">
                <div>
                  <label className={labelClass}>Phone</label>
                  <input className={inputClass} value={form.contact.phone} onChange={(e) => set('contact', { ...form.contact, phone: e.target.value })} />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input className={inputClass} value={form.contact.email} onChange={(e) => set('contact', { ...form.contact, email: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Address</label>
                  <input className={inputClass} value={form.contact.address} onChange={(e) => set('contact', { ...form.contact, address: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Office Hours <span className="font-normal text-gray-500">(one line per row)</span></label>
                  <textarea rows={3} className={`${inputClass} resize-none`} value={officeHoursText} onChange={(e) => setOfficeHoursText(e.target.value)} />
                </div>
              </div>
            </fieldset>

            {/* Social */}
            <fieldset className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <legend className="text-lg font-bold text-gray-900 px-2">Social Links</legend>
              <div className="grid md:grid-cols-2 gap-5 mt-2">
                {(['facebook', 'youtube', 'instagram', 'whatsapp', 'twitter'] as const).map((key) => (
                  <div key={key}>
                    <label className={`${labelClass} capitalize`}>{key}</label>
                    <input className={inputClass} value={form.social[key] || ''} onChange={(e) => set('social', { ...form.social, [key]: e.target.value })} placeholder="https://…" />
                  </div>
                ))}
              </div>
            </fieldset>

            {/* Assets */}
            <fieldset className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <legend className="text-lg font-bold text-gray-900 px-2">Assets</legend>
              <p className="text-sm text-gray-500 mt-1 mb-3 px-2">
                URLs to the logo, favicon, and hero image. Drop files in <code>frontend/public/</code> and reference them (e.g. <code>/images/hero.jpg</code>), or use a full CDN URL.
              </p>
              <div className="grid md:grid-cols-3 gap-5">
                <div>
                  <label className={labelClass}>Logo URL</label>
                  <input className={inputClass} value={form.assets.logoUrl} onChange={(e) => set('assets', { ...form.assets, logoUrl: e.target.value })} />
                </div>
                <div>
                  <label className={labelClass}>Favicon URL</label>
                  <input className={inputClass} value={form.assets.faviconUrl} onChange={(e) => set('assets', { ...form.assets, faviconUrl: e.target.value })} />
                </div>
                <div>
                  <label className={labelClass}>Hero Image URL</label>
                  <input className={inputClass} value={form.assets.heroUrl} onChange={(e) => set('assets', { ...form.assets, heroUrl: e.target.value })} />
                </div>
              </div>
            </fieldset>

            <div className="flex items-center justify-end gap-4 sticky bottom-0 bg-gradient-to-t from-gray-50 to-transparent py-4">
              {saved && <span className="text-sm font-medium text-green-700">Saved ✓</span>}
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save Parish Settings'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
