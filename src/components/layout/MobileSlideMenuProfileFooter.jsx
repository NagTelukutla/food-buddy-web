import { Link } from 'react-router-dom';
import { getMobileNavInitials } from '../../utils/mobileNavStyles';

export default function MobileSlideMenuProfileFooter({
  user,
  roleLabel,
  profilePath,
  onNavigate,
  onLogout,
}) {
  const initials = getMobileNavInitials(user?.full_name);

  return (
    <div className="app-mobile-slide-footer">
      <div className="flex items-center gap-2 px-0.5 py-0.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
          {initials || '?'}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-stone-800">{user?.full_name}</p>
          <p className="truncate text-[11px] text-stone-500">{roleLabel}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Link
          to={profilePath}
          onClick={onNavigate}
          className="btn-secondary flex-1 border-white/20 bg-white/40 py-1.5 text-center text-xs hover:bg-white/60"
        >
          Profile
        </Link>
        <button type="button" onClick={onLogout} className="btn-primary flex-1 py-1.5 text-xs">
          Logout
        </button>
      </div>
    </div>
  );
}
