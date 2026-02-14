import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { QuickActions } from './components/QuickActions';
// Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { BranchesPage } from './pages/BranchesPage';
import { AttendancePage } from './pages/AttendancePage';
import { LeavePage } from './pages/LeavePage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminsPage } from './pages/AdminsPage';
export function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const handleLogin = () => {
    setIsLoggedIn(true);
    setActivePage('dashboard');
  };
  const handleLogout = () => {
    setIsLoggedIn(false);
    setActivePage('dashboard');
  };
  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }
  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage onNavigate={setActivePage} />;
      case 'employees':
        return <EmployeesPage />;
      case 'branches':
        return <BranchesPage />;
      case 'attendance':
        return <AttendancePage />;
      case 'leave':
        return <LeavePage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'admins':
        return <AdminsPage />;
      default:
        return (
          <div className="p-10 text-center text-gray-500">
            Halaman sedang dalam pengembangan.
          </div>);

    }
  };
  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        onLogout={handleLogout} />


      <main className="flex-1 ml-20 p-8 lg:p-10 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          <TopBar activePage={activePage} />
          {renderPage()}
        </div>
      </main>

      <QuickActions onNavigate={setActivePage} />
    </div>);

}