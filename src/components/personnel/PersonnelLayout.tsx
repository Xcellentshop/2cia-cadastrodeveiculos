import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, PlusCircle, List, FileText, Layers } from 'lucide-react';

export default function PersonnelLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                to="/personnel"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/personnel'
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <List className="h-5 w-5" />
                <span>Geral</span>
              </Link>

              <Link
                to="/personnel/new"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/personnel/new'
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <PlusCircle className="h-5 w-5" />
                <span>Cadastrar</span>
              </Link>

              <Link
                to="/personnel/sectors"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/personnel/sectors'
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <Layers className="h-5 w-5" />
                <span>Setores</span>
              </Link>

              <Link
                to="/personnel/reports"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/personnel/reports'
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <FileText className="h-5 w-5" />
                <span>Relatórios</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}