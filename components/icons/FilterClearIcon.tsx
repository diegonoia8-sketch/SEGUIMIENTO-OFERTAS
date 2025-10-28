import React from 'react';

const FilterClearIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    {...props}
   >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-1.2 0-2.3.4-3.2 1.1A6.7 6.7 0 005.1 8.3c-.9 1.8-1.1 3.8-1 5.7.2 2.2 1.2 4.3 2.9 5.8 1.7 1.5 3.9 2.3 6.1 2.2 2.2-.1 4.3-.9 5.9-2.4a8.3 8.3 0 002.5-6.1c.1-2.2-.6-4.3-2-6-1.4-1.7-3.4-2.8-5.6-3z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.3 9.7l-4.6 4.6m0-4.6l4.6 4.6" />
  </svg>
);

export default FilterClearIcon;
