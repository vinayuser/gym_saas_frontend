import LegalPage from '../../components/marketing/LegalPage';
import { PRIVACY_SECTIONS } from '../../constants/marketingContent';

const Privacy = () => (
  <LegalPage
    title="Privacy Policy"
    subtitle="How FitSphere Pro looks after your account, your gym, your members, and payments."
    updated="October 24, 2024"
    sections={PRIVACY_SECTIONS}
    sidebarLinks={PRIVACY_SECTIONS.map((s) => ({
      id: s.id,
      label: s.title.replace(/^\d+\.\s*/, ''),
    }))}
  />
);

export default Privacy;
