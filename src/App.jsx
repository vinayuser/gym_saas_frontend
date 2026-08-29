import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AuthLayout from './Layout/Auth/AuthLayout';
import DashboardLayout from './Layout/Dashboard/DashboardLayout';
import OwnerLayout from './Layout/Owner/OwnerLayout';
import Login from './Pages/Auth/Login';
import Register from './Pages/Auth/Register';
import Home from './Pages/Dashboard/Home';
import GymsLegacy from './Pages/Dashboard/Gyms/Gyms';
import MembersLegacy from './Pages/Dashboard/Members/Members';
import SubscriptionLegacy from './Pages/Dashboard/Subscription/Subscription';
import OwnerDashboard from './Pages/Owner/Dashboard';
import OwnerMembers from './Pages/Owner/Members';
import AddEditMember from './Pages/Owner/Members/AddEditMember';
import OwnerGyms from './Pages/Owner/Gyms';
import OwnerSubscription from './Pages/Owner/Subscription';
import OwnerStaff from './Pages/Owner/Staff/Staff';
import AddStaff from './Pages/Owner/Staff/AddStaff';
import OwnerBanners from './Pages/Owner/Banners/Banners';
import AddEditBanner from './Pages/Owner/Banners/AddEditBanner';
import MembershipPlans from './Pages/Owner/MembershipPlans/MembershipPlans';
import Attendance from './Pages/Owner/Attendance/Attendance';
import Events from './Pages/Owner/Events/Events';
import CreateEvent from './Pages/Owner/Events/CreateEvent';
import Leads from './Pages/Owner/Leads/Leads';
import StoreCategories from './Pages/Owner/Store/StoreCategories';
import StoreProducts from './Pages/Owner/Store/StoreProducts';
import StoreOrders from './Pages/Owner/Store/StoreOrders';
import MemberStore from './Pages/Owner/Store/MemberStore';
import FinanceOverview from './Pages/Owner/Finances/FinanceOverview';
import FinancePayments from './Pages/Owner/Finances/FinancePayments';
import FinanceExpenses from './Pages/Owner/Finances/FinanceExpenses';
import FinanceLedger from './Pages/Owner/Finances/FinanceLedger';
import FinanceReports from './Pages/Owner/Finances/FinanceReports';
import Trainers from './Pages/Owner/Trainers/Trainers';
import AddTrainer from './Pages/Owner/Trainers/AddTrainer';
import CommunityChat from './Pages/Owner/Chat/CommunityChat';
import Settings from './Pages/Owner/Settings/Settings';
import Support from './Pages/Owner/Support/Support';
import AdminLayout from './Layout/Admin/AdminLayout';
import SuperAdminDashboard from './Pages/Admin/Dashboard/SuperAdminDashboard';
import InviteList from './Pages/Admin/Invites/InviteList';
import CreateInvite from './Pages/Admin/Invites/CreateInvite';
import PlaceholderAdmin from './Pages/Admin/PlaceholderAdmin';
import GymOwnersList from './Pages/Admin/GymOwners/GymOwnersList';
import TransactionsList from './Pages/Admin/Transactions/TransactionsList';
import AdminSupport from './Pages/Admin/Support/AdminSupport';
import OwnerInviteSetup from './Pages/Setup/OwnerInviteSetup';
import MarketingLayout from './Layout/Marketing/MarketingLayout';
import MarketingHome from './Pages/Marketing/Home';
import MarketingAbout from './Pages/Marketing/About';
import MarketingContact from './Pages/Marketing/Contact';
import MarketingPricing from './Pages/Marketing/Pricing';
import MarketingFAQ from './Pages/Marketing/FAQ';
import MarketingPrivacy from './Pages/Marketing/Privacy';
import MarketingTerms from './Pages/Marketing/Terms';
import ProtectedRoute from './components/ProtectedRoute';
import { setAuthToken } from './config/axiosInstance';
import { getToken } from './helpers/utils';
import { ROLES } from './constants';

const OWNER_ROLES = [ROLES.GYM_OWNER, ROLES.MANAGER, ROLES.RECEPTIONIST, ROLES.TRAINER];
const OWNER_MANAGER = [ROLES.SUPER_ADMIN, ROLES.GYM_OWNER, ROLES.MANAGER];

const App = () => {
  useEffect(() => {
    const token = getToken();
    if (token) setAuthToken(token);
  }, []);

  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeButton
        theme="dark"
      />
      <Routes>
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        {/* Gym owner — FitSphere UI */}
        <Route path="/owner" element={<OwnerLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute allowedRoles={OWNER_ROLES} fallbackPath="/owner/dashboard">
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="members"
            element={
              <ProtectedRoute allowedRoles={[...OWNER_ROLES, ROLES.SUPER_ADMIN]} fallbackPath="/owner/dashboard">
                <OwnerMembers />
              </ProtectedRoute>
            }
          />
          <Route
            path="members/new"
            element={
              <ProtectedRoute allowedRoles={[...OWNER_ROLES, ROLES.SUPER_ADMIN]} fallbackPath="/owner/members">
                <AddEditMember />
              </ProtectedRoute>
            }
          />
          <Route
            path="members/:memberId/edit"
            element={
              <ProtectedRoute allowedRoles={[...OWNER_ROLES, ROLES.SUPER_ADMIN]} fallbackPath="/owner/members">
                <AddEditMember />
              </ProtectedRoute>
            }
          />
          <Route
            path="gyms"
            element={
              <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]} fallbackPath="/owner/dashboard">
                <OwnerGyms />
              </ProtectedRoute>
            }
          />
          <Route
            path="subscription"
            element={
              <ProtectedRoute
                allowedRoles={[ROLES.SUPER_ADMIN, ROLES.GYM_OWNER]}
                fallbackPath="/owner/dashboard"
              >
                <OwnerSubscription />
              </ProtectedRoute>
            }
          />
          <Route
            path="staff"
            element={
              <ProtectedRoute
                allowedRoles={[ROLES.SUPER_ADMIN, ROLES.GYM_OWNER, ROLES.MANAGER, ROLES.RECEPTIONIST]}
                fallbackPath="/owner/dashboard"
              >
                <OwnerStaff />
              </ProtectedRoute>
            }
          />
          <Route
            path="staff/new"
            element={
              <ProtectedRoute
                allowedRoles={[ROLES.SUPER_ADMIN, ROLES.GYM_OWNER, ROLES.MANAGER]}
                fallbackPath="/owner/staff"
              >
                <AddStaff />
              </ProtectedRoute>
            }
          />
          <Route
            path="membership-plans"
            element={
              <ProtectedRoute allowedRoles={OWNER_MANAGER} fallbackPath="/owner/dashboard">
                <MembershipPlans />
              </ProtectedRoute>
            }
          />
          <Route
            path="attendance"
            element={
              <ProtectedRoute allowedRoles={[...OWNER_ROLES, ROLES.SUPER_ADMIN]} fallbackPath="/owner/dashboard">
                <Attendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="events"
            element={
              <ProtectedRoute allowedRoles={[...OWNER_ROLES, ROLES.SUPER_ADMIN]} fallbackPath="/owner/dashboard">
                <Events />
              </ProtectedRoute>
            }
          />
          <Route
            path="events/new"
            element={
              <ProtectedRoute allowedRoles={OWNER_MANAGER} fallbackPath="/owner/events">
                <CreateEvent />
              </ProtectedRoute>
            }
          />
          <Route
            path="events/:eventId/edit"
            element={
              <ProtectedRoute allowedRoles={OWNER_MANAGER} fallbackPath="/owner/events">
                <CreateEvent />
              </ProtectedRoute>
            }
          />
          <Route
            path="leads"
            element={
              <ProtectedRoute allowedRoles={[...OWNER_ROLES, ROLES.SUPER_ADMIN]} fallbackPath="/owner/dashboard">
                <Leads />
              </ProtectedRoute>
            }
          />
          <Route
            path="store/categories"
            element={
              <ProtectedRoute allowedRoles={OWNER_MANAGER} fallbackPath="/owner/dashboard">
                <StoreCategories />
              </ProtectedRoute>
            }
          />
          <Route
            path="store/products"
            element={
              <ProtectedRoute allowedRoles={OWNER_MANAGER} fallbackPath="/owner/dashboard">
                <StoreProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="store/orders"
            element={
              <ProtectedRoute allowedRoles={OWNER_MANAGER} fallbackPath="/owner/dashboard">
                <StoreOrders />
              </ProtectedRoute>
            }
          />
          <Route path="inventory" element={<Navigate to="/owner/store/products" replace />} />
          <Route
            path="store"
            element={
              <ProtectedRoute allowedRoles={[...OWNER_ROLES, ROLES.SUPER_ADMIN]} fallbackPath="/owner/dashboard">
                <MemberStore />
              </ProtectedRoute>
            }
          />
          <Route
            path="finances/overview"
            element={
              <ProtectedRoute allowedRoles={OWNER_MANAGER} fallbackPath="/owner/dashboard">
                <FinanceOverview />
              </ProtectedRoute>
            }
          />
          <Route
            path="finances/payments"
            element={
              <ProtectedRoute allowedRoles={OWNER_MANAGER} fallbackPath="/owner/dashboard">
                <FinancePayments />
              </ProtectedRoute>
            }
          />
          <Route
            path="finances/expenses"
            element={
              <ProtectedRoute allowedRoles={OWNER_MANAGER} fallbackPath="/owner/dashboard">
                <FinanceExpenses />
              </ProtectedRoute>
            }
          />
          <Route
            path="finances/ledger"
            element={
              <ProtectedRoute allowedRoles={OWNER_MANAGER} fallbackPath="/owner/dashboard">
                <FinanceLedger />
              </ProtectedRoute>
            }
          />
          <Route
            path="finances/reports"
            element={
              <ProtectedRoute allowedRoles={OWNER_MANAGER} fallbackPath="/owner/dashboard">
                <FinanceReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="trainers"
            element={
              <ProtectedRoute allowedRoles={OWNER_MANAGER} fallbackPath="/owner/dashboard">
                <Trainers />
              </ProtectedRoute>
            }
          />
          <Route
            path="trainers/new"
            element={
              <ProtectedRoute allowedRoles={OWNER_MANAGER} fallbackPath="/owner/trainers">
                <AddTrainer />
              </ProtectedRoute>
            }
          />
          <Route
            path="banners"
            element={
              <ProtectedRoute
                allowedRoles={[ROLES.SUPER_ADMIN, ROLES.GYM_OWNER, ROLES.MANAGER]}
                fallbackPath="/owner/dashboard"
              >
                <OwnerBanners />
              </ProtectedRoute>
            }
          />
          <Route
            path="banners/new"
            element={
              <ProtectedRoute
                allowedRoles={[ROLES.SUPER_ADMIN, ROLES.GYM_OWNER, ROLES.MANAGER]}
                fallbackPath="/owner/banners"
              >
                <AddEditBanner />
              </ProtectedRoute>
            }
          />
          <Route
            path="banners/:bannerId/edit"
            element={
              <ProtectedRoute
                allowedRoles={[ROLES.SUPER_ADMIN, ROLES.GYM_OWNER, ROLES.MANAGER]}
                fallbackPath="/owner/banners"
              >
                <AddEditBanner />
              </ProtectedRoute>
            }
          />
          <Route
            path="chat"
            element={
              <ProtectedRoute allowedRoles={[...OWNER_ROLES, ROLES.SUPER_ADMIN]} fallbackPath="/owner/dashboard">
                <CommunityChat />
              </ProtectedRoute>
            }
          />
          <Route
            path="support"
            element={
              <ProtectedRoute allowedRoles={[...OWNER_ROLES, ROLES.SUPER_ADMIN]} fallbackPath="/owner/dashboard">
                <Support />
              </ProtectedRoute>
            }
          />
          <Route
            path="settings"
            element={
              <ProtectedRoute allowedRoles={OWNER_MANAGER} fallbackPath="/owner/dashboard">
                <Settings />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Public gym-owner onboarding via invite link */}
        <Route path="/setup/:token" element={<OwnerInviteSetup />} />

        {/* Super admin — FitSphere UI */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SuperAdminDashboard />} />
          <Route path="invites" element={<InviteList />} />
          <Route path="invites/new" element={<CreateInvite />} />
          <Route path="gym-owners" element={<GymOwnersList />} />
          <Route path="transactions" element={<TransactionsList />} />
          <Route path="support" element={<AdminSupport />} />
          <Route
            path="tenants"
            element={
              <PlaceholderAdmin
                title="Tenants"
                description="View and manage onboarded gym businesses. This will list tenants created from accepted invites once the API is connected."
                icon="domain"
              />
            }
          />
          <Route
            path="plans"
            element={
              <PlaceholderAdmin
                title="SaaS Plans"
                description="Configure subscription tiers, pricing, and feature flags platform-wide. Plans are currently defined in the invite flow mock data."
                icon="workspace_premium"
              />
            }
          />
          <Route
            path="settings"
            element={
              <PlaceholderAdmin
                title="Platform Settings"
                description="Email templates, branding, and global platform configuration will live here."
                icon="settings"
              />
            }
          />
        </Route>

        {/* Legacy super-admin / shared dashboard (optional deep links) */}
        <Route path="/admin-legacy" element={<DashboardLayout />}>
          <Route path="dashboard" element={<Home />} />
          <Route
            path="gyms"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'GYM_OWNER', 'MANAGER']}>
                <GymsLegacy />
              </ProtectedRoute>
            }
          />
          <Route
            path="members"
            element={
              <ProtectedRoute
                allowedRoles={['SUPER_ADMIN', 'GYM_OWNER', 'MANAGER', 'RECEPTIONIST']}
              >
                <MembersLegacy />
              </ProtectedRoute>
            }
          />
          <Route
            path="subscription"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'GYM_OWNER']}>
                <SubscriptionLegacy />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Public marketing site — shared header & footer via MarketingLayout */}
        <Route path="/" element={<MarketingLayout />}>
          <Route index element={<MarketingHome />} />
          <Route path="about" element={<MarketingAbout />} />
          <Route path="pricing" element={<MarketingPricing />} />
          <Route path="faq" element={<MarketingFAQ />} />
          <Route path="contact" element={<MarketingContact />} />
          <Route path="privacy" element={<MarketingPrivacy />} />
          <Route path="terms" element={<MarketingTerms />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
