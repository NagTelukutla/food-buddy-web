import { Outlet } from 'react-router-dom';

export default function CustomerLayout() {
  return (
    <div className="flex flex-1 flex-col">
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
