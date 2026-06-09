import { Outlet } from 'react-router-dom';
import AppNavbar from '../components/layout/AppNavbar';
import useRouteAuthGuard from '../hooks/useRouteAuthGuard';

export default function AppShell() {
  useRouteAuthGuard();

  return (
    <div className="flex min-h-screen flex-col">
      <AppNavbar />
      <div className="app-header-offset flex flex-1 flex-col">
        <Outlet />
      </div>
    </div>
  );
}
