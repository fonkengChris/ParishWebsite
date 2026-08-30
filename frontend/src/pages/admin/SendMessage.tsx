import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationsAPI, parishionersAPI } from '../../services/api';
import { getStoredUser } from '../../utils/auth';
import type {
  NotificationChannel,
  NotificationRecipient,
  NotificationRecord,
  NotificationServiceStatus,
} from '../../services/api';
import type { Parishioner } from '../../types';

interface ParishionerRecipient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface ManualRecipient {
  id: string;
  name: string;
  email: string;
  phone: string;
}

const channelNeedsEmail = (type: NotificationChannel) => type === 'email' || type === 'both';
const channelNeedsPhone = (type: NotificationChannel) => type === 'sms' || type === 'both';

export default function SendMessage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getStoredUser());

  const [parishioners, setParishioners] = useState<ParishionerRecipient[]>([]);
  const [status, setStatus] = useState<NotificationServiceStatus | null>(null);
  const [history, setHistory] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Compose form
  const [type, setType] = useState<NotificationChannel>('email');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [manualRecipients, setManualRecipients] = useState<ManualRecipient[]>([]);
  const [manualDraft, setManualDraft] = useState({ name: '', email: '', phone: '' });
  const [search, setSearch] = useState('');

  const hasFetchedRef = useRef(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [parishionerList, serviceStatus, historyRes] = await Promise.all([
        parishionersAPI.getAll(),
        notificationsAPI.getStatus().catch(() => null),
        notificationsAPI.getHistory({ limit: 20 }).catch(() => null),
      ]);

      const mapped: ParishionerRecipient[] = parishionerList.map((p: Parishioner) => ({
        id: p._id,
        name: `${p.firstName} ${p.lastName}`.trim(),
        email: typeof p.user === 'object' && p.user ? p.user.email : undefined,
        phone: p.phone,
      }));
      setParishioners(mapped);
      setStatus(serviceStatus);
      setHistory(historyRes?.notifications ?? []);
    } catch (error) {
      console.error('Error loading send-message data:', error);
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
      fetchData();
    }
  }, [navigate, fetchData]);

  const refreshHistory = useCallback(async () => {
    try {
      const res = await notificationsAPI.getHistory({ limit: 20 });
      setHistory(res.notifications);
    } catch (error) {
      console.error('Error refreshing history:', error);
    }
  }, []);

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredParishioners = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return parishioners;
    return parishioners.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.email || '').toLowerCase().includes(q) ||
        (p.phone || '').toLowerCase().includes(q)
    );
  }, [parishioners, search]);

  const addManualRecipient = () => {
    const email = manualDraft.email.trim();
    const phone = manualDraft.phone.trim();
    if (!email && !phone) {
      alert('Enter an email and/or phone for the manual recipient.');
      return;
    }
    setManualRecipients((prev) => [
      ...prev,
      { id: `manual-${Date.now()}`, name: manualDraft.name.trim(), email, phone },
    ]);
    setManualDraft({ name: '', email: '', phone: '' });
  };

  const removeManualRecipient = (id: string) => {
    setManualRecipients((prev) => prev.filter((r) => r.id !== id));
  };

  // All chosen recipients (parishioners + manual), before channel filtering.
  const chosenRecipients: NotificationRecipient[] = useMemo(() => {
    const fromParishioners = parishioners
      .filter((p) => selectedIds.has(p.id))
      .map((p) => ({ name: p.name, email: p.email, phone: p.phone }));
    const fromManual = manualRecipients.map((r) => ({
      name: r.name || undefined,
      email: r.email || undefined,
      phone: r.phone || undefined,
    }));
    return [...fromParishioners, ...fromManual];
  }, [parishioners, selectedIds, manualRecipients]);

  // Recipients valid for the chosen channel + those skipped (missing required field).
  const { validRecipients, skippedCount } = useMemo(() => {
    const valid = chosenRecipients.filter((r) => {
      if (channelNeedsEmail(type) && !r.email) return false;
      if (channelNeedsPhone(type) && !r.phone) return false;
      return true;
    });
    return { validRecipients: valid, skippedCount: chosenRecipients.length - valid.length };
  }, [chosenRecipients, type]);

  const subjectRequired = channelNeedsEmail(type);
  const missingSubject = subjectRequired && !subject.trim();

  const canSend =
    !sending &&
    !!message.trim() &&
    !missingSubject &&
    validRecipients.length > 0;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend) return;

    const label =
      type === 'both' ? 'Email + WhatsApp' : type === 'sms' ? 'WhatsApp' : 'Email';
    if (
      !confirm(
        `Send this ${label} message to ${validRecipients.length} recipient(s)?` +
          (skippedCount > 0 ? `\n(${skippedCount} will be skipped — missing required contact info.)` : '')
      )
    ) {
      return;
    }

    try {
      setSending(true);
      const result = await notificationsAPI.sendBulk({
        recipients: validRecipients,
        type,
        subject: subjectRequired ? subject.trim() : undefined,
        message: message.trim(),
      });

      alert(
        `Done. ${result.successful} sent, ${result.failed} failed (of ${result.total}).` +
          (skippedCount > 0 ? `\n${skippedCount} skipped before sending.` : '')
      );

      // Reset compose state (keep recipient selection cleared to avoid accidental re-sends)
      setSubject('');
      setMessage('');
      setSelectedIds(new Set());
      setManualRecipients([]);
      await refreshHistory();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">✉️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Send Message</h1>
                <p className="text-sm text-gray-500">Email or WhatsApp your parishioners</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Service status badges */}
        {status && (
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="text-sm font-medium text-gray-600">Channels:</span>
            <span
              className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                status.available.email ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Email {status.available.email ? 'ready' : 'not configured'}
            </span>
            <span
              className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                status.available.sms ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}
            >
              WhatsApp {status.available.sms ? 'ready' : 'not configured'}
            </span>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading…</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Compose form */}
            <form onSubmit={handleSend} className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Compose</h2>

                {/* Channel */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Channel</label>
                  <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden">
                    {(['email', 'sms', 'both'] as NotificationChannel[]).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setType(opt)}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                          type === opt
                            ? 'bg-gradient-to-r from-cyan-600 to-cyan-700 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {opt === 'email' ? 'Email' : opt === 'sms' ? 'WhatsApp' : 'Both'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject (email only) */}
                {subjectRequired && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                      placeholder="Email subject line"
                    />
                    {missingSubject && (
                      <p className="mt-1 text-sm text-red-600">Subject is required for email.</p>
                    )}
                  </div>
                )}

                {/* Message */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={7}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors resize-none"
                    placeholder="Write your message to parishioners…"
                  />
                </div>
              </div>

              {/* Recipients */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Recipients</h2>
                  <span className="text-sm text-gray-500">
                    {validRecipients.length} valid
                    {skippedCount > 0 && (
                      <span className="text-amber-600">
                        {' '}· {skippedCount} skipped ({channelNeedsPhone(type) && channelNeedsEmail(type)
                          ? 'no email/phone'
                          : channelNeedsPhone(type)
                          ? 'no phone'
                          : 'no email'})
                      </span>
                    )}
                  </span>
                </div>

                {/* Parishioner picker */}
                <div>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors mb-3"
                    placeholder="Search parishioners by name, email, or phone"
                  />
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                    {filteredParishioners.length === 0 ? (
                      <p className="p-4 text-sm text-gray-500 text-center">No parishioners found.</p>
                    ) : (
                      filteredParishioners.map((p) => {
                        const missingForChannel =
                          (channelNeedsEmail(type) && !p.email) ||
                          (channelNeedsPhone(type) && !p.phone);
                        return (
                          <label
                            key={p.id}
                            className="flex items-center px-4 py-2.5 hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedIds.has(p.id)}
                              onChange={() => toggleSelected(p.id)}
                              className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                            />
                            <span className="ml-3 flex-1 min-w-0">
                              <span className="block text-sm font-medium text-gray-900 truncate">
                                {p.name}
                              </span>
                              <span className="block text-xs text-gray-500 truncate">
                                {p.email || 'no email'} · {p.phone || 'no phone'}
                              </span>
                            </span>
                            {missingForChannel && selectedIds.has(p.id) && (
                              <span className="ml-2 inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                                skipped
                              </span>
                            )}
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Manual recipients */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Add a recipient manually
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      value={manualDraft.name}
                      onChange={(e) => setManualDraft({ ...manualDraft, name: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors text-sm"
                      placeholder="Name (optional)"
                    />
                    <input
                      type="email"
                      value={manualDraft.email}
                      onChange={(e) => setManualDraft({ ...manualDraft, email: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors text-sm"
                      placeholder="Email"
                    />
                    <input
                      type="tel"
                      value={manualDraft.phone}
                      onChange={(e) => setManualDraft({ ...manualDraft, phone: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors text-sm"
                      placeholder="Phone (e.g. +237…)"
                    />
                    <button
                      type="button"
                      onClick={addManualRecipient}
                      className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-cyan-600 to-cyan-700 rounded-lg hover:from-cyan-700 hover:to-cyan-800 transition-colors"
                    >
                      Add
                    </button>
                  </div>

                  {manualRecipients.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {manualRecipients.map((r) => (
                        <li
                          key={r.id}
                          className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg text-sm"
                        >
                          <span className="min-w-0 truncate">
                            {r.name ? `${r.name} · ` : ''}
                            {r.email || 'no email'} · {r.phone || 'no phone'}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeManualRecipient(r.id)}
                            className="ml-3 text-red-600 hover:text-red-800 font-medium"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Send bar */}
              <div className="flex items-center justify-end gap-3">
                {validRecipients.length === 0 && chosenRecipients.length > 0 && (
                  <p className="text-sm text-amber-600">
                    No recipients have the contact info this channel needs.
                  </p>
                )}
                <button
                  type="submit"
                  disabled={!canSend}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-cyan-600 to-cyan-700 rounded-lg hover:from-cyan-700 hover:to-cyan-800 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? 'Sending…' : `Send to ${validRecipients.length}`}
                </button>
              </div>
            </form>

            {/* History */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Recent sends</h2>
                {history.length === 0 ? (
                  <p className="text-sm text-gray-500">No messages sent yet.</p>
                ) : (
                  <ul className="space-y-3">
                    {history.map((n) => (
                      <li key={n._id} className="border border-gray-100 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            {n.type === 'sms' ? 'WhatsApp' : n.type === 'both' ? 'Email + WhatsApp' : 'Email'}
                          </span>
                          <span
                            className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                              n.status === 'sent'
                                ? 'bg-green-100 text-green-800'
                                : n.status === 'partially_sent'
                                ? 'bg-amber-100 text-amber-800'
                                : n.status === 'failed'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {n.status.replace('_', ' ')}
                          </span>
                        </div>
                        {n.subject && (
                          <p className="text-sm font-semibold text-gray-900 truncate">{n.subject}</p>
                        )}
                        <p className="text-xs text-gray-500 truncate">
                          {n.recipient?.name || n.recipient?.email || n.recipient?.phone || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
