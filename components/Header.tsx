import React from 'react';
import PlusIcon from './icons/PlusIcon.tsx';
import EditIcon from './icons/EditIcon.tsx';
import UploadIcon from './icons/UploadIcon.tsx';
import LogoutIcon from './icons/LogoutIcon.tsx';

interface HeaderProps {
  onRegisterClick: () => void;
  onUpdateClick: () => void;
  onImportClick: () => void;
  onLogout: () => void;
  user: {
    displayName?: string | null;
    photoURL?: string | null;
  };
}

const Header: React.FC<HeaderProps> = ({ onRegisterClick, onUpdateClick, onImportClick, onLogout, user }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md p-4 mb-8">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Gestor de Ofertas
        </h1>
        <div className="flex items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={onRegisterClick}
              className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              aria-label="Registrar nueva oferta"
            >
              <PlusIcon className="w-5 h-5 mr-0 sm:mr-2" />
              <span className="hidden sm:inline">Registrar Oferta</span>
            </button>
            <button
              onClick={onUpdateClick}
              className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
              aria-label="Actualizar oferta existente"
            >
              <EditIcon className="w-5 h-5 mr-0 sm:mr-2" />
              <span className="hidden sm:inline">Act. Oferta</span>
            </button>
            <button
              onClick={onImportClick}
              className="flex items-center bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
              aria-label="Importar ofertas desde archivo CSV"
            >
              <UploadIcon className="w-5 h-5 mr-0 sm:mr-2" />
              <span className="hidden sm:inline">Importar CSV</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-3 border-l border-gray-300 dark:border-gray-600 pl-4 ml-4">
              {user.photoURL && (
                <img src={user.photoURL} alt={user.displayName || 'Avatar del usuario'} className="w-9 h-9 rounded-full" />
              )}
              <span className="hidden lg:inline text-gray-700 dark:text-gray-300 font-medium">{user.displayName}</span>
              <button 
                onClick={onLogout} 
                className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                aria-label="Cerrar sesión"
              >
                <LogoutIcon className="w-6 h-6" />
              </button>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
