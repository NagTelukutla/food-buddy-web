import { Outlet } from 'react-router-dom';
import { useSettings } from '../hooks/useSettings';
import { APP_NAME } from '../utils/constants';

export default function MainLayout() {
  const { settings } = useSettings();

  return (
    <div className="flex flex-1 flex-col">
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>

      <footer className="glass-footer mt-auto">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 md:text-left">
          <div className="text-center md:text-left">
            <h4 className="mb-2 font-display text-lg text-white">{APP_NAME}</h4>
            <p className="text-sm leading-relaxed">{settings?.tagline}</p>
          </div>
          <div className="text-center md:text-left">
            <h4 className="mb-2 font-semibold text-white">Contact</h4>
            <p className="text-sm leading-relaxed">{settings?.address}</p>
            <p className="text-sm">{settings?.phone}</p>
            <p className="text-sm break-all">{settings?.email}</p>
          </div>
        </div>
        <div className="border-t border-white/10 px-4 py-4 text-center text-xs sm:px-6">
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
