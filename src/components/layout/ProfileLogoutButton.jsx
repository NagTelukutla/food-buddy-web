import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProfileLogoutButton({ className = '' }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout({ all: true });
    navigate('/login');
  };

  return (
    <div className="flex w-full justify-center">
      <button
        type="button"
        onClick={handleLogout}
        className={`btn-primary inline-flex w-full min-w-[12rem] max-w-sm items-center justify-center gap-2 px-8 py-3 ${className}`.trim()}
      >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
        />
      </svg>
      Logout
      </button>
    </div>
  );
}
