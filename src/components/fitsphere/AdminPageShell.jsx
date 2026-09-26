import OwnerHeader from '../../Layout/Owner/OwnerHeader';

/** Super admin pages reuse FitSphere header shell without gym branch picker context. */
const AdminPageShell = ({
  children,
  tabs,
  activeTab,
  onTabChange,
  showSearch = true,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  className = '',
}) => (
  <>
    <OwnerHeader
      variant="dashboard"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
      showSearch={showSearch}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      searchPlaceholder={searchPlaceholder}
    />
    <main className={`p-6 md:p-8 ${className}`}>
      <div className="mx-auto max-w-7xl">{children}</div>
    </main>
  </>
);

export default AdminPageShell;
