
import React, { useState } from 'react';
import { Offer, FollowUp } from '../types';
import Modal from './Modal';

interface UpdateOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (followUp: Omit<FollowUp, 'id'>) => void;
  offers: Offer[];
}

const UpdateOfferModal: React.FC<UpdateOfferModalProps> = ({ isOpen, onClose, onSubmit, offers }) => {
  const [offerId, setOfferId] = useState('');
  const [comentario, setComentario] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerId || !comentario) {
        alert("Por favor, seleccione una oferta y añada un comentario.");
        return;
    }

    onSubmit({
      offerId: Number(offerId),
      fechaAct: new Date().toISOString().split('T')[0],
      comentario,
    });
    setOfferId('');
    setComentario('');
    onClose();
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Actualizar Oferta (Añadir Seguimiento)">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="offerId" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Nº Oferta <span className="text-red-500">*</span>
          </label>
          <select
            id="offerId"
            name="offerId"
            value={offerId}
            onChange={(e) => setOfferId(e.target.value)}
            required
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          >
            <option value="">Seleccione una oferta...</option>
            {offers.map((offer) => (
              <option key={offer.id} value={offer.id}>
                {offer.id} - {offer.proyecto} ({offer.cliente})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="comentario" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Comentario Seguimiento <span className="text-red-500">*</span>
          </label>
          <textarea
            id="comentario"
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
            <button type="submit" className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">
                Añadir Comentario
            </button>
        </div>
      </form>
    </Modal>
  );
};

export default UpdateOfferModal;
