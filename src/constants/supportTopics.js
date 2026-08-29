export const SUPPORT_EMAIL = 'support@fitsphere.pro';

const messageTemplate = (lines) => lines.join('\n');

export const SUPPORT_CATEGORIES = [
  {
    value: 'GENERAL',
    label: 'General help',
    defaultSubject: 'General support request',
    defaultMessage: messageTemplate([
      'Hello FitSphere Pro support,',
      '',
      'I need help with the following:',
      '',
      '[Please describe your question or issue here]',
      '',
      'Thank you.',
    ]),
    description: 'Questions about using FitSphere Pro',
  },
  {
    value: 'BILLING_SUBSCRIPTION',
    label: 'Billing & subscription',
    defaultSubject: 'Billing or subscription inquiry',
    defaultMessage: messageTemplate([
      'Hello FitSphere Pro support,',
      '',
      'I have a question about billing or my subscription:',
      '',
      'Issue: [invoice, payment, renewal, etc.]',
      '',
      'Additional details:',
      '',
      'Thank you.',
    ]),
    description: 'Invoices, payments, or subscription status',
  },
  {
    value: 'PLAN_CHANGE',
    label: 'Change SaaS plan',
    defaultSubject: 'Plan change request',
    defaultMessage: messageTemplate([
      'Hello FitSphere Pro support,',
      '',
      'I would like to change my SaaS subscription plan.',
      '',
      'Business name: ',
      'Account email: ',
      'Current plan: ',
      '',
      'Requested plan: [Single Gym / 2 Gyms / 5 Gyms / Unlimited]',
      '',
      'Additional notes:',
      '',
      'Thank you.',
    ]),
    description: 'Upgrade, downgrade, or change billing cycle',
  },
  {
    value: 'TECHNICAL',
    label: 'Technical issue',
    defaultSubject: 'Technical issue report',
    defaultMessage: messageTemplate([
      'Hello FitSphere Pro support,',
      '',
      'I am experiencing a technical issue:',
      '',
      'What I was trying to do:',
      '',
      'What happened instead:',
      '',
      'Steps to reproduce:',
      '1.',
      '2.',
      '',
      'Thank you.',
    ]),
    description: 'Bugs, errors, or something not working',
  },
  {
    value: 'ACCOUNT_ACCESS',
    label: 'Account access',
    defaultSubject: 'Account access help',
    defaultMessage: messageTemplate([
      'Hello FitSphere Pro support,',
      '',
      'I need help with account access or permissions:',
      '',
      'Affected user/email:',
      '',
      'What access is needed or what is blocked:',
      '',
      'Thank you.',
    ]),
    description: 'Login, permissions, or staff access',
  },
  {
    value: 'FEATURE_REQUEST',
    label: 'Feature request',
    defaultSubject: 'Feature request',
    defaultMessage: messageTemplate([
      'Hello FitSphere Pro support,',
      '',
      'I would like to suggest the following feature or improvement:',
      '',
      'Description:',
      '',
      'Why this would help our gym:',
      '',
      'Thank you.',
    ]),
    description: 'Suggest improvements or new capabilities',
  },
];

export const SUPPORT_STATUS_LABELS = {
  OPEN: 'Open',
  IN_PROGRESS: 'In progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

export const getSupportCategory = (value) => SUPPORT_CATEGORIES.find((c) => c.value === value);

export const buildPlanChangeMessage = ({ tenantName, tenantEmail, planName, planStatus }) =>
  messageTemplate([
    'Hello FitSphere Pro support,',
    '',
    'I would like to change my SaaS subscription plan.',
    '',
    `Business: ${tenantName || '—'}`,
    `Account email: ${tenantEmail || '—'}`,
    `Current plan: ${planName || '—'}`,
    `Status: ${planStatus || '—'}`,
    '',
    'Requested plan: [Single Gym / 2 Gyms / 5 Gyms / Unlimited]',
    '',
    'Additional notes:',
    '',
    'Thank you.',
  ]);

export const getDefaultSupportForm = (categoryValue = 'GENERAL') => {
  const category = getSupportCategory(categoryValue) || SUPPORT_CATEGORIES[0];
  return {
    category: category.value,
    subject: category.defaultSubject,
    message: category.defaultMessage,
  };
};
