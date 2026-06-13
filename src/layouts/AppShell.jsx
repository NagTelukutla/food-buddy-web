import { Outlet, useLocation } from 'react-router-dom';
import AppGlassCanvas from '../components/common/AppGlassCanvas';
import ScrollToTop from '../components/common/ScrollToTop';
import AppNavbar from '../components/layout/AppNavbar';
import BottomNav from '../components/layout/BottomNav';
import useRouteAuthGuard from '../hooks/useRouteAuthGuard';

const AUTH_ROUTES = new Set(['/login', '/register']);

export default function AppShell() {
  useRouteAuthGuard();
  const { pathname } = useLocation();
  const isAuthRoute = AUTH_ROUTES.has(pathname);

  return (
    <div className={`app-shell relative flex min-h-screen flex-col ${isAuthRoute ? 'app-shell--auth' : ''}`}>
      <ScrollToTop />
      <AppGlassCanvas />
      <AppNavbar />
      <div
        className={`app-header-offset relative z-[1] flex flex-1 flex-col ${
          isAuthRoute ? 'auth-route-panel' : 'app-bottom-nav-offset'
        }`}
      >
        <Outlet />
      </div>
      {!isAuthRoute && <BottomNav />}
    </div>
  );
}
