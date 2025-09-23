import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { Dashboard } from './pages/Dashboard';
import { ImportPage } from './pages/ImportPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ThemeProvider } from './contexts/ThemeContext';
import { DataProvider } from './contexts/DataContext';
import './App.css';

export type Page = 'home' | 'dashboard' | 'import' | 'analysis' | 'reports' | 'settings';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'import':
        return <ImportPage onNavigate={setCurrentPage} />;
      case 'analysis':
        return <AnalysisPage onNavigate={setCurrentPage} />;
      case 'reports':
        return <ReportsPage onNavigate={setCurrentPage} />;
      case 'settings':
        return <SettingsPage onNavigate={setCurrentPage} />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <ThemeProvider>
      <DataProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          {currentPage !== 'home' && (
            <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
          )}
          <main>
            {renderPage()}
          </main>
        </div>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;