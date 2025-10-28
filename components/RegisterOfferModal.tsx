import React, { useState, useEffect } from 'react';
import { Offer, Status } from '../types';
import Modal from './Modal';

interface RegisterOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (offer: Omit<Offer, 'ultAct'>) => void;
  statuses: Status[];
}

const RegisterOfferModal: React.FC<RegisterOfferModalProps> = ({ isOpen, onClose, onSubmit, statuses }) => {
  const getInitialState = () => ({
    id: '',
    estado: statuses.length > 0 ? statuses[0].name : '',
    cliente: '',
    destino: '',
    proyecto: '',
    fechaRfq: '',
    responsable: '',
    volPico: '',
    volTot: '',
    sop: '',
    duracion: '',
  });

  const [formData, setFormData] = useState(getInitialState());

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialState());
    }
  }, [isOpen, statuses]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.cliente || !formData.proyecto || !formData.fechaRfq || !formData.responsable || !formData.sop || !formData.estado) {
        alert("Por favor, rellene todos los campos obligatorios.");
        return;
    }
    
    onSubmit({
      id: formData.id,
      estado: formData.estado,
      cliente: formData.cliente,
      destino: formData.destino,
      proyecto: formData.proyecto,
      fechaRfq: formData.fechaRfq,
      responsable: formData.responsable,
      sop: formData.sop,
      duracion: formData.duracion,
      volPico: formData.volPico ? Number(formData.volPico) : undefined,
      volTot: formData.volTot ? Number(formData.volTot) : undefined,
    });
    onClose();
  };
  
  const InputField = ({ label, name, type = 'text', required = false, value, onChange }: { label: string, name: string, type?: string, required?: boolean, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <div>
      <label htmlFor={name} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
      />
    </div>
  );


  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Nueva Oferta">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Nº Oferta" name="id" required value={formData.id} onChange={handleChange} />
            <InputField label="Cliente" name="cliente" required value={formData.cliente} onChange={handleChange} />
            <InputField label="Destino" name="destino" value={formData.destino} onChange={handleChange} />
            <InputField label="Proyecto" name="proyecto" required value={formData.proyecto} onChange={handleChange} />
            <InputField label="Responsable" name="responsable" required value={formData.responsable} onChange={handleChange} />
            <InputField label="Fecha RFQ" name="fechaRfq" type="date" required value={formData.fechaRfq} onChange={handleChange} />
            <InputField label="SOP (AAAA)" name="sop" type="text" required value={formData.sop} onChange={handleChange} />
            <InputField label="Duración" name="duracion" value={formData.duracion} onChange={handleChange} />
             <div>
                <label htmlFor="estado" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Estado <span className="text-red-500">*</span></label>
                <select id="estado" name="estado" value={formData.estado} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white">
                    {statuses.map(status => (
                        <option key={status.id} value={status.name}>{status.name}</option>
                    ))}
                </select>
            </div>
            <InputField label="Vol Pico (Opcional)" name="volPico" type="number" value={formData.volPico} onChange={handleChange} />
            <InputField label="Vol Total (Opcional)" name="volTot" type="number" value={formData.volTot} onChange={handleChange} />
        </div>
        <div className="flex justify-end pt-4">
            <button type="button" onClick={onClose} className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600 mr-2">
                Cancelar
            </button>
            <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                Registrar
            </button>
        </div>
      </form>
    </Modal>
  );
};

export default RegisterOfferModal;