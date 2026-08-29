import { useDispatch, useSelector } from 'react-redux';
import Icon from '../../components/fitsphere/Icon';
import OwnerProfileMenu from '../../components/fitsphere/OwnerProfileMenu';
import { setCurrentGym } from '../../store/slices/gymSlice';

const MEMBERS_ADMIN_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBTFnH66hZtdbW65c1RX_rV3YDdKzRsnNmIz5uxD0Vy0_nN3waVmmllzH_Dn806JUFIQeF53izxoKBBNxtrqd4J--zxEomy_aeVAYi33EnXoaY8KvxzX1TyXuaQ_bM2ULNrxCpG-GARV4l3aEvK9ImWNmWm4XwrpopFpEKuzCI06MTD2IFive4zcrei8qEP-JL4iy72nLAkydqII6t-XkB2VDyoER29WiN_LWM_QAi1ufvJtdzdkLS4F25d4_dFb-Gbz14SfVbgqvg';

const OwnerHeader = ({
  title,
  tabs,
  activeTab,
  onTabChange,
  showSearch = true,
  dashboard = false,
  variant = 'default',
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Global search...',
}) => {
  const dispatch = useDispatch();
  const { gyms, currentGym } = useSelector((state) => state.gym);

  const isMembers = variant === 'members';
  const isStaff = variant === 'staff';
  const isDashboard = dashboard || variant === 'dashboard';
  const useSearchFirst = isMembers || isStaff;

  const headerHeight = isDashboard ? 'h-20' : 'h-16';

  return (
    <header
      className={`sticky top-0 z-40 flex ${headerHeight} w-full items-center justify-between border-b border-white/5 bg-surface/80 px-6 backdrop-blur-xl md:px-8`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-4 md:gap-6 lg:gap-10">
        {useSearchFirst && showSearch && (
          <div className="relative shrink-0">
            <Icon
              name="search"
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary"
            />
            <input
              type="search"
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-48 rounded-lg border border-white/10 bg-surface-container-lowest py-2 pl-10 pr-4 text-sm transition-all focus:border-primary-fixed focus:outline-none md:w-64"
            />
          </div>
        )}

        {!useSearchFirst && gyms.length > 0 && (
          <div className="group relative hidden shrink-0 lg:block">
            <button
              type="button"
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-bold transition-colors hover:bg-white/10"
            >
              <Icon name="location_on" size={18} className="text-primary-fixed" />
              {currentGym?.name || 'Branch'}
              <Icon name="expand_more" size={18} className="text-secondary" />
            </button>
            <div className="absolute left-0 top-full z-50 mt-2 hidden w-56 overflow-hidden rounded-xl border border-white/10 bg-surface-container shadow-2xl group-hover:block">
              {gyms.map((gym) => (
                <button
                  key={gym.id}
                  type="button"
                  onClick={() => dispatch(setCurrentGym(gym))}
                  className="block w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-primary-fixed hover:text-on-primary-fixed"
                >
                  {gym.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {tabs && (
          <nav className="hidden items-center gap-6 md:flex">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => onTabChange?.(tab)}
                className={`pb-1 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'border-b-2 border-primary-fixed font-bold text-primary-fixed'
                    : 'text-secondary hover:text-on-surface'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        )}

        {!useSearchFirst && showSearch && !tabs && (
          <div className="relative hidden md:block">
            <Icon
              name="search"
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary"
            />
            <input
              type="search"
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-64 rounded-lg border border-white/10 bg-surface-container-lowest py-2 pl-10 pr-4 text-sm focus:border-primary-fixed focus:outline-none"
            />
          </div>
        )}

        {title && (
          <h2 className="truncate font-display text-lg font-semibold text-on-surface md:hidden">
            {title}
          </h2>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-4 md:gap-6">
        <button
          type="button"
          className="relative text-secondary transition-colors hover:text-primary-fixed"
        >
          <Icon name="notifications" size={24} />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-neon" />
        </button>
        <button
          type="button"
          className="hidden text-secondary transition-colors hover:text-primary-fixed sm:block"
        >
          <Icon name="apps" size={24} />
        </button>

        <OwnerProfileMenu
          roleLabel={useSearchFirst ? 'Admin' : 'Gym Owner'}
          avatarSrc={useSearchFirst ? MEMBERS_ADMIN_AVATAR : undefined}
        />
      </div>
    </header>
  );
};

export default OwnerHeader;
