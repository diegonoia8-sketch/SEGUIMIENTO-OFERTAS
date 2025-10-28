
import React, { useState, useEffect } from 'react';
import { Offer, FollowUp } from '../types';
import Modal from './Modal';
import OfferSearchInput from './OfferSearchInput';

interface UpdateOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (followUp: Omit<FollowUp, 'id'>) => void;
  offers: Offer[];
}

const UpdateOfferModal: React.FC<UpdateOfferModalProps> = ({ isOpen, onClose, onSubmit, offers }) => {
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [comentario, setComentario] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Reset form state when modal is closed
    if (!isOpen) {
        setSelectedOffer(null);
        setComentario('');
        setError('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOffer) {
      setError("Por favor, busque y seleccione una oferta válida.");
      return;
    }
     if (!comentario.trim()) {
      setError("Por favor, añada un comentario.");
      return;
    }

    onSubmit({
      offerId: selectedOffer.id,
      fechaAct: new Date().toISOString().split('T')[0],
      comentario,
    });
    
    onClose();
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Actualizar Oferta (Añadir Seguimiento)">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
           <OfferSearchInput
              offers={offers}
              selectedOffer={selectedOffer}
              onOfferSelect={(offer) => {
                setSelectedOffer(offer);
                if (error) setError('');
              }}
              label="Buscar y Seleccionar Nº Oferta"
              placeholder="Escriba Nº Oferta o Proyecto..."
            />
            {error && <p className="mt-2 text-sm text-red-600 dark:text-red-500">{error}</p>}
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
            disabled={!selectedOffer}
            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white disabled:bg-gray-200 dark:disabled:bg-gray-600"
            placeholder={selectedOffer ? "Escriba su comentario aquí..." : "Seleccione una oferta para habilitar esta área"}
          ></textarea>
        </div>
         <div className="flex justify-end pt-4">
            <button type="button" onClick={onClose} className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600 mr-2">
                Cancelar
            </button>
            <button type="submit" className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 disabled:opacity-50" disabled={!selectedOffer}>
                Añadir Comentario
            </button>
        </div>
      </form>
    </Modal>
  );
};

export default UpdateOfferModal;
