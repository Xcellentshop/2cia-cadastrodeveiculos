import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Personnel, Sector, SECTORS } from '../../types/personnel';
import { Edit, Trash2, Phone, ArrowRightLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Pagination from '../common/Pagination';
import { usePagination } from '../../hooks/usePagination';
import TransferModal from './TransferModal';

export default function PersonnelList() {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [filteredPersonnel, setFilteredPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSector, setSelectedSector] = useState<Sector | ''>('');
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null);
  const navigate = useNavigate();

  const {
    currentPage,
    totalPages,
    itemsPerPage,
    currentItems: paginatedPersonnel,
    totalItems,
    handlePageChange,
    handleItemsPerPageChange
  } = usePagination({ items: filteredPersonnel });

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
      toast.error('Erro ao carregar efetivo. Tentando novamente sem ordenação...');
      
      try {
        const snapshot = await getDocs(collection(db, 'personnel'));
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Personnel[];

        const sortedData = data.sort((a, b) => {
          if (a.rank < b.rank) return -1;
          if (a.rank > b.rank) return 1;
          return a.name.localeCompare(b.name);
        });

        setPersonnel(sortedData);
        setFilteredPersonnel(sortedData);
      } catch (secondError) {
        console.error('Error in fallback fetch:', secondError);
        toast.error('Erro ao carregar dados do efetivo');
      }
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

  const handleDelete = async (personnelId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este policial?')) {
      try {
        await deleteDoc(doc(db, 'personnel', personnelId));
        toast.success('Policial excluído com sucesso');
        fetchPersonnel();
      } catch (error) {
        console.error('Error deleting personnel:', error);
        toast.error('Erro ao excluir policial');
      }
    }
  };

  const handleTransferClick = (person: Personnel) => {
    setSelectedPersonnel(person);
    setIsTransferModalOpen(true);
  };

  const handleTransfer = async (newSector: Sector) => {
    if (!selectedPersonnel) return;

    try {
      const personnelRef = doc(db, 'personnel', selectedPersonnel.id!);
      await updateDoc(personnelRef, {
        sector: newSector,
        updatedAt: new Date().toISOString()
      });

      toast.success('Policial transferido com sucesso');
      setIsTransferModalOpen(false);
      fetchPersonnel();
    } catch (error) {
      console.error('Error transferring personnel:', error);
      toast.error('Erro ao transferir policial');
    }
  };

  const generateReport = () => {
    const reportData = filteredPersonnel.reduce((acc, person) => {
      const sector = person.sector;
      if (!acc[sector]) {
        acc[sector] = [];
      }
      acc[sector].push(person);
      return acc;
    }, {} as Record<string, Personnel[]>);

    const reportText = Object.entries(reportData)
      .map(([sector, personnel]) => {
        return `\n${sector} (${personnel.length} policiais):\n${personnel
          .map(p => `- ${p.rank} ${p.name} - RG: ${p.rg} - Tel: ${p.phone}`)
          .join('\n')}`;
      })
      .join('\n');

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_efetivo_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Efetivo Policial
        </h2>
        <div className="flex space-x-4">
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
          <button
            onClick={generateReport}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            Gerar Relatório
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedPersonnel.map((person) => (
          <div
            key={person.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {person.rank} {person.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  RG: {person.rg}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => navigate(`/personnel/edit/${person.id}`)}
                  className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                  title="Editar"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleTransferClick(person)}
                  className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                  title="Transferir"
                >
                  <ArrowRightLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(person.id!)}
                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  title="Excluir"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <Phone className="h-4 w-4 mr-2" />
                {person.phone}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Cidade: {person.city}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Pelotão: {person.platoon}
              </p>
              <div className="pt-2">
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                  {person.sector}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      {selectedPersonnel && (
        <TransferModal
          isOpen={isTransferModalOpen}
          onClose={() => setIsTransferModalOpen(false)}
          onTransfer={handleTransfer}
          currentSector={selectedPersonnel.sector}
        />
      )}
    </div>
  );
}