import { useState } from 'react';
import { uploadAPI } from '../../services/api';

const inputClass =
  'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors';
const labelClass = 'block text-sm font-semibold text-gray-700 mb-2';

/**
 * Image field with upload + manual URL entry. Uploads the chosen file to
 * /api/uploads and calls onChange with the returned public URL. The URL stays
 * editable by hand so existing /images/… paths still work. Shared by the admin
 * pages (parish settings, site content) for logos, photos, etc.
 */
export default function ImageUploadField({
  label,
  value,
  onChange,
  placeholder = '/images/… or upload',
}: {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
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
      {label && <label className={labelClass}>{label}</label>}
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
          <input className={inputClass} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
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
