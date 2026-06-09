import { PlatformPageHeader } from '../../layouts/PlatformLayout';
import { ROLES, getRoleLabel } from '../../utils/roles';

const ROLE_POLICIES = [
  {
    role: ROLES.CUSTOMER,
    scope: 'Customer portal',
    permissions: ['Browse menu & cart', 'Place delivery/pickup orders', 'Track orders', 'Manage profile & loyalty'],
  },
  {
    role: ROLES.ADMIN,
    scope: 'Restaurant admin',
    permissions: ['Dashboard & analytics', 'Menu, orders, branches', 'Delivery partner management', 'Campaigns & reviews'],
  },
  {
    role: ROLES.DRIVER,
    scope: 'Delivery partner',
    permissions: ['View available deliveries', 'Accept & complete deliveries', 'Live location sharing', 'Navigation map'],
  },
  {
    role: ROLES.PLATFORM,
    scope: 'Super Admin (you)',
    permissions: ['Platform dashboard', 'Restaurant onboarding', 'User management', 'RBAC policy (this screen)'],
    highlight: true,
  },
];

const ACCESS_RULES = [
  'Super Admin accounts are hidden from the Users list and cannot be created from the platform UI.',
  'Each user session is validated on every route and API request.',
  'Role claims in tokens are always verified against the database role.',
  'Restaurant Admin and Delivery Partner accounts must be linked to a restaurant.',
  'Customers cannot access staff dashboards; staff cannot place customer orders.',
];

export default function PlatformRbacPage() {
  return (
    <div>
      <PlatformPageHeader title="RBAC" />

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        {ROLE_POLICIES.map((policy) => (
          <div
            key={policy.role}
            className={`card p-4 ${policy.highlight ? 'border-brand-200 bg-brand-50/40' : ''}`}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="font-semibold text-stone-900">{getRoleLabel(policy.role)}</h2>
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
                {policy.scope}
              </span>
            </div>
            <ul className="space-y-1.5 text-sm text-stone-700">
              {policy.permissions.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-brand-600">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="card p-4">
        <h2 className="mb-3 font-semibold text-stone-900">Access rules</h2>
        <ul className="space-y-2 text-sm text-stone-700">
          {ACCESS_RULES.map((rule) => (
            <li key={rule} className="flex gap-2">
              <span className="font-medium text-stone-400">—</span>
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
