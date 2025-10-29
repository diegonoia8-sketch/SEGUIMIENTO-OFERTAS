
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Offer } from '../types.ts';
import SearchIcon from './icons/SearchIcon.tsx';

interface OfferSearchInputProps {
  offers: Offer[];
  selectedOffer: Offer | null;
  onOfferSelect: (offer: Offer | null) => void;
  label: string;
  placeholder: string;
}

const OfferSearchInput: React.FC<OfferSearchInputProps> = ({ offers, selectedOffer, onOfferSelect, label, placeholder }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set search term when an offer is selected externally or cleared
    setSearchTerm(selectedOffer ? `${selectedOffer.id} - ${selectedOffer.proyecto}` : '');
  }, [selectedOffer]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredOffers = useMemo(() => {
    if (!searchTerm) return [];
    // If an offer is already selected, don't show the dropdown
    if (selectedOffer && `${selectedOffer.id} - ${selectedOffer.proyecto}` === searchTerm) return [];

    return offers.filter(
      (offer) =>
        offer.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.proyecto.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, offers, selectedOffer]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    onOfferSelect(null); // Clear selection when user types
    setIsDropdownOpen(true);
  };

  const handleOfferClick = (offer: Offer) => {
    onOfferSelect(offer);
    setSearchTerm(`${offer.id} - ${offer.proyecto}`);
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative" ref={searchContainerRef}>
      <label htmlFor="offer-search-input" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <SearchIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </div>
        <input
          type="text"
          id="offer-search-input"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsDropdownOpen(true)}
          required
          autoComplete="off"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          placeholder={placeholder}
        />
      </div>

      {isDropdownOpen && searchTerm && (!selectedOffer || searchTerm !== `${selectedOffer.id} - ${selectedOffer.proyecto}`) && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto dark:bg-gray-700 dark:border-gray-600">
          {filteredOffers.length > 0 ? (
            filteredOffers.map((offer) => (
              <li
                key={offer.id}
                onClick={() => handleOfferClick(offer)}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
              >
                {offer.id} - {offer.proyecto}
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-gray-500 dark:text-gray-400">
              No se encontraron ofertas.
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default OfferSearchInput;