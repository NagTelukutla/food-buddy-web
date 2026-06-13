import { Link, Outlet } from 'react-router-dom';
import LocationGateModal from '../components/location/LocationGateModal';
import { CONTACT_CONFIG } from '../data/contactConfig';
import { useAuth } from '../context/AuthContext';
import { APP_NAME } from '../utils/constants';
import { formatPhoneDisplay } from '../utils/phone';

export default function MainLayout() {
  const { activeSessions } = useAuth();
  const isLoggedIn = activeSessions.length > 0;

  return (
    <div className="flex flex-1 flex-col">
      <LocationGateModal />
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>

      <footer className="glass-footer mt-auto">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-2 pt-8 sm:px-6 md:grid-cols-2 md:text-left">
          <div className="text-center md:text-left">
            <h4 className="mb-2 font-display text-lg text-stone-900">{APP_NAME}</h4>
            <p className="text-sm leading-relaxed text-stone-600">{CONTACT_CONFIG.tagline}</p>
          </div>
          <div className="text-center md:text-left">
            <h4 className="mb-2 font-semibold text-stone-900">Contact</h4>
            <p className="text-sm text-stone-600">
              <a
                href={`tel:${CONTACT_CONFIG.phone.replace(/\s/g, '')}`}
                className="font-medium text-brand-700 hover:text-brand-800"
              >
                {formatPhoneDisplay(CONTACT_CONFIG.phone)}
              </a>
            </p>
            <p className="text-sm break-all text-stone-600">
              <a
                href={`mailto:${CONTACT_CONFIG.email}`}
                className="font-medium text-brand-700 hover:text-brand-800"
              >
                {CONTACT_CONFIG.email}
              </a>
            </p>
            {!isLoggedIn && (
              <Link
                to="/contact"
                className="mt-3 inline-flex text-sm font-semibold text-brand-600 hover:text-brand-700"
              >
                Contact us →
              </Link>
            )}
          </div>
        </div>
        <div className="glass-footer-bar">
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
