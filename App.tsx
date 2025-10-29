import React, { useState, useEffect, useMemo } from 'react';
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
import { db } from './firebase';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, query, orderBy, getDoc, setDoc, where, getDocs, writeBatch } from 'firebase/firestore';
import EditOfferModal from './components/EditOfferModal';
import ImportCSVModal from './components/ImportCSVModal';

interface DialogState {
    isOpen: boolean;
    title: string;
    message: string;
    isConfirmation: boolean;
    onConfirm: (() => void) | null;
}

const App: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'offers' | 'config'>('offers');

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isEditFollowUpModalOpen, setIsEditFollowUpModalOpen] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState<FollowUp | null>(null);
  const [isEditOfferModalOpen, setIsEditOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);


  const [dialog, setDialog] = useState<DialogState>({ 
      isOpen: false, title: '', message: '', isConfirmation: false, onConfirm: null 
  });
  
  const existingOfferIds = useMemo(() => new Set(offers.map(o => o.id)), [offers]);

  useEffect(() => {
    setIsDataLoading(true);
    
    const offersQuery = query(collection(db, 'offers'), orderBy('proyecto'));
    const unsubOffers = onSnapshot(offersQuery, (snapshot) => {
        const offersData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Offer));
        setOffers(offersData);
        setIsDataLoading(false); 
    }, (error) => {
        console.error("Error fetching offers: ", error);
        setIsDataLoading(false);
    });

    const followUpsQuery = query(collection(db, 'followUps'), orderBy('fechaAct', 'desc'));
    const unsubFollowUps = onSnapshot(followUpsQuery, (snapshot) => {
        const followUpsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as FollowUp));
        setFollowUps(followUpsData);
    });

    const statusesQuery = query(collection(db, 'statuses'), orderBy('name'));
    const unsubStatuses = onSnapshot(statusesQuery, (snapshot) => {
        const statusesData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Status));
        setStatuses(statusesData);
    });

    return () => {
        unsubOffers();
        unsubFollowUps();
        unsubStatuses();
    };
  }, []);


  const handleRegisterOffer = async (newOfferData: Omit<Offer, 'ultAct'>) => {
    const offerRef = doc(db, 'offers', newOfferData.id);
    const docSnap = await getDoc(offerRef);

    if (docSnap.exists()) {
      setDialog({
        isOpen: true,
        title: 'Error al Registrar',
        message: `El número de oferta "${newOfferData.id}" ya existe. Por favor, introduzca un número diferente.`,
        isConfirmation: false,
        onConfirm: null,
      });
      return;
    }
      
    const offerWithDate = {
        ...newOfferData,
        ultAct: newOfferData.fechaRfq,
    };
    await setDoc(offerRef, offerWithDate);
  };
  
    const handleOpenEditOfferModal = (offer: Offer) => {
        setEditingOffer(offer);
        setIsEditOfferModalOpen(true);
    };

    const handleEditOffer = async (updatedOfferData: Omit<Offer, 'ultAct'>) => {
        const offerRef = doc(db, 'offers', updatedOfferData.id);
        const offerWithDate = {
            ...updatedOfferData,
            ultAct: new Date().toISOString().split('T')[0],
        };
        await updateDoc(offerRef, offerWithDate as any);
    };

    const handleDeleteOffer = (offer: Offer) => {
        setDialog({
            isOpen: true,
            title: 'Confirmar Eliminación de Oferta',
            message: `¿Estás seguro de que quieres eliminar la oferta "${offer.id} - ${offer.proyecto}"? Esta acción no se puede deshacer y también eliminará todo su historial de seguimiento.`,
            isConfirmation: true,
            onConfirm: async () => {
                const followUpsQuery = query(collection(db, 'followUps'), where('offerId', '==', offer.id));
                const followUpsSnapshot = await getDocs(followUpsQuery);

                const batch = writeBatch(db);
                
                const offerRef = doc(db, 'offers', offer.id);
                batch.delete(offerRef);

                followUpsSnapshot.forEach(doc => {
                    batch.delete(doc.ref);
                });

                await batch.commit();
                
                setDialog({ isOpen: false, title: '', message: '', isConfirmation: false, onConfirm: null });
            }
        });
    };

  const handleUpdateOffer = async (newFollowUpData: Omit<FollowUp, 'id'>) => {
    await addDoc(collection(db, 'followUps'), newFollowUpData);
    const offerRef = doc(db, 'offers', newFollowUpData.offerId);
    await updateDoc(offerRef, { ultAct: newFollowUpData.fechaAct });
  };
  
  const handleEditFollowUp = async (updatedFollowUp: FollowUp) => {
      const followUpRef = doc(db, 'followUps', updatedFollowUp.id);
      await updateDoc(followUpRef, { comentario: updatedFollowUp.comentario });
  };
  
  const handleDeleteFollowUp = (followUpId: string) => {
      setDialog({
          isOpen: true,
          title: 'Confirmar Eliminación',
          message: '¿Estás seguro de que quieres eliminar este comentario de seguimiento? Esta acción no se puede deshacer.',
          isConfirmation: true,
          onConfirm: async () => {
              await deleteDoc(doc(db, 'followUps', followUpId));
              setDialog({ isOpen: false, title: '', message: '', isConfirmation: false, onConfirm: null });
          }
      });
  };
  
  const handleOpenEditFollowUpModal = (followUp: FollowUp) => {
      setEditingFollowUp(followUp);
      setIsEditFollowUpModalOpen(true);
  };
  
  const handleUpdateOfferStatus = async (offerId: string, newStatus: string) => {
      const offerRef = doc(db, 'offers', offerId);
      await updateDoc(offerRef, { estado: newStatus });
  };
  
  const handleAddStatus = async (newStatusData: Omit<Status, 'id'>) => {
      await addDoc(collection(db, 'statuses'), newStatusData);
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
        onConfirm: async () => {
            await deleteDoc(doc(db, 'statuses', statusId));
            setDialog({ isOpen: false, title: '', message: '', isConfirmation: false, onConfirm: null });
        }
    });
  }
  
  const handleImportOffers = async (offersToImport: Omit<Offer, 'ultAct'>[]) => {
      const batch = writeBatch(db);
      
      offersToImport.forEach(newOfferData => {
          const offerRef = doc(db, 'offers', newOfferData.id);
          const offerWithDate = {
              ...newOfferData,
              ultAct: newOfferData.fechaRfq,
          };
          batch.set(offerRef, offerWithDate);
      });

      try {
        await batch.commit();
        setDialog({
            isOpen: true,
            title: 'Importación Completada',
            message: `${offersToImport.length} nueva(s) oferta(s) importada(s) con éxito.`,
            isConfirmation: false,
            onConfirm: null,
        });
      } catch (error) {
        console.error('Error al importar ofertas desde CSV:', error);
        setDialog({
            isOpen: true,
            title: 'Error de Importación',
            message: 'Ocurrió un error al guardar los datos en la base de datos. Por favor, asegúrese de que todos los datos en el archivo CSV son correctos (especialmente los formatos de fecha y números) y vuelva a intentarlo.',
            isConfirmation: false,
            onConfirm: null,
        });
      }
  };
  
  if (isDataLoading) {
      return (
          <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
              <p className="text-xl text-gray-800 dark:text-white">Cargando datos...</p>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Header 
        onRegisterClick={() => setIsRegisterModalOpen(true)}
        onUpdateClick={() => setIsUpdateModalOpen(true)}
        onImportClick={() => setIsImportModalOpen(true)}
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
                <OfferTable 
                    offers={offers} 
                    followUps={followUps} 
                    statuses={statuses} 
                    onUpdateOfferStatus={handleUpdateOfferStatus}
                    onEditOffer={handleOpenEditOfferModal}
                    onDeleteOffer={handleDeleteOffer} 
                />
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
       <ImportCSVModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSubmit={handleImportOffers}
        existingOfferIds={existingOfferIds}
       />
      <EditOfferModal
        isOpen={isEditOfferModalOpen}
        onClose={() => setIsEditOfferModalOpen(false)}
        onSubmit={handleEditOffer}
        statuses={statuses}
        offer={editingOffer}
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