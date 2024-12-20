import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Personnel, RANKS, CITIES, SECTORS, PLATOONS } from '../../types/personnel';
import { toast } from 'react-hot-toast';
import { INITIAL_DATA } from '../../scripts/seedPersonnel';

export default function PersonnelForm() {
  const navigate = useNavigate();
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
      await addDoc(collection(db, 'personnel'), {
        ...formData,
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      toast.success('Policial cadastrado com sucesso!');
      navigate('/personnel');
    } catch (error) {
      console.error('Error adding personnel:', error);
      toast.error('Erro ao cadastrar policial');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Cadastrar Policial
        </h2>
      </div>

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
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 text-gray-900"
            >
              <option value="" className="text-gray-900 dark:text-gray-200">Selecione...</option>
              {RANKS.map((rank) => (
                <option key={rank} value={rank} className="text-gray-900 dark:text-gray-200">{rank}</option>
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
              required
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 text-gray-900"
              list="suggestions"
            />
            <datalist id="suggestions">
              {filteredSuggestions.map((suggestion) => (
                <option key={suggestion.name} value={suggestion.name} className="dark:text-gray-200 text-gray-900" />
              ))}
            </datalist>
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 rounded-md shadow-lg">
                {filteredSuggestions.map((suggestion, index) => (
                  <div
                    key={suggestion.name}
                    className={`px-4 py-2 cursor-pointer text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600`}
                    onClick={() => handleNameSelect(suggestion)}
                  >
                    {suggestion.name}
                  </div>
                ))}
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
              required
              value={formData.rg}
              onChange={handleInputChange}
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
              required
              value={formData.phone}
              onChange={handleInputChange}
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
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 text-gray-900"
            >
              <option value="" className="text-gray-900 dark:text-gray-200">Selecione...</option>
              {CITIES.map((city) => (
                <option key={city} value={city} className="text-gray-900 dark:text-gray-200">{city}</option>
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
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 text-gray-900"
            >
              <option value="" className="text-gray-900 dark:text-gray-200">Selecione...</option>
              {PLATOONS.map((platoon) => (
                <option key={platoon} value={platoon} className="text-gray-900 dark:text-gray-200">{platoon}</option>
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
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 text-gray-900"
            >
              <option value="" className="text-gray-900 dark:text-gray-200">Selecione...</option>
              {SECTORS.map((sector) => (
                <option key={sector} value={sector} className="text-gray-900 dark:text-gray-200">{sector}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/personnel')}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cadastrar
          </button>
        </div>
      </form>
    </div>
  );
}