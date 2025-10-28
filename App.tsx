import React, { useState } from 'react';
import { Offer, FollowUp, Status } from './types';
import Header from './components/Header';
import OfferTable from './components/OfferTable';
import RegisterOfferModal from './components/RegisterOfferModal';
import UpdateOfferModal from './components/UpdateOfferModal';
import HistoryView from './components/HistoryView';
import OfferChart from './components/OfferChart';
import CogIcon from './components/icons/CogIcon';
import EditFollowUpModal from './components/EditFollowUpModal';
import ConfigurationView from './components/ConfigurationView';
import AlertDialog from './components/AlertDialog';

// Initial mock data
const initialOffers: Offer[] = [
  { id: 1001, estado: 'Adjudicada', cliente: 'Cliente A', destino: 'Planta X', proyecto: 'Proyecto Alpha', fechaRfq: '2023-05-15', responsable: 'Juan Pérez', ultAct: '2023-06-01', volPico: 50000, volTot: 250000, sop: '2025', duracion: '5 años' },
  { id: 1002, estado: 'Pendiente', cliente: 'Cliente B', destino: 'Planta Y', proyecto: 'Proyecto Beta', fechaRfq: '2024-03-20', responsable: 'Ana Gómez', ultAct: '2024-04-10', volPico: 120000, volTot: 600000, sop: '2026', duracion: '5 años' },
  { id: 1003, estado: 'Perdida', cliente: 'Cliente C', destino: 'Planta Z', proyecto: 'Proyecto Gamma', fechaRfq: '2022-11-10', responsable: 'Juan Pérez', ultAct: '2022-12-05', volPico: 80000, volTot: 400000, sop: '2024', duracion: '5 años' },
];

const initialFollowUps: FollowUp[] = [
  { id: 1, offerId: 1001, fechaAct: '2023-05-20', comentario: 'Enviada cotización inicial.' },
  { id: 2, offerId: 1001, fechaAct: '2023-06-01', comentario: 'Cliente confirma adjudicación. Preparar contrato.' },
  { id: 3, offerId: 1002, fechaAct: '2024-03-25', comentario: 'Primera reunión técnica. Pendiente de feedback.' },
  { id: 4, offerId: 1002, fechaAct: '2024-04-10', comentario: 'Cliente solicita ajuste en precios. Se está revisando.' },
  { id: 5, offerId: 1003, fechaAct: '2022-12-05', comentario: 'Competencia ofreció un precio más bajo.' },
];

const initialStatuses: Status[] = [
    { id: '1', name: 'Pendiente', color: '#facc15' },
    { id: '2', name: 'Adjudicada', color: '#4ade80' },
    { id: '3', name: 'Perdida', color: '#f87171' },
    { id: '4', name: 'Cancelada', color: '#9ca3af' },
];

interface DialogState {
    isOpen: boolean;
    title: string;
    message: string;
    isConfirmation: boolean;
    onConfirm: (() => void) | null;
}

const App: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>(initialOffers);
  const [followUps, setFollowUps] = useState<FollowUp[]>(initialFollowUps);
  const [statuses, setStatuses] = useState<Status[]>(initialStatuses);
  
  const [activeTab, setActiveTab] = useState<'offers' | 'config'>('offers');

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isEditFollowUpModalOpen, setIsEditFollowUpModalOpen] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState<FollowUp | null>(null);

  const [dialog, setDialog] = useState<DialogState>({ 
      isOpen: false, title: '', message: '', isConfirmation: false, onConfirm: null 
  });

  const handleRegisterOffer = (newOfferData: Omit<Offer, 'id' | 'ultAct'>) => {
    setOffers(prevOffers => {
        const newId = prevOffers.length > 0 ? Math.max(...prevOffers.map(o => o.id)) + 1 : 1001;
        const newOffer: Offer = {
            ...newOfferData,
            id: newId,
            ultAct: newOfferData.fechaRfq,
        };
        return [...prevOffers, newOffer];
    });
  };

  const handleUpdateOffer = (newFollowUpData: Omit<FollowUp, 'id'>) => {
    setFollowUps(prevFollowUps => {
        const newId = prevFollowUps.length > 0 ? Math.max(...prevFollowUps.map(f => f.id)) + 1 : 1;
        const newFollowUp: FollowUp = {
            ...newFollowUpData,
            id: newId,
        };
        return [...prevFollowUps, newFollowUp];
    });

    setOffers(prevOffers => prevOffers.map(offer => 
        offer.id === newFollowUpData.offerId 
            ? { ...offer, ultAct: newFollowUpData.fechaAct } 
            : offer
    ));
  };
  
  const handleEditFollowUp = (updatedFollowUp: FollowUp) => {
      setFollowUps(prev => prev.map(f => f.id === updatedFollowUp.id ? updatedFollowUp : f));
  };
  
  const handleDeleteFollowUp = (followUpId: number) => {
      setDialog({
          isOpen: true,
          title: 'Confirmar Eliminación',
          message: '¿Estás seguro de que quieres eliminar este comentario de seguimiento? Esta acción no se puede deshacer.',
          isConfirmation: true,
          onConfirm: () => {
              setFollowUps(prev => prev.filter(f => f.id !== followUpId));
              setDialog({ isOpen: false, title: '', message: '', isConfirmation: false, onConfirm: null });
          }
      });
  };
  
  const handleOpenEditFollowUpModal = (followUp: FollowUp) => {
      setEditingFollowUp(followUp);
      setIsEditFollowUpModalOpen(true);
  };
  
  const handleUpdateOfferStatus = (offerId: number, newStatus: string) => {
      setOffers(prev => prev.map(o => o.id === offerId ? { ...o, estado: newStatus } : o));
  };
  
  const handleAddStatus = (newStatusData: Omit<Status, 'id'>) => {
      const newStatus: Status = { ...newStatusData, id: crypto.randomUUID() };
      setStatuses(prev => [...prev, newStatus]);
  };
  
  const handleDeleteStatus = (statusId: string) => {
    const statusToDelete = statuses.find(s => s.id === statusId);
    if (!statusToDelete) return;

    const isStatusInUse = offers.some(offer => offer.estado === statusToDelete.name);
    if (isStatusInUse) {
        setDialog({
            isOpen: true,
            title: 'Acción Bloqueada',
            message: `No se puede eliminar el estado "${statusToDelete.name}" porque está siendo utilizado por una o más ofertas.`,
            isConfirmation: false,
            onConfirm: null,
        });
        return;
    }

    setDialog({
        isOpen: true,
        title: 'Confirmar Eliminación',
        message: `¿Estás seguro de que quieres eliminar el estado "${statusToDelete.name}"?`,
        isConfirmation: true,
        onConfirm: () => {
            setStatuses(prev => prev.filter(s => s.id !== statusId));
            setDialog({ isOpen: false, title: '', message: '', isConfirmation: false, onConfirm: null });
        }
    });
  }
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Header 
        onRegisterClick={() => setIsRegisterModalOpen(true)}
        onUpdateClick={() => setIsUpdateModalOpen(true)}
      />
      <main className="container mx-auto p-4 space-y-8">
        <div className="mb-8 border-b border-gray-200 dark:border-gray-700">
            <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500 dark:text-gray-400">
                <li className="mr-2">
                    <button onClick={() => setActiveTab('offers')} className={`inline-flex items-center justify-center p-4 border-b-2 rounded-t-lg group ${activeTab === 'offers' ? 'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500' : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'}`}>
                        Ofertas
                    </button>
                </li>
                <li>
                    <button onClick={() => setActiveTab('config')} className={`inline-flex items-center justify-center p-4 border-b-2 rounded-t-lg group ${activeTab === 'config' ? 'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500' : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'}`}>
                        <CogIcon className="w-5 h-5 mr-2" />
                        Configuración
                    </button>
                </li>
            </ul>
        </div>
        
        {activeTab === 'offers' && (
            <div className="space-y-8">
                <OfferTable offers={offers} followUps={followUps} statuses={statuses} onUpdateOfferStatus={handleUpdateOfferStatus} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <HistoryView offers={offers} followUps={followUps} onEditFollowUp={handleOpenEditFollowUpModal} onDeleteFollowUp={handleDeleteFollowUp} />
                  <OfferChart offers={offers} />
                </div>
            </div>
        )}

        {activeTab === 'config' && (
            <ConfigurationView statuses={statuses} onAddStatus={handleAddStatus} onDeleteStatus={handleDeleteStatus} />
        )}
        
      </main>

      <RegisterOfferModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSubmit={handleRegisterOffer}
        statuses={statuses}
      />
      <UpdateOfferModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onSubmit={handleUpdateOffer}
        offers={offers}
      />
      <EditFollowUpModal
        isOpen={isEditFollowUpModalOpen}
        onClose={() => setIsEditFollowUpModalOpen(false)}
        onSubmit={handleEditFollowUp}
        followUp={editingFollowUp}
      />
      <AlertDialog 
        isOpen={dialog.isOpen}
        onClose={() => setDialog({ ...dialog, isOpen: false })}
        onConfirm={dialog.onConfirm}
        title={dialog.title}
        message={dialog.message}
        isConfirmation={dialog.isConfirmation}
      />
    </div>
  );
}

export default App;
