import { describe, expect, it } from 'vitest';
import {
  getLoginPathForRoute,
  getRequiredRolesForPath,
  isPublicPath,
  roleAllowedForPath,
} from './routeGuard';
import { ROLES } from './roles';

describe('routeGuard', () => {
  it('treats customer-facing pages as public', () => {
    expect(isPublicPath('/')).toBe(true);
    expect(isPublicPath('/menu')).toBe(true);
    expect(isPublicPath('/cart')).toBe(true);
    expect(isPublicPath('/login')).toBe(true);
    expect(isPublicPath('/track-order/abc123')).toBe(true);
  });

  it('requires roles for protected areas', () => {
    expect(getRequiredRolesForPath('/admin/dashboard')).toEqual([ROLES.ADMIN]);
    expect(getRequiredRolesForPath('/platform/users')).toEqual([ROLES.PLATFORM]);
    expect(getRequiredRolesForPath('/delivery/dashboard')).toEqual([ROLES.DRIVER]);
    expect(getRequiredRolesForPath('/customer/orders')).toEqual([ROLES.CUSTOMER]);
    expect(getRequiredRolesForPath('/checkout')).toEqual([ROLES.CUSTOMER]);
  });

  it('routes admin paths to admin login', () => {
    expect(getLoginPathForRoute('/admin/orders')).toBe('/login');
    expect(getLoginPathForRoute('/customer/profile')).toBe('/login');
  });

  it('enforces role matching for protected paths', () => {
    expect(roleAllowedForPath('/admin/menu', ROLES.ADMIN)).toBe(true);
    expect(roleAllowedForPath('/admin/menu', ROLES.CUSTOMER)).toBe(false);
    expect(roleAllowedForPath('/menu', ROLES.CUSTOMER)).toBe(true);
  });
});
