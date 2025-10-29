import React, { useMemo } from 'react';
import { Offer } from '../types.ts';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface OfferChartProps {
  offers: Offer[];
}

const COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f97316', '#8b5cf6', '#ec4899'];

const OfferChart: React.FC<OfferChartProps> = ({ offers }) => {
  const { chartData, uniqueYears } = useMemo(() => {
    const dataByYearMonth: { [year: string]: { [month: number]: number } } = {};
    const years = new Set<string>();

    offers.forEach(offer => {
      if (offer.fechaRfq) {
        const offerDate = new Date(offer.fechaRfq);
        const year = offerDate.getFullYear().toString();
        const month = offerDate.getMonth(); // 0-11
        
        years.add(year);
        
        if (!dataByYearMonth[year]) {
          dataByYearMonth[year] = {};
        }
        if (!dataByYearMonth[year][month]) {
          dataByYearMonth[year][month] = 0;
        }
        dataByYearMonth[year][month]++;
      }
    });

    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const sortedYears = Array.from(years).sort((a, b) => parseInt(a) - parseInt(b));

    const finalChartData = monthNames.map((monthName, index) => {
      const monthData: { name: string; [key: string]: string | number } = { name: monthName };
      sortedYears.forEach(year => {
        monthData[year] = dataByYearMonth[year]?.[index] || 0;
      });
      return monthData;
    });

    return { chartData: finalChartData, uniqueYears: sortedYears };
  }, [offers]);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Evolución Anual de Ofertas por Mes</h2>
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid #ccc',
                color: '#333'
              }}
            />
            <Legend />
            {uniqueYears.map((year, index) => (
               <Line 
                  key={year} 
                  type="monotone" 
                  dataKey={year} 
                  stroke={COLORS[index % COLORS.length]} 
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default OfferChart;