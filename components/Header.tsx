import React from 'react';
import PlusIcon from './icons/PlusIcon';
import EditIcon from './icons/EditIcon';
import { User } from 'firebase/auth';

interface HeaderProps {
  user: User | null;
  onRegisterClick: () => void;
  onUpdateClick: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onRegisterClick, onUpdateClick, onLogout }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md p-4 mb-8">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Gestor de Ofertas
        </h1>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <button
                onClick={onRegisterClick}
                className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Registrar Oferta</span>
              </button>
              <button
                onClick={onUpdateClick}
                className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
              >
                <EditIcon className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Act. Oferta</span>
              </button>
              <div className="flex items-center space-x-3 border-l border-gray-300 dark:border-gray-600 pl-4">
                <span className="hidden md:inline text-sm font-medium text-gray-700 dark:text-gray-200">
                  {user.displayName || user.email}
                </span>
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <button
                  onClick={onLogout}
                  className="text-sm font-medium text-red-600 dark:text-red-400 hover:underline"
                >
                  Salir
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default Header;
