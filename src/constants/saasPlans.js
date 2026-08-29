/** SaaS plans — mirrors backend SubscriptionPlanType. */
export const SAAS_PLANS = [
  {
    id: 'plan-single',
    type: 'SINGLE_GYM',
    name: 'Single Gym',
    gymLimit: 1,
    priceMonthly: 999,
    priceYearly: 9999,
    description: 'One gym location with the full owner portal.',
    features: [
      '1 gym location',
      'Members, plans & QR attendance',
      'Staff, trainers, events & leads',
      'Finances, inventory & store',
      'Banners & community chat',
    ],
  },
  {
    id: 'plan-two',
    type: 'TWO_GYMS',
    name: '2 Gyms',
    gymLimit: 2,
    priceMonthly: 1799,
    priceYearly: 17999,
    description: 'Two branches under one tenant and owner login.',
    features: [
      '2 gym locations',
      'Same features as Single Gym',
      'Switch branch from owner header',
      'Per-gym dashboard & finances',
    ],
  },
  {
    id: 'plan-five',
    type: 'FIVE_GYMS',
    name: '5 Gyms',
    gymLimit: 5,
    priceMonthly: 3999,
    priceYearly: 39999,
    description: 'Small chains up to five locations.',
    features: [
      'Up to 5 gym locations',
      'Centralized tenant billing',
      'All owner modules included',
      'Multi-branch operations',
    ],
  },
  {
    id: 'plan-unlimited',
    type: 'UNLIMITED',
    name: 'Unlimited',
    gymLimit: -1,
    priceMonthly: 7999,
    priceYearly: 79999,
    description: 'No cap on gym locations under one tenant.',
    features: [
      'Unlimited gym locations',
      'Full owner & finance suite',
      'For franchises and large operators',
      'Contact admin for custom terms',
    ],
  },
];

export const getPlanById = (id) => SAAS_PLANS.find((p) => p.id === id);
export const getPlanByType = (type) => SAAS_PLANS.find((p) => p.type === type);
