import React from 'react';
import PlusIcon from './icons/PlusIcon.tsx';
import EditIcon from './icons/EditIcon.tsx';
import UploadIcon from './icons/UploadIcon.tsx';

interface HeaderProps {
  onRegisterClick: () => void;
  onUpdateClick: () => void;
  onImportClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onRegisterClick, onUpdateClick, onImportClick }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md p-4 mb-8">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Gestor de Ofertas
        </h1>
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
      </div>
    </header>
  );
};

export default Header;