import React from 'react';
import { 
  Home, 
  Upload, 
  BarChart3, 
  FileText, 
  Settings, 
  Sun, 
  Moon,
  Zap
} from 'lucide-react';
import type { Page } from '../App';
import { useTheme } from '../contexts/ThemeContext';

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const { isDark, toggleTheme } = useTheme();

  const navItems = [
    { id: 'dashboard' as Page, label: 'Dashboard', icon: Home },
    { id: 'import' as Page, label: 'Import', icon: Upload },
    { id: 'analysis' as Page, label: 'Analyse', icon: BarChart3 },
    { id: 'reports' as Page, label: 'Rapports', icon: FileText },
    { id: 'settings' as Page, label: 'Paramètres', icon: Settings },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div 
            className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onNavigate('home')}
          >
            <Zap className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold gradient-text">Pégase</span>
          </div>
          
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>
    </nav>
  );
}