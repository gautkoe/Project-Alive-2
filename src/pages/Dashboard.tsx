import React, { useState } from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Upload,
  FileSpreadsheet,
  BarChart3,
  DollarSign,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Download,
  Save,
  RefreshCw
} from 'lucide-react';
import type { Page } from '../App';
import { useData } from '../contexts/DataContext';

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('LTM');
  const { financialData, qoeAdjustments, importedFiles, saveData } = useData();

  const kpis = [
    {
      title: 'CA LTM',
      value: `${(financialData.revenue.current / 1000000).toFixed(1)}M€`,
      change: `+${((financialData.revenue.current - financialData.revenue.previous) / financialData.revenue.previous * 100).toFixed(1)}%`,
      trend: 'up',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      title: 'EBITDA',
      value: `${(financialData.ebitda.current / 1000000).toFixed(1)}M€`,
      change: `+${((financialData.ebitda.current - financialData.ebitda.previous) / financialData.ebitda.previous * 100).toFixed(1)}%`,
      trend: 'up',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: 'EBITDA Normalisé',
      value: `${(financialData.ebitdaNormalized / 1000000).toFixed(1)}M€`,
      change: `${qoeAdjustments.filter(a => a.status === 'accepted').length} ajustements`,
      trend: 'up',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      title: 'BFR',
      value: `${(financialData.workingCapital.current / 1000000).toFixed(1)}M€`,
      change: `${((financialData.workingCapital.current - financialData.workingCapital.previous) / Math.abs(financialData.workingCapital.previous) * 100).toFixed(1)}%`,
      trend: financialData.workingCapital.current < financialData.workingCapital.previous ? 'down' : 'up',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    }
  ];

  const alerts = [
    {
      type: 'warning',
      title: 'Concentration Client',
      description: 'Top 3 clients représentent 68% du CA',
      priority: 'Haute',
      action: () => onNavigate('analysis')
    },
    {
      type: 'info',
      title: 'Cut-off Revenus',
      description: 'Pic de facturation détecté en décembre',
      priority: 'Moyenne',
      action: () => onNavigate('analysis')
    },
    {
      type: 'success',
      title: 'Lettrage OK',
      description: 'Tous les comptes sont lettrés',
      priority: 'Info',
      action: () => alert('Validation complète !')
    }
  ];

  const recentFiles = importedFiles
    .sort((a, b) => new Date(b.dateImported).getTime() - new Date(a.dateImported).getTime())
    .slice(0, 3);

  const handleSaveProgress = () => {
    saveData();
    alert('Progression sauvegardée avec succès !');
  };

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Vue d'ensemble de vos analyses financières
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="LTM">LTM</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
          <button 
            onClick={handleSaveProgress}
            className="btn-secondary flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Sauvegarder</span>
          </button>
          <button 
            onClick={() => onNavigate('import')}
            className="btn-primary flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>Importer</span>
          </button>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <div 
            key={index}
            className={`${kpi.bgColor} p-6 rounded-xl border border-gray-200 dark:border-gray-700 card-hover cursor-pointer`}
            onClick={() => onNavigate('analysis')}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {kpi.title}
              </h3>
              {kpi.trend === 'up' ? (
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {kpi.value}
                </div>
                <div className={`text-sm font-medium ${kpi.color}`}>
                  {kpi.change}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Évolution Financière
              </h3>
              <button 
                onClick={() => onNavigate('analysis')}
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
              >
                <Eye className="h-4 w-4" />
                <span>Détails</span>
              </button>
            </div>
            
            {/* Simulated Chart */}
            <div className="h-64 bg-gradient-to-br from-blue-50 to-orange-50 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Graphique interactif</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">CA, EBITDA, Cash-Flow</p>
                <button 
                  onClick={() => onNavigate('analysis')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Analyser en détail
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-4">
            <button 
              onClick={() => onNavigate('analysis')}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-left card-hover"
            >
              <BarChart3 className="h-8 w-8 text-blue-600 mb-2" />
              <h4 className="font-medium text-gray-900 dark:text-white">Analyse QoE</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Quality of Earnings</p>
            </button>
            
            <button 
              onClick={() => onNavigate('reports')}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-left card-hover"
            >
              <FileSpreadsheet className="h-8 w-8 text-green-600 mb-2" />
              <h4 className="font-medium text-gray-900 dark:text-white">Rapport PDF</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Génération auto</p>
            </button>
            
            <button 
              onClick={() => onNavigate('reports')}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-left card-hover"
            >
              <Download className="h-8 w-8 text-orange-500 mb-2" />
              <h4 className="font-medium text-gray-900 dark:text-white">Excel TS</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Livrables pros</p>
            </button>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Alerts */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Alertes & Recommandations
            </h3>
            <div className="space-y-4">
              {alerts.map((alert, index) => (
                <div key={index} className="border border-gray-100 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    {alert.type === 'warning' && (
                      <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                    )}
                    {alert.type === 'info' && (
                      <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                    )}
                    {alert.type === 'success' && (
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                        {alert.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {alert.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          alert.priority === 'Haute' ? 'bg-red-100 text-red-600 dark:bg-red-900/20' :
                          alert.priority === 'Moyenne' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20' :
                          'bg-gray-100 text-gray-600 dark:bg-gray-700'
                        }`}>
                          {alert.priority}
                        </span>
                        <button 
                          onClick={alert.action}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Analyser
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Files */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Fichiers Récents
              </h3>
              <button 
                onClick={() => onNavigate('import')}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Voir tout
              </button>
            </div>
            <div className="space-y-3">
              {recentFiles.map((file, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <FileSpreadsheet className="h-8 w-8 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(file.dateImported).toLocaleDateString('fr-FR')} • {file.size}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    file.status === 'completed' ? 'bg-green-100 text-green-600 dark:bg-green-900/20' :
                    'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20'
                  }`}>
                    {file.status === 'completed' ? 'Traité' : 'En cours'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Save Status */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 p-4 rounded-xl border border-blue-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Sauvegarde Auto
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Dernière sauvegarde: {new Date().toLocaleTimeString('fr-FR')}
                </p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}