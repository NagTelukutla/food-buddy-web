import { Outlet } from 'react-router-dom';

export default function DeliveryLayout() {
  return (
    <div className="flex flex-1 flex-col bg-stone-50">
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
