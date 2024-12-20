import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Personnel, Sector, SECTORS } from '../../types/personnel';
import { toast } from 'react-hot-toast';

const PersonnelSectors: React.FC = () => {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSector, setSelectedSector] = useState<Sector | ''>('');
  const [filteredPersonnel, setFilteredPersonnel] = useState<Personnel[]>([]);

  useEffect(() => {
    fetchPersonnel();
  }, []);

  useEffect(() => {
    filterPersonnelBySector();
  }, [selectedSector, personnel]);

  const fetchPersonnel = async () => {
    try {
      const personnelRef = collection(db, 'personnel');
      const q = query(personnelRef, orderBy('name'));
      const querySnapshot = await getDocs(q);
      const personnelData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Personnel[];

      const sortedData = personnelData.sort((a, b) => {
        if (a.rank < b.rank) return -1;
        if (a.rank > b.rank) return 1;
        return a.name.localeCompare(b.name);
      });

      setPersonnel(sortedData);
      setFilteredPersonnel(sortedData);
    } catch (error) {
      console.error('Error fetching personnel:', error);
      toast.error('Erro ao carregar efetivo');
    } finally {
      setLoading(false);
    }
  };

  const filterPersonnelBySector = () => {
    if (!selectedSector) {
      setFilteredPersonnel(personnel);
    } else {
      const filtered = personnel.filter(person => person.sector === selectedSector);
      setFilteredPersonnel(filtered);
    }
  };

  const getSectorStats = () => {
    const stats = {} as Record<Sector, number>;
    SECTORS.forEach(sector => {
      stats[sector] = personnel.filter(person => person.sector === sector).length;
    });
    return stats;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const sectorStats = getSectorStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Efetivo por Setores
        </h2>
        <select
          className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          value={selectedSector}
          onChange={(e) => setSelectedSector(e.target.value as Sector)}
        >
          <option value="">Todos os setores</option>
          {SECTORS.map(sector => (
            <option key={sector} value={sector}>{sector}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SECTORS.map(sector => (
          <div
            key={sector}
            className={`p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md ${
              selectedSector === sector ? 'ring-2 ring-indigo-500' : ''
            }`}
            onClick={() => setSelectedSector(sector)}
            style={{ cursor: 'pointer' }}
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              {sector}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {sectorStats[sector]} policiais
            </p>
          </div>
        ))}
      </div>

      {filteredPersonnel.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Posto/Graduação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    RG
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Telefone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Cidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Pelotão
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Setor
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPersonnel.map((person) => (
                  <tr key={person.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {person.rank}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {person.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {person.rg}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {person.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {person.city}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {person.platoon}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {person.sector}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-600 dark:text-gray-300">
            {selectedSector
              ? `Nenhum policial encontrado no setor ${selectedSector}`
              : 'Nenhum policial cadastrado'}
          </p>
        </div>
      )}
    </div>
  );
};

export default PersonnelSectors;
