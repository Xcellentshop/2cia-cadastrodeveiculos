import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Vehicle, City, VehicleType } from '../types';
import { FileText, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default function Reports() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<City | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'vehicles'));
      const vehicleData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Vehicle[];
      setVehicles(vehicleData);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterVehicles = () => {
    return vehicles.filter(vehicle => {
      const matchesCity = !selectedCity || vehicle.city === selectedCity;
      const matchesDateRange = (!startDate && !endDate) || 
        (vehicle.inspectionDate >= startDate && vehicle.inspectionDate <= endDate);
      return matchesCity && matchesDateRange;
    });
  };

  const generateStats = (filteredVehicles: Vehicle[]) => {
    const stats = {
      total: filteredVehicles.length,
      byType: {} as Record<VehicleType, number>,
      byKey: { yes: 0, no: 0 },
      byState: {} as Record<string, number>,
      byCity: {} as Record<City, number>
    };

    filteredVehicles.forEach(vehicle => {
      // Count by type
      stats.byType[vehicle.vehicleType] = (stats.byType[vehicle.vehicleType] || 0) + 1;
      
      // Count by key
      vehicle.hasKey ? stats.byKey.yes++ : stats.byKey.no++;
      
      // Count by state
      stats.byState[vehicle.state] = (stats.byState[vehicle.state] || 0) + 1;
      
      // Count by city
      stats.byCity[vehicle.city] = (stats.byCity[vehicle.city] || 0) + 1;
    });

    return stats;
  };

  const exportToPDF = (filteredVehicles: Vehicle[]) => {
    const doc = new jsPDF();
    const stats = generateStats(filteredVehicles);

    doc.setFontSize(16);
    doc.text('Relatório de Veículos', 14, 20);

    doc.setFontSize(12);
    doc.text(`Total de Veículos: ${stats.total}`, 14, 30);

    let yPos = 40;

    // Add vehicle types statistics
    doc.text('Por Tipo de Veículo:', 14, yPos);
    yPos += 10;
    Object.entries(stats.byType).forEach(([type, count]) => {
      doc.text(`${type}: ${count}`, 20, yPos);
      yPos += 6;
    });

    // Add key statistics
    yPos += 5;
    doc.text('Com Chave:', 14, yPos);
    doc.text(`Sim: ${stats.byKey.yes}`, 20, yPos + 6);
    doc.text(`Não: ${stats.byKey.no}`, 20, yPos + 12);

    // Add state statistics
    yPos += 20;
    doc.text('Por Estado:', 14, yPos);
    yPos += 6;
    Object.entries(stats.byState).forEach(([state, count]) => {
      doc.text(`${state}: ${count}`, 20, yPos);
      yPos += 6;
    });

    doc.save('relatorio-veiculos.pdf');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const filteredVehicles = filterVehicles();
  const stats = generateStats(filteredVehicles);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Relatórios</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cidade
            </label>
            <select
              className="w-full p-2 border rounded-md"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value as City)}
            >
              <option value="">Todas as cidades</option>
              {['Medianeira', 'SMI', 'Missal', 'Itaipulândia', 'Serranópolis'].map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Inicial
            </label>
            <input
              type="date"
              className="w-full p-2 border rounded-md"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Final
            </label>
            <input
              type="date"
              className="w-full p-2 border rounded-md"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={() => exportToPDF(filteredVehicles)}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition flex items-center justify-center"
        >
          <Download className="h-5 w-5 mr-2" />
          Exportar PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Total de Veículos</h3>
          <p className="text-3xl font-bold text-indigo-600">{stats.total}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Com Chave</h3>
          <div className="space-y-2">
            <p>Sim: <span className="font-bold text-green-600">{stats.byKey.yes}</span></p>
            <p>Não: <span className="font-bold text-red-600">{stats.byKey.no}</span></p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Por Tipo</h3>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {Object.entries(stats.byType).map(([type, count]) => (
              <p key={type}>
                {type}: <span className="font-bold text-indigo-600">{count}</span>
              </p>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Por Estado</h3>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {Object.entries(stats.byState).map(([state, count]) => (
              <p key={state}>
                {state}: <span className="font-bold text-indigo-600">{count}</span>
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}