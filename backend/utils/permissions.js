// Single source of truth for who may manage what.
// Mirrored in frontend/src/utils/permissions.ts — keep the two in sync.

// Higher rank inherits everything a lower rank can do. Parish-priest is equal to admin.
export const ROLE_RANK = {
  parishioner: 0,
  editor: 1,
  priest: 2,
  'parish-priest': 3,
  admin: 3,
};

export const ROLES = Object.keys(ROLE_RANK);

// Resource → lowest role allowed to manage it (create/update/delete and admin listings).
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
};

// Resources an admin/parish-priest may adjust per user: grant on top of the role, or revoke
// from it. Users stays role-only so nobody below admin rank can ever hand out access.
export const GRANTABLE = Object.keys(PERMISSIONS).filter((r) => r !== 'Users');

// Resources whose admin pages upload images — managing any of them allows uploading.
export const UPLOAD_RESOURCES = ['Announcements', 'Events', 'Gallery', 'Sermons', 'ParishConfig', 'SiteContent'];

const rankOf = (role) => ROLE_RANK[role] ?? -1;

// Admin and parish-priest always have everything; per-user adjustments never apply to them.
export const isTopRank = (role) => rankOf(role) >= ROLE_RANK.admin;

export const roleCan = (role, resource) => {
  const minRole = PERMISSIONS[resource];
  return minRole !== undefined && rankOf(role) >= rankOf(minRole);
};

// `user` is anything with { role, permissions, revokedPermissions } — a User document or a
// decoded token. Access = (role OR individual grant) AND NOT individually revoked.
export const can = (user, resource) => {
  if (!user || PERMISSIONS[resource] === undefined) return false;
  if (isTopRank(user.role)) return true;
  if ((user.revokedPermissions ?? []).includes(resource)) return false;
  return roleCan(user.role, resource) || (user.permissions ?? []).includes(resource);
};

export const canAny = (user, resources) => resources.some((resource) => can(user, resource));

// Anyone above parishioner by role.
export const isStaff = (role) => rankOf(role) > ROLE_RANK.parishioner;

// Anyone who can manage something — gets the admin area and the stronger password rules.
export const hasAdminAccess = (user) => canAny(user, GRANTABLE);

// Drops adjustments that no longer mean anything for `role`: grants the role already covers,
// revocations of areas the role doesn't give. Top-rank roles keep none.
export const normalizeAdjustments = (role, permissions = [], revokedPermissions = []) => {
  if (isTopRank(role)) return { permissions: [], revokedPermissions: [] };
  return {
    permissions: [...new Set(permissions)].filter((r) => GRANTABLE.includes(r) && !roleCan(role, r)),
    revokedPermissions: [...new Set(revokedPermissions)].filter((r) => GRANTABLE.includes(r) && roleCan(role, r)),
  };
};

// A user may only hand out roles at or below their own rank.
export const canGrantRole = (grantorRole, role) =>
  role in ROLE_RANK && rankOf(grantorRole) >= rankOf(role);
