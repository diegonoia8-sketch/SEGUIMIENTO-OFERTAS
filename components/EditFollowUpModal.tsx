import React, { useState, useEffect } from 'react';
import { FollowUp } from '../types';
import Modal from './Modal';

interface EditFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (followUp: FollowUp) => void;
  followUp: FollowUp | null;
}

const EditFollowUpModal: React.FC<EditFollowUpModalProps> = ({ isOpen, onClose, onSubmit, followUp }) => {
  const [comentario, setComentario] = useState('');

  useEffect(() => {
    if (followUp) {
      setComentario(followUp.comentario);
    }
  }, [followUp]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comentario || !followUp) {
        alert("El comentario no puede estar vacío.");
        return;
    }

    onSubmit({
      ...followUp,
      comentario,
    });
    onClose();
  };
  
  if (!followUp) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Editar Seguimiento - Oferta ${followUp.offerId}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="comentario-edit" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Comentario Seguimiento <span className="text-red-500">*</span>
          </label>
          <textarea
            id="comentario-edit"
            name="comentario"
            rows={4}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            required
            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            placeholder="Escriba su comentario aquí..."
          ></textarea>
        </div>
         <div className="flex justify-end pt-4">
            <button type="button" onClick={onClose} className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600 mr-2">
                Cancelar
            </button>
            <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                Guardar Cambios
            </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditFollowUpModal;
