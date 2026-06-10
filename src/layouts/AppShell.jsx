import { Outlet } from 'react-router-dom';
import AppGlassCanvas from '../components/common/AppGlassCanvas';
import AppNavbar from '../components/layout/AppNavbar';
import useRouteAuthGuard from '../hooks/useRouteAuthGuard';

export default function AppShell() {
  useRouteAuthGuard();

  return (
    <div className="app-shell relative flex min-h-screen flex-col">
      <AppGlassCanvas />
      <AppNavbar />
      <div className="app-header-offset relative z-[1] flex flex-1 flex-col">
        <Outlet />
      </div>
    </div>
  );
}
