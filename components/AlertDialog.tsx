import React from 'react';
import Modal from './Modal';

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (() => void) | null;
  title: string;
  message: string;
  isConfirmation: boolean;
}

const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isConfirmation,
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
        <div className="space-y-6">
            <p className="text-base leading-relaxed text-gray-600 dark:text-gray-300">
                {message}
            </p>
            <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-600 rounded-b">
                 {isConfirmation ? (
                    <>
                        <button
                            onClick={onClose}
                            type="button"
                            className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleConfirm}
                            type="button"
                            className="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-red-500 dark:hover:bg-red-600"
                        >
                            Confirmar
                        </button>
                    </>
                 ) : (
                    <button
                        onClick={onClose}
                        type="button"
                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700"
                    >
                        De Acuerdo
                    </button>
                 )}
            </div>
        </div>
    </Modal>
  );
};

export default AlertDialog;
