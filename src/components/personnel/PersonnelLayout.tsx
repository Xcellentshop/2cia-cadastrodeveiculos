import React from 'react';
import { NavLink } from 'react-router-dom';
import { Users, PlusCircle, List, FileText, Layers } from 'lucide-react';

export default function PersonnelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <nav className="flex space-x-4">
                <NavLink
                  to="/personnel"
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                        : 'text-gray-700 hover:bg-indigo-50 dark:text-gray-200 dark:hover:bg-gray-700'
                    }`
                  }
                >
                  <List className="h-5 w-5" />
                  <span>Lista</span>
                </NavLink>

                <NavLink
                  to="/personnel/new"
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                        : 'text-gray-700 hover:bg-indigo-50 dark:text-gray-200 dark:hover:bg-gray-700'
                    }`
                  }
                >
                  <PlusCircle className="h-5 w-5" />
                  <span>Cadastrar</span>
                </NavLink>

                <NavLink
                  to="/personnel/sectors"
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                        : 'text-gray-700 hover:bg-indigo-50 dark:text-gray-200 dark:hover:bg-gray-700'
                    }`
                  }
                >
                  <Layers className="h-5 w-5" />
                  <span>Setores</span>
                </NavLink>

                <NavLink
                  to="/personnel/management"
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                        : 'text-gray-700 hover:bg-indigo-50 dark:text-gray-200 dark:hover:bg-gray-700'
                    }`
                  }
                >
                  <Users className="h-5 w-5" />
                  <span>Efetivo</span>
                </NavLink>

                <NavLink
                  to="/personnel/reports"
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                        : 'text-gray-700 hover:bg-indigo-50 dark:text-gray-200 dark:hover:bg-gray-700'
                    }`
                  }
                >
                  <FileText className="h-5 w-5" />
                  <span>Relatórios</span>
                </NavLink>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  );
}