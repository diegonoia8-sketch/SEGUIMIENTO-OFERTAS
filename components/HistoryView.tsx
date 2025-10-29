import React, { useState, useMemo, useEffect } from 'react';
import { Offer, FollowUp } from '../types';
import EditIcon from './icons/EditIcon';
import TrashIcon from './icons/TrashIcon';
import OfferSearchInput from './OfferSearchInput';

interface HistoryViewProps {
  offers: Offer[];
  followUps: FollowUp[];
  onEditFollowUp: (followUp: FollowUp) => void;
  onDeleteFollowUp: (followUpId: string) => void;
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const HistoryView: React.FC<HistoryViewProps> = ({ offers, followUps, onEditFollowUp, onDeleteFollowUp }) => {
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

  useEffect(() => {
    // If the selected offer is no longer in the main offers list (e.g., it was deleted),
    // reset the selection to avoid displaying stale data.
    if (selectedOffer && !offers.some(o => o.id === selectedOffer.id)) {
      setSelectedOffer(null);
    }
  }, [offers, selectedOffer]);

  const filteredHistory = useMemo(() => {
    if (!selectedOffer) return [];
    return followUps
      .filter((f) => f.offerId === selectedOffer.id)
      .sort((a, b) => new Date(b.fechaAct).getTime() - new Date(a.fechaAct).getTime());
  }, [selectedOffer, followUps]);
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Histórico de Seguimiento</h2>
        <div className="mb-4">
            <OfferSearchInput 
                offers={offers}
                selectedOffer={selectedOffer}
                onOfferSelect={setSelectedOffer}
                label="Seleccione Nº Oferta para ver su histórico:"
                placeholder="Escriba Nº Oferta o Proyecto..."
            />
        </div>

        {selectedOffer && (
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                     <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Nº Oferta</th>
                            <th scope="col" className="px-6 py-3">Proyecto</th>
                            <th scope="col" className="px-6 py-3">Fecha Act.</th>
                            <th scope="col" className="px-6 py-3">Comentario Seguimiento</th>
                            <th scope="col" className="px-6 py-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredHistory.length > 0 ? (
                            filteredHistory.map(item => (
                                <tr key={item.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{item.offerId}</td>
                                    <td className="px-6 py-4">{selectedOffer?.proyecto}</td>
                                    <td className="px-6 py-4">{formatDate(item.fechaAct)}</td>
                                    <td className="px-6 py-4">{item.comentario}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <button onClick={() => onEditFollowUp(item)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300" aria-label="Editar comentario">
                                                <EditIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => onDeleteFollowUp(item.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" aria-label="Eliminar comentario">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="text-center py-4">No hay historial de seguimiento para esta oferta.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
             </div>
        )}
    </div>
  );
};

export default HistoryView;
