import { Outlet } from 'react-router-dom';

export default function DeliveryLayout() {
  return (
    <div className="relative flex min-h-screen min-w-0 flex-col">
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
