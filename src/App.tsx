import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './components/Login';
import Navbar from './components/Navbar';
import SystemChoice from './components/SystemChoice';
import VehicleForm from './components/VehicleForm';
import VehicleList from './components/VehicleList';
import VehicleSearch from './components/VehicleSearch';
import Reports from './components/Reports';
import Calendar from './components/calendar/Calendar';
import AssetList from './components/asset/AssetList';
import AssetForm from './components/asset/AssetForm';
import AssetSearch from './components/asset/AssetSearch';
import AssetReports from './components/asset/AssetReports';
import SectorManagement from './components/asset/SectorManagement';
import MedicalLeaveLayout from './components/medical/MedicalLeaveLayout';
import MedicalLeaveForm from './components/medical/MedicalLeaveForm';
import MedicalLeaveList from './components/medical/MedicalLeaveList';
import MedicalLeaveReports from './components/medical/MedicalLeaveReports';
import PersonnelLayout from './components/personnel/PersonnelLayout';
import PersonnelList from './components/personnel/PersonnelList';
import PersonnelForm from './components/personnel/PersonnelForm';
import PersonnelSectors from './components/personnel/PersonnelSectors';
import PersonnelManagement from './components/personnel/PersonnelManagement';
import PersonnelReports from './components/personnel/PersonnelReports';

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                    <Navbar>
                      <div className="flex space-x-4">
                        <NavLink
                          to="/"
                          className={({ isActive }) =>
                            `px-3 py-2 rounded-md text-sm font-medium ${
                              isActive
                                ? 'bg-gray-900 text-white dark:bg-gray-700'
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`
                          }
                        >
                          Início
                        </NavLink>
                      </div>
                    </Navbar>
                    <main className="container mx-auto py-8 px-4">
                      <Routes>
                        <Route path="/" element={<SystemChoice />} />
                        
                        {/* Vehicle Routes */}
                        <Route path="/vehicles" element={<VehicleList />} />
                        <Route path="/vehicles/new" element={<VehicleForm />} />
                        <Route path="/vehicles/edit/:id" element={<VehicleForm />} />
                        <Route path="/vehicles/search" element={<VehicleSearch />} />
                        <Route path="/vehicles/reports" element={<Reports />} />
                        
                        {/* Asset Routes */}
                        <Route path="/assets" element={<AssetList />} />
                        <Route path="/assets/new" element={<AssetForm />} />
                        <Route path="/assets/edit/:id" element={<AssetForm />} />
                        <Route path="/assets/search" element={<AssetSearch />} />
                        <Route path="/assets/reports" element={<AssetReports />} />
                        <Route path="/assets/sectors" element={<SectorManagement />} />

                        {/* Calendar Routes */}
                        <Route path="/calendar" element={<Calendar />} />

                        {/* Medical Leave Routes */}
                        <Route path="/medical-leave" element={
                          <MedicalLeaveLayout>
                            <MedicalLeaveList />
                          </MedicalLeaveLayout>
                        } />
                        <Route path="/medical-leave/new" element={
                          <MedicalLeaveLayout>
                            <MedicalLeaveForm />
                          </MedicalLeaveLayout>
                        } />
                        <Route path="/medical-leave/edit/:id" element={
                          <MedicalLeaveLayout>
                            <MedicalLeaveForm />
                          </MedicalLeaveLayout>
                        } />
                        <Route path="/medical-leave/reports" element={
                          <MedicalLeaveLayout>
                            <MedicalLeaveReports />
                          </MedicalLeaveLayout>
                        } />

                        {/* Personnel Routes */}
                        <Route path="/personnel" element={
                          <PersonnelLayout>
                            <PersonnelList />
                          </PersonnelLayout>
                        } />
                        <Route path="/personnel/new" element={
                          <PersonnelLayout>
                            <PersonnelForm />
                          </PersonnelLayout>
                        } />
                        <Route path="/personnel/edit/:id" element={
                          <PersonnelLayout>
                            <PersonnelForm />
                          </PersonnelLayout>
                        } />
                        <Route path="/personnel/sectors" element={
                          <PersonnelLayout>
                            <PersonnelSectors />
                          </PersonnelLayout>
                        } />
                        <Route path="/personnel/management" element={
                          <PersonnelLayout>
                            <PersonnelManagement />
                          </PersonnelLayout>
                        } />
                        <Route path="/personnel/reports" element={
                          <PersonnelLayout>
                            <PersonnelReports />
                          </PersonnelLayout>
                        } />
                      </Routes>
                    </main>
                  </div>
                </PrivateRoute>
              }
            />
          </Routes>
          <Toaster position="top-right" />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}