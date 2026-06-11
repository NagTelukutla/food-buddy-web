import { Outlet } from 'react-router-dom';
import AppGlassCanvas from '../components/common/AppGlassCanvas';
import ScrollToTop from '../components/common/ScrollToTop';
import AppNavbar from '../components/layout/AppNavbar';
import BottomNav from '../components/layout/BottomNav';
import useRouteAuthGuard from '../hooks/useRouteAuthGuard';

export default function AppShell() {
  useRouteAuthGuard();

  return (
    <div className="app-shell relative flex min-h-screen flex-col">
      <ScrollToTop />
      <AppGlassCanvas />
      <AppNavbar />
      <div className="app-header-offset app-bottom-nav-offset relative z-[1] flex flex-1 flex-col">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
