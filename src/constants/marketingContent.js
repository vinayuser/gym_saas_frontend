/**
 * Marketing copy aligned with the Gym SaaS / FitSphere Pro product.
 * Features and roles match ownerNavigation, App routes, and README.
 */

export const PRODUCT_NAME = 'FitSphere Pro';
export const PRODUCT_TAGLINE = 'One place to run your gym, your members, and every branch';

export const MARKETING_STATS = [
  { value: '₹1,999', label: 'First gym', sub: 'Your monthly starting price' },
  { value: '₹999', label: 'Each extra gym', sub: 'Add a branch whenever you need it' },
  { value: 'Optional', label: 'Extra tools', sub: 'Turn on attendance, store, or day passes' },
  { value: 'Your price', label: 'Day visits', sub: 'Set what a guest pays to train for one day' },
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
    text: 'Promotional banners with photos and video for your members.',
  },
  {
    icon: 'forum',
    title: 'Community chat',
    text: 'In-app community channel for member engagement (owner portal).',
  },
];

export const SUPER_ADMIN_FEATURES = [
  { icon: 'mail', title: 'Invite an owner', text: 'Send a private link so a gym can join FitSphere Pro.' },
  { icon: 'group', title: 'Your gyms', text: 'See every gym on the platform and how their plan is set up.' },
  { icon: 'dashboard', title: 'Platform overview', text: 'A simple view of owners, payments, and support.' },
];

export const OWNER_ONBOARDING_STEPS = [
  {
    step: '1',
    title: 'Receive invite',
    text: 'We send you a private link to set up your first gym.',
  },
  {
    step: '2',
    title: 'Tell us about your gym',
    text: 'Add your password, gym details, logo, and photos.',
  },
  {
    step: '3',
    title: 'Pay the first month',
    text: 'Pay securely for your first gym. Extra branches and tools can be added later.',
  },
  {
    step: '4',
    title: 'Open your gym',
    text: 'Sign in and start adding members, staff, classes, and daily check-ins.',
  },
];

export const PLATFORM_ROLES = [
  {
    role: 'Super Admin',
    icon: 'admin_panel_settings',
    desc: 'Our team invites gym owners and looks after the platform.',
  },
  {
    role: 'Gym Owner',
    icon: 'storefront',
    desc: 'You run your gyms: members, money, staff, and settings.',
  },
  {
    role: 'Manager',
    icon: 'manage_accounts',
    desc: 'Day-to-day operations: members, attendance, leads, and staff coordination.',
  },
  {
    role: 'Receptionist',
    icon: 'support_agent',
    desc: 'Front desk: check-ins, member lookup, and enquiries.',
  },
  {
    role: 'Trainer',
    icon: 'sports_gymnastics',
    desc: 'Member and session support within assigned gym scope.',
  },
  {
    role: 'Member',
    icon: 'groups',
    desc: 'Gym members with portal access for store, profile, and check-in QR.',
  },
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
    q: 'How do I start with FitSphere Pro?',
    a: 'Ask us for an invite. You open the link, add your gym details, and pay the first month for your first gym. Then you can sign in and start running the gym.',
  },
  {
    q: 'How is the monthly price worked out?',
    a: 'Your first gym is a fixed monthly price. Every extra gym you add costs less per month. Attendance, the member store, and day passes are optional and charged only for the gyms where you turn them on.',
  },
  {
    q: 'Are prices in rupees?',
    a: 'Yes. Every price on this site and in your owner account is in Indian rupees per month.',
  },
  {
    q: 'Can I add another gym later?',
    a: 'Yes. Add a branch from your account. It is billed as an extra gym each month. You do not need to switch to a bigger package.',
  },
];

export const CONTACT_CHANNELS = [
  { icon: 'mail', label: 'Sales & demos', value: 'sales@gymsaas.com', sub: 'New gym owners & partnerships' },
  { icon: 'support_agent', label: 'Support', value: 'support@gymsaas.com', sub: 'Existing owner accounts' },
  { icon: 'admin_panel_settings', label: 'Hello from the team', value: 'hello@fitspherepro.com', sub: 'New gyms and partnerships' },
  { icon: 'schedule', label: 'Response', value: '1–2 business days', sub: 'Via contact form or email' },
];

export const FAQ_POPULAR_TOPICS = [
  'Getting started',
  'Monthly price',
  'Extra gyms',
  'Check-in',
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
        a: 'FitSphere Pro is the app gym owners use to run members, staff, classes, payments, and more than one branch from a single login.',
      },
      {
        q: 'Who uses the platform?',
        a: 'Gym owners and their team use it every day. Our team helps new gyms join and looks after the platform.',
      },
      {
        q: 'How do I become a gym owner on the platform?',
        a: 'Request an invite from us. After you finish setup and pay for your first gym, you can sign in and start operating.',
      },
    ],
  },
  {
    id: 'technical',
    label: 'Privacy',
    items: [
      {
        q: 'How is my gym data kept separate from others?',
        a: 'Your members, payments, and staff stay with your gym. Another gym on FitSphere Pro cannot open your records.',
      },
      {
        q: 'How do I sign in?',
        a: 'Owners and staff use the sign-in page. We keep you signed in on that device until you log out.',
      },
      {
        q: 'Where do my photos go?',
        a: 'Logos, banners, and product photos are stored securely and shown only inside your gym.',
      },
    ],
    highlights: [
      {
        icon: 'cloud_upload',
        title: 'Your photos stay with your gym',
        text: 'Logos, banners, and product pictures are stored for your gym and shown in the app.',
      },
      {
        icon: 'lock',
        title: 'The right people see the right screens',
        text: 'Owners, managers, front desk, and trainers only open what their role needs.',
      },
    ],
  },
  {
    id: 'account',
    label: 'Account & gyms',
    items: [
      {
        q: 'Can I run more than one gym location?',
        a: 'Yes. Add another branch from your account. Each extra gym is billed every month on top of your first gym.',
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
        a: 'Your first gym has a monthly price. Each extra gym adds a smaller monthly amount. Attendance, the member store, and day passes are optional extras, billed only for the gyms where you switch them on. What members pay you for memberships is separate and sits in your finances.',
      },
      {
        q: 'When do I pay?',
        a: 'You pay for the first gym when you accept your invite. After that, your monthly bill follows the gyms you run and the extras you turn on. You can see the breakdown under Subscription after you sign in.',
      },
      {
        q: 'Where do I see my bill?',
        a: 'After you sign in, open Subscription in the menu. It lists your gyms, optional tools, and the monthly total in rupees.',
      },
    ],
  },
];

export const ABOUT_VALUES = [
  {
    icon: 'apartment',
    title: 'Your gym stays yours',
    text: 'Members, payments, and staff records belong to your gym. Other gyms on FitSphere Pro cannot see them.',
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
    text: 'We invite your gym, you complete setup, and you pay the first month before the account opens.',
  },
];

export const PRIVACY_SECTIONS = [
  {
    id: 'introduction',
    title: '1. Introduction',
    content: `This privacy policy explains how ${PRODUCT_NAME} looks after information when you use the website and the gym owner app.`,
  },
  {
    id: 'data-collection',
    title: '2. Data we collect',
    content: 'Depending on your role, we process:',
    bullets: [
      'Account data: name, email, phone, and role (super admin, gym owner, staff).',
      'Gym data: business profile, branches, operating hours, GST, and media you upload.',
      'Member data: profiles, memberships, attendance, and enquiry records you enter.',
      'Payment references for your monthly plan (we never store full card numbers).',
      'Technical logs: IP address, browser type, and API usage for security and debugging.',
    ],
    image: MARKETING_IMAGES.privacyData,
  },
  {
    id: 'security',
    title: '3. Security',
    content: 'We protect sign-in, keep passwords private, and keep each gym’s records separate.',
    cards: [
      { title: 'Your gym only', text: 'Another gym cannot open your members or your money.' },
      { title: 'Photos', text: 'Logos and product pictures are stored for your gym and shown in the app.' },
    ],
  },
  {
    id: 'cookies',
    title: '4. Cookies & local storage',
    content: 'We store auth tokens locally so you stay signed in. These are required to use the dashboard.',
    bullets: [
      'A sign-in session so you stay logged in.',
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
      'We provide software for gym owners: members, staff, membership plans, check-in, classes, enquiries, a shop, finances, banners, and community chat. You use it in a web browser.',
  },
  {
    id: 'accounts',
    title: '3. Accounts',
    content:
      'Gym owner accounts are created through an approved invite flow. You must keep credentials secure. You are responsible for actions taken under your account and for staff you authorize.',
  },
  {
    id: 'billing',
    title: '4. Monthly plan',
    content:
      'Your first gym has a monthly price. Each extra gym and each optional tool (attendance, member store, day passes) is added only when you use it. You pay securely when you join. Refunds follow the law and our billing policy.',
  },
  {
    id: 'content',
    title: '5. Your content',
    content:
      'You own your member lists, photos, and business details. You allow us to host them so we can run the service for your gym.',
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
