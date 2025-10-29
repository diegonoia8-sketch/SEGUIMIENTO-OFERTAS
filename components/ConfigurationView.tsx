import React, { useState } from 'react';
import { Status } from '../types.ts';
import TrashIcon from './icons/TrashIcon.tsx';

interface ConfigurationViewProps {
  statuses: Status[];
  onAddStatus: (status: Omit<Status, 'id'>) => void;
  onDeleteStatus: (statusId: string) => void;
}

const ConfigurationView: React.FC<ConfigurationViewProps> = ({ statuses, onAddStatus, onDeleteStatus }) => {
  const [newStatusName, setNewStatusName] = useState('');
  const [newStatusColor, setNewStatusColor] = useState('#cccccc');

  const handleAddStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatusName) {
      alert('El nombre del estado no puede estar vacío.');
      return;
    }
    if (statuses.some(s => s.name.toLowerCase() === newStatusName.toLowerCase())) {
        alert('Este estado ya existe.');
        return;
    }

    onAddStatus({ name: newStatusName, color: newStatusColor });
    setNewStatusName('');
    setNewStatusColor('#cccccc');
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Gestionar Estados de Oferta</h2>
        <form onSubmit={handleAddStatus} className="flex flex-col md:flex-row items-end gap-4 p-4 border rounded-lg dark:border-gray-700">
          <div className="flex-grow w-full">
            <label htmlFor="status-name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Nombre del Nuevo Estado
            </label>
            <input
              type="text"
              id="status-name"
              value={newStatusName}
              onChange={(e) => setNewStatusName(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="Ej: En Negociación"
            />
          </div>
          <div className="w-full md:w-auto">
            <label htmlFor="status-color" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Color
            </label>
            <input
              type="color"
              id="status-color"
              value={newStatusColor}
              onChange={(e) => setNewStatusColor(e.target.value)}
              className="p-1 h-10 w-full md:w-14 block bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none"
            />
          </div>
          <button
            type="submit"
            className="w-full md:w-auto text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Añadir Estado
          </button>
        </form>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Estados Actuales</h3>
        <ul className="space-y-2">
          {statuses.map(status => (
            <li key={status.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="block w-5 h-5 rounded-full" style={{ backgroundColor: status.color }}></span>
                <span className="text-gray-900 dark:text-white">{status.name}</span>
              </div>
              <button
                onClick={() => onDeleteStatus(status.id)}
                className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                aria-label={`Eliminar ${status.name}`}
              >
                <TrashIcon />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ConfigurationView;