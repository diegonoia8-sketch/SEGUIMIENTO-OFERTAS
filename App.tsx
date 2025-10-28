import React, { useState, useEffect } from 'react';
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
import Login from './components/Login';
import { db, auth } from './firebase';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';

interface DialogState {
    isOpen: boolean;
    title: string;
    message: string;
    isConfirmation: boolean;
    onConfirm: (() => void) | null;
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [offers, setOffers] = useState<Offer[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'offers' | 'config'>('offers');

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isEditFollowUpModalOpen, setIsEditFollowUpModalOpen] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState<FollowUp | null>(null);

  const [dialog, setDialog] = useState<DialogState>({ 
      isOpen: false, title: '', message: '', isConfirmation: false, onConfirm: null 
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setOffers([]);
      setFollowUps([]);
      setStatuses([]);
      setIsDataLoading(false);
      return;
    }

    setIsDataLoading(true);
    
    const offersQuery = query(collection(db, 'offers'), orderBy('proyecto'));
    const unsubOffers = onSnapshot(offersQuery, (snapshot) => {
        const offersData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Offer));
        setOffers(offersData);
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
  }, [user]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Authentication Error: ", error);
      alert("No se pudo iniciar sesión. Por favor, intente de nuevo.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error: ", error);
    }
  };


  const handleRegisterOffer = async (newOfferData: Omit<Offer, 'id' | 'ultAct'>) => {
    const offerWithDate = {
        ...newOfferData,
        ultAct: newOfferData.fechaRfq,
    };
    await addDoc(collection(db, 'offers'), offerWithDate);
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
  
  if (isAuthLoading) {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <p className="text-xl text-gray-800 dark:text-white">Verificando autenticación...</p>
        </div>
    );
  }

  if (!user) {
      return <Login onLogin={handleLogin} />;
  }

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
        user={user}
        onRegisterClick={() => setIsRegisterModalOpen(true)}
        onUpdateClick={() => setIsUpdateModalOpen(true)}
        onLogout={handleLogout}
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
