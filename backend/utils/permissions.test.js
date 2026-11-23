/**
 * Tests for the permission map: role ranks plus individual grants.
 */
import {
  PERMISSIONS,
  GRANTABLE,
  UPLOAD_RESOURCES,
  can,
  canAny,
  hasAdminAccess,
  canGrantRole,
  normalizeAdjustments,
} from './permissions.js';

describe('role-based access', () => {
  test('editor manages everyday content but not pastoral content', () => {
    const editor = { role: 'editor' };
    expect(can(editor, 'Events')).toBe(true);
    expect(can(editor, 'Sermons')).toBe(false);
  });

  test('parish-priest equals admin', () => {
    for (const resource of Object.keys(PERMISSIONS)) {
      expect(can({ role: 'parish-priest' }, resource)).toBe(can({ role: 'admin' }, resource));
    }
  });

  test('unknown resource is never allowed', () => {
    expect(can({ role: 'admin' }, 'Nope')).toBe(false);
  });
});

describe('individual grants', () => {
  const grantee = { role: 'parishioner', permissions: ['Prayers', 'Events'] };

  test('a parishioner can manage only what was granted', () => {
    expect(can(grantee, 'Prayers')).toBe(true);
    expect(can(grantee, 'Events')).toBe(true);
    expect(can(grantee, 'Sermons')).toBe(false);
    expect(can(grantee, 'Users')).toBe(false);
  });

  test('grants never reduce what a role allows', () => {
    const priest = { role: 'priest', permissions: ['Donations'] };
    expect(can(priest, 'Sermons')).toBe(true);
    expect(can(priest, 'Donations')).toBe(true);
  });

  test('access management is never grantable', () => {
    expect(GRANTABLE).not.toContain('Users');
  });

  test('a grant on an image resource allows uploading', () => {
    expect(canAny(grantee, UPLOAD_RESOURCES)).toBe(true);
    expect(canAny({ role: 'parishioner', permissions: ['Prayers'] }, UPLOAD_RESOURCES)).toBe(false);
  });

  test('any grant opens the admin area', () => {
    expect(hasAdminAccess(grantee)).toBe(true);
    expect(hasAdminAccess({ role: 'parishioner', permissions: [] })).toBe(false);
    expect(hasAdminAccess({ role: 'editor' })).toBe(true);
  });
});

describe('revocations', () => {
  test('take away an area the role gives, and nothing else', () => {
    const editor = { role: 'editor', permissions: ['Sermons'], revokedPermissions: ['Gallery'] };
    expect(can(editor, 'Gallery')).toBe(false);
    expect(can(editor, 'Events')).toBe(true);
    expect(can(editor, 'Sermons')).toBe(true);
  });

  test('never apply to admin or parish-priest', () => {
    expect(can({ role: 'parish-priest', revokedPermissions: ['Donations'] }, 'Donations')).toBe(true);
  });

  test('revoking every image area also removes uploads', () => {
    const editor = { role: 'editor', revokedPermissions: ['Announcements', 'Events', 'Gallery'] };
    expect(canAny(editor, UPLOAD_RESOURCES)).toBe(false);
  });

  test('revoking everything closes the admin area', () => {
    const editor = { role: 'editor', revokedPermissions: GRANTABLE.filter((r) => PERMISSIONS[r] === 'editor') };
    expect(hasAdminAccess(editor)).toBe(false);
  });

  test('normalizing drops adjustments that mean nothing for the role', () => {
    expect(normalizeAdjustments('editor', ['Events', 'Prayers', 'Prayers'], ['Gallery', 'Sermons'])).toEqual({
      permissions: ['Prayers'],
      revokedPermissions: ['Gallery'],
    });
    expect(normalizeAdjustments('admin', ['Prayers'], ['Gallery'])).toEqual({ permissions: [], revokedPermissions: [] });
  });
});

describe('granting roles', () => {
  test('only at or below your own rank', () => {
    expect(canGrantRole('parish-priest', 'admin')).toBe(true);
    expect(canGrantRole('priest', 'admin')).toBe(false);
    expect(canGrantRole('admin', 'bogus')).toBe(false);
  });
});
