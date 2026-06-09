import { Link, Outlet } from 'react-router-dom';
import { useSettings } from '../hooks/useSettings';

export default function MainLayout() {
  const { settings } = useSettings();
  const fullName = settings?.name || 'Hotel Abhi ruchi';

  return (
    <div className="flex flex-1 flex-col">
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>

      <footer className="border-t border-stone-200 bg-dark-900 text-stone-300">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 md:text-left">
          <div className="text-center md:text-left">
            <h4 className="mb-2 font-display text-lg text-white">{fullName}</h4>
            <p className="text-sm leading-relaxed">{settings?.tagline}</p>
          </div>
          <div className="text-center md:text-left">
            <h4 className="mb-2 font-semibold text-white">Contact</h4>
            <p className="text-sm leading-relaxed">{settings?.address}</p>
            <p className="text-sm">{settings?.phone}</p>
            <p className="text-sm break-all">{settings?.email}</p>
          </div>
          <div className="text-center md:text-left">
            <h4 className="mb-2 font-semibold text-white">Hours</h4>
            <p className="whitespace-pre-line text-sm leading-relaxed">{settings?.working_hours}</p>
          </div>
        </div>
        <div className="border-t border-stone-700 px-4 py-4 text-center text-xs sm:px-6">
          © {new Date().getFullYear()} {fullName}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
