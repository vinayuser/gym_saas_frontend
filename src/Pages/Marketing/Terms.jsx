import LegalPage from '../../components/marketing/LegalPage';
import { TERMS_SECTIONS } from '../../constants/marketingContent';

const Terms = () => (
  <LegalPage
    title="Terms of Service"
    subtitle="Terms for using the Gym SaaS platform, owner portal, and invite-based onboarding."
    updated="October 24, 2024"
    sections={TERMS_SECTIONS}
    sidebarLinks={TERMS_SECTIONS.map((s) => ({
      id: s.id,
      label: s.title.replace(/^\d+\.\s*/, ''),
    }))}
  />
);

export default Terms;
