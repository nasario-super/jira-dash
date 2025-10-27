import React from 'react';
import { useAuth } from '../../stores/authStore';

export const LogoutButton: React.FC = () => {
  const { logout, credentials } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      logout();
    }
  };

  if (!credentials) {
    return null;
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="text-sm text-gray-600">
        <span className="font-medium">{credentials.email}</span>
        <span className="ml-2 text-gray-400">•</span>
        <span className="ml-2">{credentials.domain}</span>
      </div>
      <button
        onClick={handleLogout}
        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Sair
      </button>
    </div>
  );
};
