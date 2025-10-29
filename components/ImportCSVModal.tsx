import React, { useState, useMemo } from 'react';
import { Offer } from '../types.ts';
import Modal from './Modal.tsx';
import UploadIcon from './icons/UploadIcon.tsx';

interface ImportCSVModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (offers: Omit<Offer, 'ultAct'>[]) => void;
  existingOfferIds: Set<string>;
}

type ParsedOffer = Omit<Offer, 'ultAct'> & { status: 'new' | 'duplicate' | 'error'; error?: string };

// Mapeo de cabeceras canónicas a posibles variaciones en el archivo CSV (en minúsculas)
const headerMapping: { [key in keyof Partial<Offer>]: string[] } = {
  id: ['id', 'nº oferta', 'no. oferta', 'no oferta', 'numero oferta'],
  estado: ['estado'],
  cliente: ['cliente'],
  destino: ['destino'],
  proyecto: ['proyecto'],
  fechaRfq: ['fecharfq', 'fecha rfq'],
  responsable: ['responsable'],
  sop: ['sop'],
  duracion: ['duracion', 'duración'],
  volPico: ['volpico', 'vol pico'],
  volTot: ['voltot', 'vol total'],
};

const canonicalRequiredHeaders: (keyof Offer)[] = ['id', 'proyecto', 'fechaRfq', 'responsable'];


const ImportCSVModal: React.FC<ImportCSVModalProps> = ({ isOpen, onClose, onSubmit, existingOfferIds }) => {
  const [parsedOffers, setParsedOffers] = useState<ParsedOffer[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleClose = () => {
    setParsedOffers([]);
    setFileName('');
    setError('');
    onClose();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setParsedOffers([]);
    setError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      let text = e.target?.result as string;
      if (!text) {
          setError('No se pudo leer el contenido del archivo.');
          return;
      }
      
      if (text.charCodeAt(0) === 0xFEFF) {
        text = text.substring(1);
      }

      const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');

      if (lines.length < 2) {
        setError('El archivo CSV está vacío o solo contiene la cabecera.');
        return;
      }
      
      const headerLine = lines[0];
      const delimiter = headerLine.includes(';') ? ';' : ',';
      const csvHeaders = headerLine.split(delimiter).map(h => h.trim().toLowerCase());

      const columnIndexMap: { [key in keyof Offer]?: number } = {};
      const foundHeaders = new Set<string>();

      csvHeaders.forEach((csvHeader, index) => {
          for (const canonicalHeader in headerMapping) {
              const variations = headerMapping[canonicalHeader as keyof typeof headerMapping] || [];
              if (variations.includes(csvHeader)) {
                  columnIndexMap[canonicalHeader as keyof typeof columnIndexMap] = index;
                  foundHeaders.add(canonicalHeader);
                  break; 
              }
          }
      });
      
      const missingHeaders = canonicalRequiredHeaders.filter(h => !foundHeaders.has(h));
      if (missingHeaders.length > 0) {
        setError(`Faltan columnas requeridas o sus nombres no se reconocen. Columnas no encontradas: ${missingHeaders.join(', ')}. Por favor, revise las cabeceras de su archivo.`);
        return;
      }

      const offers: ParsedOffer[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(delimiter);
        const rowData: any = {};
        
        for (const canonicalHeader in columnIndexMap) {
            const index = columnIndexMap[canonicalHeader as keyof typeof columnIndexMap];
            if (index !== undefined && index < values.length) {
                let value = values[index]?.trim() || '';
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.substring(1, value.length - 1).trim();
                }
                rowData[canonicalHeader] = value;
            }
        }
        
        const missingField = canonicalRequiredHeaders.find(field => !rowData[field]);
        if (missingField) {
          offers.push({ ...rowData, id: rowData.id || `Fila ${i+1}`, status: 'error', error: `Falta el campo obligatorio: ${missingField}` } as ParsedOffer);
          continue;
        }

        const offerId = rowData.id;
        if (offerId.includes('/')) {
            offers.push({ ...rowData, id: offerId, status: 'error', error: `Nº Oferta inválido: no puede contener '/'.` } as ParsedOffer);
            continue;
        }
        
        let isoDate = '';
        const rawDate = rowData.fechaRfq;
        const dateParts = rawDate.split('/');
        if (dateParts.length === 3 && dateParts[0].length === 2 && dateParts[1].length === 2 && dateParts[2].length === 4) {
            const [day, month, year] = dateParts;
            isoDate = `${year}-${month}-${day}`;
            if (isNaN(new Date(isoDate).getTime())) {
                offers.push({ ...rowData, status: 'error', error: `Fecha RFQ inválida: '${rawDate}'.` } as ParsedOffer);
                continue;
            }
        } else {
            offers.push({ ...rowData, status: 'error', error: `Formato de fechaRfq incorrecto para '${rawDate}'. Use DD/MM/AAAA.` } as ParsedOffer);
            continue;
        }

        const parseNumber = (value: string | undefined): number | undefined => {
            if (value === undefined || value.trim() === '') return undefined;
            const cleanedValue = value.trim().replace(/\./g, '').replace(',', '.');
            const num = parseFloat(cleanedValue);
            return isNaN(num) ? undefined : num;
        };

        const offer: Omit<Offer, 'ultAct'> = {
            id: offerId,
            estado: rowData.estado || '',
            cliente: rowData.cliente || '',
            destino: rowData.destino || '',
            proyecto: rowData.proyecto,
            fechaRfq: isoDate,
            responsable: rowData.responsable,
            sop: rowData.sop || '',
            duracion: rowData.duracion || '',
            volPico: parseNumber(rowData.volPico),
            volTot: parseNumber(rowData.volTot),
        };

        if (existingOfferIds.has(offer.id)) {
            offers.push({ ...offer, status: 'duplicate' });
        } else {
            offers.push({ ...offer, status: 'new' });
        }
      }
      setParsedOffers(offers);
    };

    reader.onerror = () => {
      setError('Error al leer el archivo.');
    };

    reader.readAsText(file);
  };
  
  const handleSubmit = () => {
      const offersToSubmit = parsedOffers
        .filter(o => o.status === 'new')
        .map(({status, error, ...rest}) => rest);
      
      if(offersToSubmit.length > 0) {
          onSubmit(offersToSubmit);
      }
      handleClose();
  }

  const { newCount, duplicateCount, errorCount } = useMemo(() => {
    return parsedOffers.reduce((acc, offer) => {
        if(offer.status === 'new') acc.newCount++;
        else if(offer.status === 'duplicate') acc.duplicateCount++;
        else if(offer.status === 'error') acc.errorCount++;
        return acc;
    }, { newCount: 0, duplicateCount: 0, errorCount: 0});
  }, [parsedOffers]);


  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Importar Ofertas desde CSV">
        <div className="space-y-6">
            <div className="p-4 border border-dashed rounded-lg dark:border-gray-600 space-y-2">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">Instrucciones</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    El archivo CSV debe contener columnas para los campos requeridos (ej: Nº Oferta, Proyecto, Responsable, etc.). El sistema es flexible con los nombres y el orden.
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    La fecha <code className="text-xs bg-gray-100 dark:bg-gray-700 p-1 rounded">fechaRfq</code> debe estar en formato DD/MM/AAAA. Las ofertas con un Nº Oferta (id) que ya exista en el sistema serán omitidas.
                </p>
            </div>

            <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="file_input">Subir archivo</label>
                <input 
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" 
                    id="file_input" 
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                />
                 {fileName && <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">{fileName}</p>}
                 {error && <p className="mt-2 text-sm text-red-600 dark:text-red-500">{error}</p>}
            </div>

            {parsedOffers.length > 0 && (
                <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Vista Previa de Importación</h4>
                    <p className="text-sm mb-2">
                        <span className="text-green-600 dark:text-green-400 font-medium">{newCount} nuevas</span> | 
                        <span className="text-yellow-600 dark:text-yellow-400 font-medium"> {duplicateCount} duplicadas (se omitirán)</span> |
                        <span className="text-red-600 dark:text-red-500 font-medium"> {errorCount} con errores</span>
                    </p>
                    <div className="max-h-60 overflow-y-auto border rounded-lg dark:border-gray-600">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                                <tr>
                                    <th scope="col" className="px-4 py-2">Nº Oferta</th>
                                    <th scope="col" className="px-4 py-2">Proyecto</th>
                                    <th scope="col" className="px-4 py-2">Estado Importación</th>
                                </tr>
                            </thead>
                            <tbody>
                                {parsedOffers.map((offer, index) => (
                                    <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                        <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">{offer.id}</td>
                                        <td className="px-4 py-2">{offer.proyecto}</td>
                                        <td className="px-4 py-2">
                                            {offer.status === 'new' && <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-300">Nueva</span>}
                                            {offer.status === 'duplicate' && <span className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full dark:bg-yellow-900 dark:text-yellow-300">Duplicada</span>}
                                            {offer.status === 'error' && <span className="px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full dark:bg-red-900 dark:text-red-300" title={offer.error}>{offer.error}</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="flex justify-end pt-4 border-t dark:border-gray-700">
                <button type="button" onClick={handleClose} className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600 mr-2">
                    Cancelar
                </button>
                <button 
                    type="button" 
                    onClick={handleSubmit}
                    disabled={newCount === 0}
                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-50"
                >
                    <div className="flex items-center">
                        <UploadIcon className="w-4 h-4 mr-2" />
                        Importar {newCount > 0 ? newCount : ''} Ofertas
                    </div>
                </button>
            </div>
        </div>
    </Modal>
  );
};

export default ImportCSVModal;