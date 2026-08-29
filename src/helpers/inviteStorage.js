import { SAAS_PLANS } from '../constants/saasPlans';

const STORAGE_KEY = 'fitsphere_gym_invites';

const seedInvites = () => [
  {
    id: 'inv-demo-1',
    email: 'owner@demo.com',
    inviteeName: 'Demo Owner',
    businessName: 'FitSphere Downtown',
    planId: 'plan-single',
    planName: 'Single Gym',
    planType: 'SINGLE_GYM',
    status: 'ACCEPTED',
    token: 'demo-token-accepted',
    note: 'Initial demo tenant',
    expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    sentAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    acceptedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: 'inv-demo-2',
    email: 'sarah.jenkins@elitefit.com',
    inviteeName: 'Sarah Jenkins',
    businessName: 'Elite Performance Lab',
    planId: 'plan-two',
    planName: '2 Gyms',
    planType: 'TWO_GYMS',
    status: 'SENT',
    token: 'invite-elite-2024',
    note: 'Q1 expansion — two locations',
    expiresAt: new Date(Date.now() + 12 * 86400000).toISOString(),
    sentAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    acceptedAt: null,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'inv-demo-3',
    email: 'marcus@ironworks.io',
    inviteeName: '',
    businessName: '',
    planId: 'plan-five',
    planName: '5 Gyms',
    planType: 'FIVE_GYMS',
    status: 'PENDING',
    token: 'invite-iron-pending',
    note: '',
    expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
    sentAt: null,
    acceptedAt: null,
    createdAt: new Date(Date.now() - 1 * 3600000).toISOString(),
  },
];

const readAll = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = seedInvites();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw);
  } catch {
    return seedInvites();
  }
};

const writeAll = (invites) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invites));
};

export const getInviteLink = (token) => {
  const base = window.location.origin;
  return `${base}/setup/${token}`;
};

export const listInvites = () => readAll().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

export const getInviteByToken = (token) => readAll().find((i) => i.token === token);

export const getInviteById = (id) => readAll().find((i) => i.id === id);

const generateToken = () =>
  `inv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export const createInvite = ({ email, inviteeName, businessName, planId, note, expiryDays = 14 }) => {
  const plan = SAAS_PLANS.find((p) => p.id === planId);
  if (!plan) throw new Error('Invalid plan');

  const token = generateToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + expiryDays * 86400000);

  const invite = {
    id: `inv-${crypto.randomUUID?.() || Date.now()}`,
    email: email.trim().toLowerCase(),
    inviteeName: inviteeName?.trim() || '',
    businessName: businessName?.trim() || '',
    planId: plan.id,
    planName: plan.name,
    planType: plan.type,
    status: 'PENDING',
    token,
    note: note?.trim() || '',
    expiresAt: expiresAt.toISOString(),
    sentAt: null,
    acceptedAt: null,
    createdAt: now.toISOString(),
  };

  const invites = readAll();
  invites.unshift(invite);
  writeAll(invites);
  return invite;
};

export const markInviteSent = (id) => {
  const invites = readAll();
  const idx = invites.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  invites[idx] = {
    ...invites[idx],
    status: invites[idx].status === 'PENDING' ? 'SENT' : invites[idx].status,
    sentAt: invites[idx].sentAt || new Date().toISOString(),
  };
  writeAll(invites);
  return invites[idx];
};

export const markInviteAccepted = (token) => {
  const invites = readAll();
  const idx = invites.findIndex((i) => i.token === token);
  if (idx === -1) return null;
  invites[idx] = {
    ...invites[idx],
    status: 'ACCEPTED',
    acceptedAt: new Date().toISOString(),
  };
  writeAll(invites);
  return invites[idx];
};

export const revokeInvite = (id) => {
  const invites = readAll();
  const idx = invites.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  invites[idx] = { ...invites[idx], status: 'REVOKED' };
  writeAll(invites);
  return invites[idx];
};

export const isInviteValid = (invite) => {
  if (!invite) return { valid: false, reason: 'Invite not found' };
  if (invite.status === 'REVOKED') return { valid: false, reason: 'This invite has been revoked.' };
  if (invite.status === 'ACCEPTED') return { valid: false, reason: 'This invite has already been used.' };
  if (new Date(invite.expiresAt) < new Date()) return { valid: false, reason: 'This invite has expired.' };
  return { valid: true };
};

export const INVITE_STATUS_LABELS = {
  PENDING: 'Pending',
  SENT: 'Email sent',
  ACCEPTED: 'Accepted',
  EXPIRED: 'Expired',
  REVOKED: 'Revoked',
};

export const inviteStatusClass = (status) => {
  switch (status) {
    case 'ACCEPTED':
      return 'bg-primary-container/20 text-primary-container border-primary-container/30';
    case 'SENT':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'PENDING':
      return 'bg-white/10 text-secondary border-white/10';
    case 'REVOKED':
    case 'EXPIRED':
      return 'bg-error-container/20 text-error border-error-container/30';
    default:
      return 'bg-white/5 text-secondary border-white/10';
  }
};
