import React from 'react';
import GoogleIcon from './icons/GoogleIcon.tsx';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="p-8 sm:p-12 bg-white dark:bg-gray-800 rounded-lg shadow-xl text-center max-w-sm w-full mx-4">
        <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">
          Gestor de Ofertas
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Por favor, inicia sesión para continuar.
        </p>
        <button
          onClick={onLogin}
          className="flex items-center justify-center w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-500 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          <GoogleIcon className="w-6 h-6 mr-3" />
          <span className="font-medium text-gray-700 dark:text-gray-200">Iniciar sesión con Google</span>
        </button>
      </div>
    </div>
  );
};

export default Login;