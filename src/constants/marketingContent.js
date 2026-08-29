/**
 * Marketing copy aligned with the Gym SaaS / FitSphere Pro product.
 * Features and roles match ownerNavigation, App routes, and README.
 */

export const PRODUCT_NAME = 'FitSphere Pro';
export const PRODUCT_TAGLINE = 'Multi-tenant gym management SaaS for owners and chains';

export const MARKETING_STATS = [
  { value: 'Multi-tenant', label: 'SaaS platform', sub: 'Isolated data per gym business' },
  { value: '4', label: 'Owner plan tiers', sub: '1, 2, 5, or unlimited gym locations' },
  { value: '6', label: 'User roles', sub: 'Super admin through trainer & member' },
  { value: 'Razorpay', label: 'Invite checkout', sub: 'Owners pay & get provisioned automatically' },
];

/** Grouped capabilities — mirrors owner portal modules */
export const HOME_PLATFORM_MODULES = [
  {
    icon: 'group',
    title: 'Members',
    text: 'Add members, assign membership plans, track status, and generate QR codes for check-in.',
  },
  {
    icon: 'card_membership',
    title: 'Membership plans',
    text: 'Create gym-specific plans and connect them to member subscriptions and renewals.',
  },
  {
    icon: 'qr_code_scanner',
    title: 'Attendance',
    text: 'Record check-ins with QR scanning and view attendance on your owner dashboard heatmap.',
  },
  {
    icon: 'badge',
    title: 'Staff & trainers',
    text: 'Manage front desk, managers, trainers, and role-based access for your team.',
  },
  {
    icon: 'filter_alt',
    title: 'Leads & events',
    text: 'Pipeline enquiries from first contact to trial, plus scheduled gym events and classes.',
  },
  {
    icon: 'payments',
    title: 'Finances',
    text: 'Overview, payment ledger, expenses, general ledger, and reports for each gym.',
  },
  {
    icon: 'inventory_2',
    title: 'Inventory & store',
    text: 'Product catalog, stock, and member store for supplements and retail items.',
  },
  {
    icon: 'view_carousel',
    title: 'Banners & media',
    text: 'Promotional banners with images and video uploaded via Cloudinary.',
  },
  {
    icon: 'forum',
    title: 'Community chat',
    text: 'In-app community channel for member engagement (owner portal).',
  },
];

export const SUPER_ADMIN_FEATURES = [
  { icon: 'mail', title: 'Gym owner invites', text: 'Create invite links with plan, email, and expiry.' },
  { icon: 'group', title: 'Gym owners list', text: 'View all onboarded tenants and their subscription status.' },
  { icon: 'dashboard', title: 'Platform dashboard', text: 'Super admin overview of the SaaS network.' },
];

export const OWNER_ONBOARDING_STEPS = [
  {
    step: '1',
    title: 'Receive invite',
    text: 'Super admin sends you a secure link with your plan (Single, 2, 5, or Unlimited gyms).',
  },
  {
    step: '2',
    title: 'Complete profile',
    text: 'Set password, business details, logo, and gym media during the setup wizard.',
  },
  {
    step: '3',
    title: 'Pay with Razorpay',
    text: 'First-month SaaS fee is collected via Razorpay before your tenant is activated.',
  },
  {
    step: '4',
    title: 'Run your gym',
    text: 'Sign in to the owner portal—add members, staff, plans, and start daily operations.',
  },
];

export const PLATFORM_ROLES = [
  { role: 'Super Admin', desc: 'Platform operator: invites gym owners, assigns plans, lists tenants.' },
  { role: 'Gym Owner', desc: 'Full access to their tenant: gyms, members, finances, and settings.' },
  { role: 'Manager', desc: 'Day-to-day operations: members, attendance, leads, and staff coordination.' },
  { role: 'Receptionist', desc: 'Front desk: check-ins, member lookup, and enquiries.' },
  { role: 'Trainer', desc: 'Member and session support within assigned gym scope.' },
];

export const PRICING_COMPARE_ROWS = [
  { feature: 'Gym locations included', values: ['1', '2', '5', 'Unlimited'] },
  { feature: 'Members & QR check-in', values: [true, true, true, true] },
  { feature: 'Staff & trainers', values: [true, true, true, true] },
  { feature: 'Membership plans', values: [true, true, true, true] },
  { feature: 'Attendance & dashboard', values: [true, true, true, true] },
  { feature: 'Events & lead pipeline', values: [true, true, true, true] },
  { feature: 'Inventory & member store', values: [true, true, true, true] },
  { feature: 'Finance module', values: [true, true, true, true] },
  { feature: 'Banners (Cloudinary)', values: [true, true, true, true] },
  { feature: 'Community chat', values: [true, true, true, true] },
];

export const PRICING_FAQ = [
  {
    q: 'How does gym owner onboarding work?',
    a: 'A super admin creates an invite with the owner email and subscription plan. The owner opens the link, completes setup, pays the first month through Razorpay, and receives a gym owner account with tenant and gym records.',
  },
  {
    q: 'What limits apply to each plan?',
    a: 'Plans cap how many gym locations you can create under one tenant: 1, 2, 5, or unlimited. All other owner features are included; only the branch count changes.',
  },
  {
    q: 'Are prices in INR?',
    a: 'Yes. Plan prices shown on this page match the SaaS subscription amounts used during invite checkout (monthly and yearly options).',
  },
  {
    q: 'Can I add more gyms later?',
    a: 'You need a plan that supports your target branch count. Contact your platform admin to upgrade from Single to multi-gym or Unlimited.',
  },
];

export const CONTACT_CHANNELS = [
  { icon: 'mail', label: 'Sales & demos', value: 'sales@gymsaas.com', sub: 'New gym owners & partnerships' },
  { icon: 'support_agent', label: 'Support', value: 'support@gymsaas.com', sub: 'Existing owner accounts' },
  { icon: 'admin_panel_settings', label: 'Platform admin', value: 'superadmin@gymsaas.com', sub: 'Demo super admin (see docs)' },
  { icon: 'schedule', label: 'Response', value: '1–2 business days', sub: 'Via contact form or email' },
];

export const FAQ_POPULAR_TOPICS = [
  'Owner invite',
  'Razorpay payment',
  'Multi-gym plan',
  'QR attendance',
  'Staff roles',
];

export const MARKETING_NAV = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Pricing', path: '/pricing' },
  { label: 'FAQ', path: '/faq' },
  { label: 'Contact', path: '/contact' },
];

export const MARKETING_IMAGES = {
  hero:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDN_DfZMp4oOeHI0xzGO5YGk1gZKoYPNU1rgqGGERN-AW9n9iSBH6NTnYMTvjxK-pR0cNYyj0TObIOU6JrJXwnHzOsMOELKsxQ3KpiO5CcQfAYausBf8nSD3nTY4xnBeruCkhduA1rD4kX4mIaudCqR4WNw9fODFSdvl_LHjRJOPSJT4jflOTVlY6GouOKfQTr0rAzvkuoI2Cr7dJPnjBYdyBz95X0371cyE8mMZre9oxqsKBiEiz7PaWxRuHsIbROnBqnV2Sd4BZE',
  aboutHero:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCeTQD3K-tlatE9lyCbr1dbQHeIZPIwpDEqu9pgNHVIyR9bYqOq5oUpYFSpQ1Q3gsZvbimcesLrfJGbsRtYMe2aEAkgajYrahIgN2jn9rqnLGMGcetAzmr4KAqDQ017DeX7nG3_S4l-nXEB10WbsEXPgJh8diRtSzZLmi-2T-_u-qXmEeKULtGYZVqN5_t79qnXNT0bYGPzWuIfStHyb3elT1FQ3qPTtmbhfazv37b5jTNh2ENH3eWtkhuU_tjXKcyjFF-ENmIlxv4',
  aboutMission:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBo5VRrp8GEk1f-cvE_nhadyMWUAoPanh_7qIy6wt1fvFVbh6xPPI71UOJRz-Uh73ymvu0xhAcBaOx1VD8JqmZDP8UHjGurky3THt5xyWBA0snz92lyYdTwG7fxd0GROfyynua0Gf0llYcKYB9VCTjd3VY60Gxe9kW_tFFqDG9MXj3ytPYhP0OGBcDaOif0AksajeFqn-lquPn5VRCaHupVb4Vydx6WoZm-H66S6DCAsD3-EmhgjtLBfMsECFoLBkQvE5cgqNZzwqA',
  retail:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCQe-RVxMh7jYfCIgUgAcjza3rMbGvh9K8sTYgvGiqZlfc1uHdR_gv-4cCYqOCyDYg4zQ519NB43-XT_yTxFlJ8NEwxeeHxIHnewTTcnzsMCWUR0rgKSCuoU3x4nOJgIt9CLytTHe7LqJG72dyfu-sLpJt7Ny85MI1ZJBHfP7YMMd5XgmKgOGOSr4I0AQzgVOqPoMDKnfFHg3aIc2EYS16oeoG1IV5orl1IfFe851EQ32efD9_SFdLMlS9YF3xfk8Pk0jGybG4dSXQ',
  contactMap:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCkSfk1oenSf-Qr_Yoy28fn2bQX25riaWWY6UqvxwJ9CWfX_Mvikxftg_GAIuKhW5wNrfprVJHy_bel3kOKnIFof6SDi496_R2AbfIHnRF35KL7bu-iqMOZcp4nOSw1OdUJtoM7MhgSejde40lvanUHycTWNLbKmfDdr2h7OCcMzIuRKNB_dvDpSHxLhtMjlt8nbLIMFEyxpZiKpfRgKkY8ZkOGVloCgIBR7SyFhiRY0dCGYumql-JvNetz9SXobneg-4NN03SSRSM',
  faqCta:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuATsht7qBAbeXjXbdb8uF4v3fizHXuZ2FsRXWbEvoCD3J1gFwg3Io1_iAxQ-aADP10-Sx1RYTfZRIK2CdfIdTjZ5NGU17PhtILEBR8Ej9_eDHaY7BvriqH9jiJT3sFHJpZe3SVTEreaFj0eCKVOrDYSmIhzMZc5g5I-HAQ0B6dwW71YOFH4ctx75c_H8QfZoFLIb6Z9X4kit6OTlnI11t0yyups7dWqzKf_v5mD9ojmsXAqPv4cbH52E9tiWWKWovpcge4Ue4kPRhc',
  privacyData:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBWylDRDNgMmojamy-sQYYi-cerp8NTOz3TySVP_SqktMFjHJs1FJOiAe4JwU0oKyYdxP43rOn_8ngBWbpckGB2kgzhlFW-hpmRONncg64DYbmwu2E28bOE-ogrEbQ93h6xYamgS3qrLS78LmwLGUGhAyhXNpaqkF56zWQ2dpDCb_LKlSTeESxxAa1CHWKu7r5hBpvaz32pWknIS8nYNWcrMNKMAYHDOafSlYH68PCrH9arBRIn8j9KUN8jRcjM5npOB6pQyuBvQGE',
};

export const FAQ_CATEGORIES = [
  {
    id: 'general',
    label: 'General',
    items: [
      {
        q: 'What is FitSphere Pro?',
        a: 'FitSphere Pro is the customer-facing brand of our Gym SaaS platform—a multi-tenant system for running gym businesses. Gym owners manage members, staff, attendance, finances, inventory, events, and leads from one web dashboard.',
      },
      {
        q: 'Who uses the platform?',
        a: 'Super admins operate the SaaS (invites and gym owner list). Gym owners and their staff (managers, receptionists, trainers) run day-to-day operations per location.',
      },
      {
        q: 'How do I become a gym owner on the platform?',
        a: 'You must receive an invite from the platform super admin. You cannot self-register as an owner without that invite link and successful Razorpay payment for your assigned plan.',
      },
    ],
  },
  {
    id: 'technical',
    label: 'Technical',
    items: [
      {
        q: 'How is my gym data kept separate from others?',
        a: 'Each gym business is a tenant. API requests are scoped by tenant and gym so one owner cannot access another tenant’s members or financial records.',
      },
      {
        q: 'How does authentication work?',
        a: 'The app uses JWT access tokens with refresh tokens. Owners and staff sign in at /auth/login; sessions are restored on return visits.',
      },
      {
        q: 'Where are uploaded images stored?',
        a: 'Logos, banner images, product photos, and invite-setup media are uploaded to Cloudinary via the /api/v1/media endpoints.',
      },
    ],
    highlights: [
      {
        icon: 'cloud_upload',
        title: 'Cloudinary uploads',
        text: 'Gym logos, banners, and product images use Cloudinary with a configurable folder per environment.',
      },
      {
        icon: 'lock',
        title: 'Role-based access',
        text: 'Routes in the owner portal check roles (owner, manager, receptionist, trainer) before showing sensitive screens.',
      },
    ],
  },
  {
    id: 'account',
    label: 'Account & gyms',
    items: [
      {
        q: 'Can I run more than one gym location?',
        a: 'Yes, if your SaaS plan allows it (2, 5, or unlimited gyms). Use Gyms & Branches in the owner portal to add locations up to your plan limit.',
      },
      {
        q: 'What staff roles exist?',
        a: 'Gym owner, manager, receptionist, and trainer—each with access appropriate to operations. Super admin is separate and used only for platform management.',
      },
      {
        q: 'How do member QR codes work?',
        a: 'Members can be issued QR codes for attendance check-in. Attendance is recorded per gym and visible on the owner dashboard and attendance screens.',
      },
    ],
  },
  {
    id: 'billing',
    label: 'Billing',
    items: [
      {
        q: 'What am I paying for as a gym owner?',
        a: 'You pay a monthly (or yearly) SaaS subscription based on your plan tier—how many gym locations you may operate. Member gym fees inside the app are separate and managed in your Finance module.',
      },
      {
        q: 'How does Razorpay fit in?',
        a: 'When you accept a super admin invite, you pay the first SaaS period through Razorpay. After verification, your user, tenant, subscription, and initial gym are created automatically.',
      },
      {
        q: 'Where do I see my SaaS subscription?',
        a: 'Logged-in gym owners can open Subscription in the sidebar to view their platform plan and status.',
      },
    ],
  },
];

export const ABOUT_VALUES = [
  {
    icon: 'apartment',
    title: 'Multi-tenant by design',
    text: 'One installation serves many gym businesses with strict tenant boundaries—built for SaaS operators and chains.',
  },
  {
    icon: 'dashboard',
    title: 'Owner-first dashboard',
    text: 'Active members, today’s check-ins, monthly revenue, attendance heatmap, and expiring memberships on login.',
  },
  {
    icon: 'hub',
    title: 'Operations in one place',
    text: 'Members, plans, staff, finances, inventory, events, leads, and banners—no switching between disconnected tools.',
  },
  {
    icon: 'verified_user',
    title: 'Controlled onboarding',
    text: 'Super admin invites and Razorpay verification ensure only paying, approved owners receive a tenant.',
  },
];

export const PRIVACY_SECTIONS = [
  {
    id: 'introduction',
    title: '1. Introduction',
    content: `This Privacy Policy explains how ${PRODUCT_NAME} (Gym SaaS) collects and uses information when you use our web application, owner portal, and super admin tools.`,
  },
  {
    id: 'data-collection',
    title: '2. Data we collect',
    content: 'Depending on your role, we process:',
    bullets: [
      'Account data: name, email, phone, and role (super admin, gym owner, staff).',
      'Gym data: business profile, branches, operating hours, GST, and media you upload.',
      'Member data: profiles, memberships, attendance, and enquiry records you enter.',
      'Payment metadata: Razorpay transaction references for SaaS subscription activation (not full card numbers).',
      'Technical logs: IP address, browser type, and API usage for security and debugging.',
    ],
    image: MARKETING_IMAGES.privacyData,
  },
  {
    id: 'security',
    title: '3. Security',
    content: 'We use HTTPS, hashed passwords, JWT-based sessions, and tenant-scoped database access.',
    cards: [
      { title: 'Tenant isolation', text: 'Gym owner data is tied to a tenant ID; middleware enforces scope on API routes.' },
      { title: 'Media storage', text: 'Uploaded files are stored in Cloudinary; URLs are saved on gym and product records.' },
    ],
  },
  {
    id: 'cookies',
    title: '4. Cookies & local storage',
    content: 'We store auth tokens locally so you stay signed in. These are required to use the dashboard.',
    bullets: [
      'Access and refresh tokens for the Gym SaaS API.',
      'Theme and UI preferences where applicable.',
    ],
  },
  {
    id: 'rights',
    title: '5. Your rights',
    content:
      'You may request access, correction, or deletion of personal data by contacting support@gymsaas.com. Gym owners are responsible for member data they collect under applicable local laws.',
  },
  {
    id: 'retention',
    title: '6. Retention',
    content:
      'Data is retained while your subscription is active. After account closure, data may be deleted or anonymized per our agreement and legal requirements.',
  },
];

export const TERMS_SECTIONS = [
  {
    id: 'acceptance',
    title: '1. Acceptance',
    content: `By using ${PRODUCT_NAME}, signing in, or completing owner invite setup, you agree to these Terms and our Privacy Policy.`,
  },
  {
    id: 'service',
    title: '2. Service description',
    content:
      'We provide multi-tenant gym management software: member and staff management, membership plans, QR attendance, events, enquiries (leads), inventory, member store, finance tools, banners, community chat, and super admin invite management. Features are delivered via web dashboard; availability may evolve with releases.',
  },
  {
    id: 'accounts',
    title: '3. Accounts',
    content:
      'Gym owner accounts are created through an approved invite flow. You must keep credentials secure. You are responsible for actions taken under your account and for staff you authorize.',
  },
  {
    id: 'billing',
    title: '4. SaaS subscription & Razorpay',
    content:
      'Platform fees depend on your plan (number of gyms allowed). Invite onboarding requires payment through Razorpay before tenant activation. Refunds follow applicable law and our billing policy.',
  },
  {
    id: 'content',
    title: '5. Your content',
    content:
      'You own member lists, images, and business data you upload. You grant us permission to host and process that data solely to provide the service (including Cloudinary for media).',
  },
  {
    id: 'liability',
    title: '6. Limitation of liability',
    content:
      'The platform is provided as available. We are not liable for indirect damages, lost profits, or issues arising from third-party services (e.g. payment providers).',
  },
  {
    id: 'termination',
    title: '7. Termination',
    content:
      'We may suspend access for breach of terms or non-payment. You may stop using the service; data handling after termination is described in the Privacy Policy.',
  },
  {
    id: 'contact',
    title: '8. Contact',
    content: 'Legal or billing questions: support@gymsaas.com',
  },
];
