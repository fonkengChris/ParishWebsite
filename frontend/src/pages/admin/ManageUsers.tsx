import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersAPI } from '../../services/api';
import { getStoredUser } from '../../utils/auth';
import {
  can,
  canGrantRole,
  isTopRank,
  roleCan,
  GRANTABLE,
  ROLE_RANK,
  type Resource,
  type Role,
} from '../../utils/permissions';
import type { UserWithDetails } from '../../services/api';

const RESOURCE_LABELS: Record<Resource, string> = {
  Announcements: 'Announcements',
  Events: 'Events',
  MassSchedule: 'Mass Schedule',
  Apostolates: 'Apostolates',
  ParishServices: 'Parish Services',
  MissionStations: 'Mission Stations',
  Gallery: 'Gallery',
  Prayers: 'Prayers',
  Sermons: 'Sermons',
  Sacraments: 'Sacraments',
  LiturgicalColors: 'Liturgical Colours',
  Donations: 'Donations',
  Notifications: 'Send Message',
  Parishioners: 'Parishioner records',
  Users: 'Users',
  ParishConfig: 'Parish Settings',
  SiteContent: 'Site Content',
};

const ACCESS_GROUPS: Array<{ title: string; note?: string; resources: Resource[] }> = [
  {
    title: 'Parish content',
    resources: ['Announcements', 'Events', 'MassSchedule', 'Apostolates', 'ParishServices', 'MissionStations', 'Gallery'],
  },
  {
    title: 'Pastoral & liturgical',
    resources: ['Prayers', 'Sermons', 'Sacraments', 'LiturgicalColors'],
  },
  {
    title: 'Administration',
    note: 'Sensitive: personal data, money and messages sent in the parish’s name.',
    resources: ['Donations', 'Notifications', 'Parishioners', 'ParishConfig', 'SiteContent'],
  },
];

const getRoleDisplayName = (role: string) =>
  role === 'parish-priest' ? 'Parish Priest' : role.charAt(0).toUpperCase() + role.slice(1);

const focusRing =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 focus-visible:ring-offset-ivory';

export default function ManageUsers() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getStoredUser());
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRoleFor, setEditingRoleFor] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<Role>('parishioner');
  const [editingAccessFor, setEditingAccessFor] = useState<string | null>(null);
  // Every area the user will be able to manage once saved (role ± adjustments)
  const [editingAccess, setEditingAccess] = useState<Resource[]>([]);
  const [saving, setSaving] = useState(false);
  const hasFetchedRef = useRef(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await usersAPI.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to fetch users');
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

    if (!can(currentUser, 'Users')) {
      navigate('/admin/dashboard');
      return;
    }

    // Only fetch once on mount
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchUsers();
    }
  }, [navigate, fetchUsers]);

  const closeEditors = () => {
    setEditingRoleFor(null);
    setEditingAccessFor(null);
  };

  const startEditingRole = (u: UserWithDetails) => {
    closeEditors();
    setEditingRoleFor(u._id);
    setEditingRole(u.role);
  };

  const startEditingAccess = (u: UserWithDetails) => {
    closeEditors();
    setEditingAccessFor(u._id);
    setEditingAccess(GRANTABLE.filter((r) => can(u, r)));
  };

  const handleRoleChange = async (userId: string) => {
    if (!confirm(`Change this user's role to ${getRoleDisplayName(editingRole)}?`)) {
      return;
    }

    try {
      setSaving(true);
      await usersAPI.updateRole(userId, editingRole);
      closeEditors();
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user role:', error);
      alert(error.response?.data?.message || 'Failed to update user role');
    } finally {
      setSaving(false);
    }
  };

  const handleAccessSave = async (u: UserWithDetails) => {
    try {
      setSaving(true);
      // Store only the differences from the role: ticked areas it lacks, unticked areas it gives
      const grants = editingAccess.filter((r) => !roleCan(u.role, r));
      const revoked = GRANTABLE.filter((r) => roleCan(u.role, r) && !editingAccess.includes(r));
      await usersAPI.updatePermissions(u._id, grants, revoked);
      closeEditors();
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating permissions:', error);
      alert(error.response?.data?.message || 'Failed to update access');
    } finally {
      setSaving(false);
    }
  };

  const toggleAccess = (resource: Resource) => {
    setEditingAccess((prev) =>
      prev.includes(resource) ? prev.filter((r) => r !== resource) : [...prev, resource],
    );
  };

  if (!user) return null;

  // Only roles at or below the current user's own may be granted
  const roles = (Object.keys(ROLE_RANK) as Role[])
    .filter((role) => canGrantRole(user, role))
    .sort((a, b) => ROLE_RANK[b] - ROLE_RANK[a]);

  return (
    <div className="min-h-screen bg-ivory text-ink">
      {/* Header */}
      <header className="border-b border-line bg-ivory/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap gap-3 justify-between items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-700">Administration</p>
            <h1 className="font-serif text-2xl sm:text-3xl text-ink">Users &amp; access</h1>
          </div>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className={`inline-flex items-center px-4 py-2 text-sm font-semibold text-ink-soft border border-line rounded-full hover:text-ink hover:bg-ivory-2 transition-colors ${focusRing}`}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <p className="text-sm text-ink-soft">
            A role gives a standard set of areas. For anyone below admin, you can grant extra areas
            or take away areas their role would give. Admins and parish priests always have full access.
          </p>
          <p className="text-xs text-ink-soft mt-2">
            {users.length} {users.length === 1 ? 'user' : 'users'}
          </p>
        </div>

        {loading ? (
          <div className="border border-line rounded-xl bg-white/60 p-12 text-center">
            <div className="inline-block animate-spin motion-reduce:animate-none rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-ink-soft">Loading users…</p>
          </div>
        ) : users.length === 0 ? (
          <div className="border border-line rounded-xl bg-white/60 p-12 text-center">
            <h2 className="font-serif text-xl text-ink">No users yet</h2>
            <p className="mt-2 text-sm text-ink-soft">No one has registered.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {users.map((u) => {
              const isCurrentUser = user.id === u._id;
              const outranksMe = !canGrantRole(user, u.role);
              const locked = isCurrentUser || outranksMe;
              const lockedReason = isCurrentUser
                ? 'You cannot change your own access'
                : 'This user outranks you';
              const parishionerInfo = typeof u.parishioner === 'object' && u.parishioner ? u.parishioner : null;
              const name =
                u.username || (parishionerInfo ? `${parishionerInfo.firstName} ${parishionerInfo.lastName}` : 'Unnamed');
              const grants = (u.permissions ?? []) as Resource[];
              const revoked = (u.revokedPermissions ?? []) as Resource[];
              const fullAccess = isTopRank(u.role);
              const roleAreas = GRANTABLE.filter((r) => roleCan(u.role, r) && !revoked.includes(r));

              return (
                <li key={u._id} className="border border-line rounded-xl bg-white/70">
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-serif text-lg text-ink truncate">{name}</h2>
                        <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-ivory-2 text-ink border border-line">
                          {getRoleDisplayName(u.role)}
                        </span>
                      </div>
                      <p className="text-sm text-ink-soft truncate">
                        {u.email || parishionerInfo?.email || 'No email'}
                        {u.createdAt && <> · joined {new Date(u.createdAt).toLocaleDateString()}</>}
                      </p>

                      {/* Access summary */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {fullAccess ? (
                          <span className="text-xs font-semibold text-primary-700">Full access</span>
                        ) : (
                          <>
                            {roleAreas.map((r) => (
                              <span key={r} className="px-2 py-0.5 text-xs rounded-full border border-line text-ink-soft">
                                {RESOURCE_LABELS[r]}
                              </span>
                            ))}
                            {grants.map((r) => (
                              <span
                                key={r}
                                className="px-2 py-0.5 text-xs font-semibold rounded-full bg-primary-50 text-primary-800 border border-primary-200"
                                title="Granted individually"
                              >
                                + {RESOURCE_LABELS[r]}
                              </span>
                            ))}
                            {revoked.map((r) => (
                              <span
                                key={r}
                                className="px-2 py-0.5 text-xs rounded-full border border-dashed border-line text-ink-soft line-through"
                                title="Revoked from this user's role"
                              >
                                {RESOURCE_LABELS[r]}
                              </span>
                            ))}
                            {roleAreas.length === 0 && grants.length === 0 && (
                              <span className="text-xs text-ink-soft">No admin access</span>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 sm:justify-end shrink-0">
                      <button
                        onClick={() => startEditingRole(u)}
                        disabled={locked}
                        title={locked ? lockedReason : 'Change role'}
                        className={`px-3.5 py-1.5 text-sm font-semibold rounded-full border border-line text-ink hover:bg-ivory-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent ${focusRing}`}
                      >
                        Change role
                      </button>
                      <button
                        onClick={() => startEditingAccess(u)}
                        disabled={locked || fullAccess}
                        title={locked ? lockedReason : fullAccess ? 'Admins and parish priests always have full access' : 'Grant or revoke individual areas'}
                        className={`px-3.5 py-1.5 text-sm font-semibold rounded-full bg-primary-600 text-white hover:bg-primary-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${focusRing}`}
                      >
                        Edit access
                      </button>
                    </div>
                  </div>

                  {/* Role editor */}
                  {editingRoleFor === u._id && (
                    <div className="border-t border-line px-4 sm:px-5 py-4 bg-ivory-2/60 rounded-b-xl flex flex-wrap items-center gap-3">
                      <label htmlFor={`role-${u._id}`} className="text-sm font-semibold text-ink">
                        Role
                      </label>
                      <select
                        id={`role-${u._id}`}
                        value={editingRole}
                        onChange={(e) => setEditingRole(e.target.value as Role)}
                        className={`text-sm bg-white border border-line rounded-lg px-3 py-1.5 ${focusRing}`}
                      >
                        {roles.map((role) => (
                          <option key={role} value={role}>
                            {getRoleDisplayName(role)}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2 ml-auto">
                        <button
                          onClick={closeEditors}
                          className={`px-3.5 py-1.5 text-sm font-semibold rounded-full text-ink-soft hover:text-ink ${focusRing}`}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleRoleChange(u._id)}
                          disabled={saving || editingRole === u.role}
                          className={`px-3.5 py-1.5 text-sm font-semibold rounded-full bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-40 ${focusRing}`}
                        >
                          Save role
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Access editor */}
                  {editingAccessFor === u._id && (
                    <div className="border-t border-line px-4 sm:px-5 py-5 bg-ivory-2/60 rounded-b-xl">
                      <p className="text-sm text-ink-soft mb-4">
                        Tick every area {name} may manage. Areas marked “role” come with the{' '}
                        <strong className="text-ink">{getRoleDisplayName(u.role)}</strong> role; untick one to
                        revoke it for this user only.
                      </p>
                      <div className="grid gap-5 md:grid-cols-3">
                        {ACCESS_GROUPS.map((group) => (
                          <fieldset key={group.title}>
                            <legend className="text-xs font-bold uppercase tracking-[0.14em] text-primary-700 mb-1">
                              {group.title}
                            </legend>
                            {group.note && <p className="text-xs text-ink-soft mb-2">{group.note}</p>}
                            <div className="space-y-1.5 mt-2">
                              {group.resources.map((r) => {
                                const viaRole = roleCan(u.role, r);
                                const checked = editingAccess.includes(r);
                                return (
                                  <label key={r} className="flex items-center gap-2 text-sm text-ink cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => toggleAccess(r)}
                                      className="h-4 w-4 rounded border-line text-primary-600 focus-visible:ring-2 focus-visible:ring-primary-600"
                                    />
                                    <span className={viaRole && !checked ? 'line-through text-ink-soft' : ''}>
                                      {RESOURCE_LABELS[r]}
                                    </span>
                                    {viaRole && (
                                      <span className="text-xs italic text-ink-soft">{checked ? 'role' : 'revoked'}</span>
                                    )}
                                    {!viaRole && checked && (
                                      <span className="text-xs italic text-primary-700">granted</span>
                                    )}
                                  </label>
                                );
                              })}
                            </div>
                          </fieldset>
                        ))}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-5">
                        <p className="text-xs text-ink-soft mr-auto">
                          Changes reach their account within 15 minutes, or when they next open the site.
                        </p>
                        <button
                          onClick={closeEditors}
                          className={`px-3.5 py-1.5 text-sm font-semibold rounded-full text-ink-soft hover:text-ink ${focusRing}`}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleAccessSave(u)}
                          disabled={saving}
                          className={`px-3.5 py-1.5 text-sm font-semibold rounded-full bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-40 ${focusRing}`}
                        >
                          Save access
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
