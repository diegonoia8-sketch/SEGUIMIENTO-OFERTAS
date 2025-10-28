import React, { useState, useMemo } from 'react';
import { Offer, FollowUp, Status } from '../types';
import FilterClearIcon from './icons/FilterClearIcon';

interface OfferTableProps {
  offers: Offer[];
  followUps: FollowUp[];
  statuses: Status[];
  onUpdateOfferStatus: (offerId: number, newStatus: string) => void;
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const getTextColorForBackground = (hexColor: string) => {
    if (!hexColor || hexColor.length < 7) return '#000000';
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

const OfferTable: React.FC<OfferTableProps> = ({ offers, followUps, statuses, onUpdateOfferStatus }) => {
  const [filters, setFilters] = useState<Partial<Record<keyof Offer, string>>>({});

  const handleFilterChange = (key: keyof Offer, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const clearFilters = () => {
    setFilters({});
  }

  const getLatestFollowUp = (offerId: number) => {
    const offerFollowUps = followUps
      .filter((f) => f.offerId === offerId)
      .sort((a, b) => new Date(b.fechaAct).getTime() - new Date(a.fechaAct).getTime());
    return offerFollowUps[0]?.comentario || 'N/A';
  };
  
  const statusColorMap = useMemo(() => new Map(statuses.map(s => [s.name, s.color])), [statuses]);

  const uniqueValues = useMemo(() => {
    const unique: { [key: string]: Set<string> } = {
        cliente: new Set(),
        responsable: new Set(),
    };
    offers.forEach(offer => {
        unique.cliente.add(offer.cliente);
        unique.responsable.add(offer.responsable);
    });
    return {
        cliente: Array.from(unique.cliente).sort(),
        responsable: Array.from(unique.responsable).sort(),
    };
  }, [offers]);


  const filteredOffers = useMemo(() => {
    return offers.filter(offer => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        const offerValue = offer[key as keyof Offer];
        if (offerValue === null || offerValue === undefined) return false;
        
        return String(offerValue).toLowerCase().includes(String(value).toLowerCase());
      });
    });
  }, [offers, filters]);

  const FilterInput = ({ column }: { column: keyof Offer }) => (
    <input
      type="text"
      value={filters[column] || ''}
      onChange={(e) => handleFilterChange(column, e.target.value)}
      className="w-full text-xs p-1 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
    />
  );

  const FilterSelect = ({ column, options }: { column: keyof Offer, options: string[] }) => (
    <select
        value={filters[column] || ''}
        onChange={(e) => handleFilterChange(column, e.target.value)}
        className="w-full text-xs p-1 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
    >
        <option value="">Todos</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  );

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Listado de Ofertas</h2>
         <button onClick={clearFilters} className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline">
            <FilterClearIcon className="w-4 h-4 mr-1" />
            Limpiar Filtros
        </button>
      </div>
       <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">Nº Oferta</th>
              <th scope="col" className="px-6 py-3">Estado</th>
              <th scope="col" className="px-6 py-3">Cliente</th>
              <th scope="col" className="px-6 py-3">Destino</th>
              <th scope="col" className="px-6 py-3">Proyecto</th>
              <th scope="col" className="px-6 py-3">Fecha RFQ</th>
              <th scope="col" className="px-6 py-3">Responsable</th>
              <th scope="col" className="px-6 py-3">Ult Act</th>
              <th scope="col" className="px-6 py-3">Vol Pico</th>
              <th scope="col" className="px-6 py-3">Vol Tot</th>
              <th scope="col" className="px-6 py-3">SOP</th>
              <th scope="col" className="px-6 py-3">Duración</th>
              <th scope="col" className="px-6 py-3">Comentarios</th>
            </tr>
            <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="px-2 py-1"><FilterInput column="id"/></th>
                <th className="px-2 py-1">
                    <select
                        value={filters.estado || ''}
                        onChange={(e) => handleFilterChange('estado', e.target.value)}
                        className="w-full text-xs p-1 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="">Todos</option>
                        {statuses.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                </th>
                <th className="px-2 py-1"><FilterSelect column="cliente" options={uniqueValues.cliente} /></th>
                <th className="px-2 py-1"><FilterInput column="destino"/></th>
                <th className="px-2 py-1"><FilterInput column="proyecto"/></th>
                <th className="px-2 py-1"><FilterInput column="fechaRfq"/></th>
                <th className="px-2 py-1"><FilterSelect column="responsable" options={uniqueValues.responsable} /></th>
                <th className="px-2 py-1"><FilterInput column="ultAct"/></th>
                <th className="px-2 py-1"><FilterInput column="volPico"/></th>
                <th className="px-2 py-1"><FilterInput column="volTot"/></th>
                <th className="px-2 py-1"><FilterInput column="sop"/></th>
                <th className="px-2 py-1"><FilterInput column="duracion"/></th>
                <th className="px-2 py-1"></th>
            </tr>
          </thead>
          <tbody>
            {filteredOffers.length > 0 ? (
                filteredOffers.map((offer) => {
                    const statusColor = statusColorMap.get(offer.estado) || '#FFFFFF';
                    const textColor = getTextColorForBackground(statusColor);
                    return (
                      <tr key={offer.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{offer.id}</td>
                        <td className="px-6 py-4">
                            <select 
                                value={offer.estado}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onUpdateOfferStatus(offer.id, e.target.value)}
                                style={{ backgroundColor: statusColor, color: textColor }}
                                className="px-2 py-1 text-xs font-medium rounded-full border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 appearance-none bg-transparent"
                            >
                                {statuses.map(status => (
                                    <option key={status.id} value={status.name} style={{backgroundColor: '#FFFFFF', color: '#000000'}}>{status.name}</option>
                                ))}
                            </select>
                        </td>
                        <td className="px-6 py-4">{offer.cliente}</td>
                        <td className="px-6 py-4">{offer.destino}</td>
                        <td className="px-6 py-4">{offer.proyecto}</td>
                        <td className="px-6 py-4">{formatDate(offer.fechaRfq)}</td>
                        <td className="px-6 py-4">{offer.responsable}</td>
                        <td className="px-6 py-4">{formatDate(offer.ultAct)}</td>
                        <td className="px-6 py-4 text-right">{offer.volPico?.toLocaleString('es-ES') || '-'}</td>
                        <td className="px-6 py-4 text-right">{offer.volTot?.toLocaleString('es-ES') || '-'}</td>
                        <td className="px-6 py-4">{offer.sop}</td>
                        <td className="px-6 py-4">{offer.duracion}</td>
                        <td className="px-6 py-4 max-w-xs truncate" title={getLatestFollowUp(offer.id)}>
                            {getLatestFollowUp(offer.id)}
                        </td>
                      </tr>
                    )
                })
            ) : (
                <tr>
                    <td colSpan={13} className="text-center py-10">
                        <p className="text-gray-500 dark:text-gray-400">No se encontraron ofertas que coincidan con los filtros.</p>
                    </td>
                </tr>
            )}
          </tbody>
        </table>
       </div>
    </div>
  );
};

export default OfferTable;
