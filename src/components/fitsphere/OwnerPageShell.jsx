import OwnerHeader from '../../Layout/Owner/OwnerHeader';

const OwnerPageShell = ({
  children,
  title,
  tabs,
  activeTab,
  onTabChange,
  showSearch = true,
  dashboard = false,
  variant = 'default',
  searchValue,
  onSearchChange,
  searchPlaceholder,
  className = '',
}) => (
  <>
    <OwnerHeader
      title={title}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
      showSearch={showSearch}
      dashboard={dashboard}
      variant={variant}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      searchPlaceholder={searchPlaceholder}
    />
    <main className={`p-6 md:p-8 ${className}`}>
      <div className="mx-auto max-w-7xl">{children}</div>
    </main>
  </>
);

export default OwnerPageShell;
