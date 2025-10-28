
import React, { useMemo } from 'react';
import { Offer } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface OfferChartProps {
  offers: Offer[];
}

const OfferChart: React.FC<OfferChartProps> = ({ offers }) => {

  const chartData = useMemo(() => {
    const data: { [key: string]: number } = {};
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

    offers.forEach(offer => {
      const offerDate = new Date(offer.fechaRfq);
      if (offerDate >= fiveYearsAgo) {
        const monthYear = offerDate.toLocaleString('es-ES', { month: 'short', year: 'numeric' });
        if (data[monthYear]) {
          data[monthYear]++;
        } else {
          data[monthYear] = 1;
        }
      }
    });
    
    // Create a timeline of all months in the last 5 years
    const allMonthsData = [];
    let currentDate = new Date(fiveYearsAgo);
    const today = new Date();
    
    while(currentDate <= today) {
        const monthYear = currentDate.toLocaleString('es-ES', { month: 'short', year: 'numeric' });
        allMonthsData.push({
            name: monthYear,
            ofertas: data[monthYear] || 0
        });
        currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return allMonthsData;

  }, [offers]);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Ofertas por Mes (Últimos 5 Años)</h2>
        <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
                <BarChart
                data={chartData}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
                >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={'preserveStartEnd'} />
                <YAxis allowDecimals={false} />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        border: '1px solid #ccc',
                    }}
                 />
                <Legend />
                <Bar dataKey="ofertas" fill="#3b82f6" name="Nº de Ofertas" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
  );
};

export default OfferChart;
