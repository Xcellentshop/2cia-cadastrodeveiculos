import React, { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Personnel, RANKS, CITIES, SECTORS, PLATOONS } from '../../types/personnel';
import { toast } from 'react-hot-toast';
import { INITIAL_DATA } from '../../scripts/seedPersonnel';

const PersonnelManagement: React.FC = () => {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [formData, setFormData] = useState<Partial<Personnel>>({
    rank: '',
    name: '',
    rg: '',
    phone: '',
    city: '',
    platoon: '',
    sector: ''
  });

  useEffect(() => {
    fetchPersonnel();
  }, []);

  const fetchPersonnel = async () => {
    try {
      const personnelRef = collection(db, 'personnel');
      const querySnapshot = await getDocs(personnelRef);
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
    } catch (error) {
      console.error('Error fetching personnel:', error);
      toast.error('Erro ao carregar efetivo');
    } finally {
      setLoading(false);
    }
  };

  const filteredSuggestions = useMemo(() => {
    if (!searchTerm) return [];
    return INITIAL_DATA.filter(person =>
      person.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10);
  }, [searchTerm]);

  const handleNameSelect = (selectedPerson: typeof INITIAL_DATA[0]) => {
    setFormData(prev => ({
      ...prev,
      name: selectedPerson.name,
      rg: selectedPerson.rg,
      phone: selectedPerson.phone
    }));
    setSearchTerm(selectedPerson.name);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const timestamp = new Date().toISOString();
      const personnelData = {
        ...formData,
        createdAt: timestamp,
        updatedAt: timestamp
      } as Personnel;

      if (editingId) {
        const docRef = doc(db, 'personnel', editingId);
        await updateDoc(docRef, { ...personnelData, updatedAt: timestamp });
        toast.success('Policial atualizado com sucesso');
      } else {
        await addDoc(collection(db, 'personnel'), personnelData);
        toast.success('Policial adicionado com sucesso');
      }

      setFormData({
        rank: '',
        name: '',
        rg: '',
        phone: '',
        city: '',
        platoon: '',
        sector: ''
      });
      setSearchTerm('');
      setEditingId(null);
      fetchPersonnel();
    } catch (error) {
      console.error('Error saving personnel:', error);
      toast.error('Erro ao salvar policial');
    }
  };

  const handleEdit = (person: Personnel) => {
    setEditingId(person.id);
    setFormData({
      rank: person.rank,
      name: person.name,
      rg: person.rg,
      phone: person.phone,
      city: person.city,
      platoon: person.platoon,
      sector: person.sector
    });
    setSearchTerm(person.name);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este policial?')) {
      try {
        await deleteDoc(doc(db, 'personnel', id));
        toast.success('Policial excluído com sucesso');
        fetchPersonnel();
      } catch (error) {
        console.error('Error deleting personnel:', error);
        toast.error('Erro ao excluir policial');
      }
    }
  };

  const handleClear = () => {
    setFormData({
      rank: '',
      name: '',
      rg: '',
      phone: '',
      city: '',
      platoon: '',
      sector: ''
    });
    setSearchTerm('');
  };

  const handleSuggestionClick = (suggestion: typeof INITIAL_DATA[0]) => {
    setFormData(prev => ({
      ...prev,
      name: suggestion.name,
      rg: suggestion.rg,
      phone: suggestion.phone
    }));
    setSearchTerm(suggestion.name);
    setShowSuggestions(false);
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
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
        Gerenciamento de Efetivo
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="rank" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Posto/Graduação
            </label>
            <select
              id="rank"
              name="rank"
              required
              value={formData.rank}
              onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 text-gray-900"
            >
              <option value="" className="dark:text-gray-200">Selecione...</option>
              {RANKS.map((rank) => (
                <option key={rank} value={rank} className="dark:text-gray-200 text-gray-900">{rank}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Nome
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 text-gray-900"
            />
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 rounded-md shadow-lg">
                <ul className="max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                  {filteredSuggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white dark:text-gray-200"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="rg" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              RG
            </label>
            <input
              type="text"
              id="rg"
              name="rg"
              value={formData.rg}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 text-gray-900"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Telefone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 text-gray-900"
            />
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Cidade
            </label>
            <select
              id="city"
              name="city"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 text-gray-900"
            >
              <option value="" className="dark:text-gray-200">Selecione...</option>
              {CITIES.map((city) => (
                <option key={city} value={city} className="dark:text-gray-200 text-gray-900">{city}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="platoon" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Pelotão
            </label>
            <select
              id="platoon"
              name="platoon"
              required
              value={formData.platoon}
              onChange={(e) => setFormData({ ...formData, platoon: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 text-gray-900"
            >
              <option value="" className="dark:text-gray-200">Selecione...</option>
              {PLATOONS.map((platoon) => (
                <option key={platoon} value={platoon} className="dark:text-gray-200 text-gray-900">{platoon}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="sector" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Setor
            </label>
            <select
              id="sector"
              name="sector"
              required
              value={formData.sector}
              onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 text-gray-900"
            >
              <option value="" className="dark:text-gray-200">Selecione...</option>
              {SECTORS.map((sector) => (
                <option key={sector} value={sector} className="dark:text-gray-200 text-gray-900">{sector}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Limpar
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cadastrar
          </button>
        </div>
      </form>

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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {personnel.map((person) => (
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(person)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => person.id && handleDelete(person.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PersonnelManagement;
