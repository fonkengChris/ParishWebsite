import type { User } from '../types';

// Mirror of backend/utils/permissions.js — keep the two in sync.
// The backend is what actually enforces these; here they only decide what the UI shows.

export type Role = User['role'];

// Higher rank inherits everything a lower rank can do. Parish-priest is equal to admin.
export const ROLE_RANK: Record<Role, number> = {
  parishioner: 0,
  editor: 1,
  priest: 2,
  'parish-priest': 3,
  admin: 3,
};

// Resource → lowest role allowed to manage it.
export const PERMISSIONS = {
  // Editor: everyday parish content
  Announcements: 'editor',
  Events: 'editor',
  MassSchedule: 'editor',
  Apostolates: 'editor',
  ParishServices: 'editor',
  MissionStations: 'editor',
  Gallery: 'editor',

  // Priest: pastoral and liturgical content
  Prayers: 'priest',
  Sermons: 'priest',
  Sacraments: 'priest',
  LiturgicalColors: 'priest',

  // Admin / parish-priest: people, money, messaging and the parish's identity
  Donations: 'admin',
  Notifications: 'admin',
  Parishioners: 'admin',
  Users: 'admin',
  ParishConfig: 'admin',
  SiteContent: 'admin',
} as const satisfies Record<string, Role>;

export type Resource = keyof typeof PERMISSIONS;

// Resources an admin/parish-priest may adjust per user: grant on top of the role, or revoke
// from it. Users stays role-only so nobody below admin rank can ever hand out access.
export const GRANTABLE = (Object.keys(PERMISSIONS) as Resource[]).filter((r) => r !== 'Users');

type MaybeUser = Pick<User, 'role' | 'permissions' | 'revokedPermissions'> | null | undefined;

const rankOf = (role: string | undefined): number =>
  role && role in ROLE_RANK ? ROLE_RANK[role as Role] : -1;

// Admin and parish-priest always have everything; per-user adjustments never apply to them.
export const isTopRank = (role: string | undefined): boolean => rankOf(role) >= ROLE_RANK.admin;

// Whether the role alone covers a resource (before any per-user adjustment).
export const roleCan = (role: string | undefined, resource: Resource): boolean =>
  rankOf(role) >= rankOf(PERMISSIONS[resource]);

// Access = (role OR individual grant) AND NOT individually revoked.
export const can = (user: MaybeUser, resource: Resource): boolean => {
  if (!user) return false;
  if (isTopRank(user.role)) return true;
  if ((user.revokedPermissions ?? []).includes(resource)) return false;
  return roleCan(user.role, resource) || (user.permissions ?? []).includes(resource);
};

// Anyone who can manage something gets the admin area.
export const hasAdminAccess = (user: MaybeUser): boolean => GRANTABLE.some((r) => can(user, r));

// A user may only hand out roles at or below their own rank.
export const canGrantRole = (user: MaybeUser, role: Role): boolean =>
  rankOf(user?.role) >= rankOf(role);
