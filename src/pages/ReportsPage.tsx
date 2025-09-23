import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  Settings, 
  CheckCircle,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  PieChart,
  BarChart3,
  TrendingUp,
  Target,
  Mail,
  Share2,
  Calendar,
  Filter
} from 'lucide-react';
import type { Page } from '../App';

interface ReportsPageProps {
  onNavigate: (page: Page) => void;
}

interface Report {
  id: string;
  name: string;
  type: 'pdf' | 'excel' | 'powerpoint';
  status: 'ready' | 'generating' | 'error';
  lastGenerated: string;
  pages?: number;
  size?: string;
  description: string;
  category: 'executive' | 'technical' | 'investor';
}

export function ReportsPage({ onNavigate }: ReportsPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'executive' | 'technical' | 'investor'>('all');
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const [reports, setReports] = useState<Report[]>([
    {
      id: '1',
      name: 'Executive Summary',
      type: 'pdf',
      status: 'ready',
      lastGenerated: '2025-01-15 14:30',
      pages: 2,
      size: '1.2MB',
      description: 'Synthèse exécutive 2 pages avec KPI clés et recommandations',
      category: 'executive'
    },
    {
      id: '2',
      name: 'Rapport Due Diligence Complet',
      type: 'pdf',
      status: 'ready',
      lastGenerated: '2025-01-15 14:25',
      pages: 24,
      size: '8.5MB',
      description: 'Rapport détaillé avec états financiers, QoE et analyses sectorielles',
      category: 'technical'
    },
    {
      id: '3',
      name: 'TS Master Workbook',
      type: 'excel',
      status: 'ready',
      lastGenerated: '2025-01-15 14:20',
      size: '15.2MB',
      description: 'Classeur Excel avec drill-down FEC, ratios et modélisation',
      category: 'technical'
    },
    {
      id: '4',
      name: 'Investor Deck',
      type: 'powerpoint',
      status: 'generating',
      lastGenerated: '2025-01-15 12:00',
      pages: 15,
      size: '4.8MB',
      description: 'Présentation investisseurs avec focus sur les opportunités',
      category: 'investor'
    },
    {
      id: '5',
      name: 'QoE Analysis Report',
      type: 'pdf',
      status: 'ready',
      lastGenerated: '2025-01-15 11:45',
      pages: 8,
      size: '2.1MB',
      description: 'Analyse détaillée Quality of Earnings avec ajustements',
      category: 'technical'
    },
    {
      id: '6',
      name: 'Monthly Business Review',
      type: 'pdf',
      status: 'ready',
      lastGenerated: '2025-01-15 09:30',
      pages: 6,
      size: '1.8MB',
      description: 'Revue mensuelle avec alertes et plan d\'action',
      category: 'executive'
    }
  ]);

  const handleGenerateReport = (reportId: string) => {
    setIsGenerating(reportId);
    setReports(prev => prev.map(report => 
      report.id === reportId 
        ? { ...report, status: 'generating' as const }
        : report
    ));

    setTimeout(() => {
      setReports(prev => prev.map(report => 
        report.id === reportId 
          ? { 
              ...report, 
              status: 'ready' as const,
              lastGenerated: new Date().toLocaleString('fr-FR')
            }
          : report
      ));
      setIsGenerating(null);
    }, 3000);
  };

  const handleDownloadReport = (report: Report) => {
    // Simulate download
    const link = document.createElement('a');
    link.href = '#';
    link.download = `${report.name.replace(/\s+/g, '_')}.${report.type === 'pdf' ? 'pdf' : report.type === 'excel' ? 'xlsx' : 'pptx'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show success message
    alert(`Téléchargement de "${report.name}" initié avec succès !`);
  };

  const filteredReports = reports.filter(report => 
    selectedCategory === 'all' || report.category === selectedCategory
  );

  const getStatusIcon = (status: Report['status']) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'generating':
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
  };

  const getFileIcon = (type: Report['type']) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'excel':
        return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
      case 'powerpoint':
        return <BarChart3 className="h-8 w-8 text-orange-500" />;
    }
  };

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Rapports & Livrables
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Génération et export de rapports professionnels
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => onNavigate('settings')}
            className="btn-secondary flex items-center space-x-2"
          >
            <Settings className="h-4 w-4" />
            <span>Paramètres</span>
          </button>
          <button 
            onClick={() => {
              handleGenerateReport('new');
              alert('Génération de tous les rapports initiée !');
            }}
            className="btn-primary flex items-center space-x-2"
          >
            <PieChart className="h-4 w-4" />
            <span>Générer Tout</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <Filter className="h-5 w-5 text-gray-500" />
        <div className="flex items-center space-x-2">
          {[
            { id: 'all', label: 'Tous les rapports' },
            { id: 'executive', label: 'Executive' },
            { id: 'technical', label: 'Technique' },
            { id: 'investor', label: 'Investisseur' }
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedCategory(filter.id as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedCategory === filter.id
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {reports.filter(r => r.status === 'ready').length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Prêts à télécharger
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {reports.filter(r => r.status === 'generating').length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                En génération
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {reports.reduce((sum, r) => sum + (r.pages || 0), 0)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Pages totales
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                24h
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Dernière MAJ
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden card-hover"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getFileIcon(report.type)}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {report.name}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusIcon(report.status)}
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {report.status === 'ready' && 'Prêt'}
                        {report.status === 'generating' && 'Génération...'}
                        {report.status === 'error' && 'Erreur'}
                      </span>
                    </div>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  report.category === 'executive' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20' :
                  report.category === 'technical' ? 'bg-green-100 text-green-600 dark:bg-green-900/20' :
                  'bg-purple-100 text-purple-600 dark:bg-purple-900/20'
                }`}>
                  {report.category === 'executive' && 'Executive'}
                  {report.category === 'technical' && 'Technique'}
                  {report.category === 'investor' && 'Investisseur'}
                </span>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {report.description}
              </p>

              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                <div className="flex items-center space-x-4">
                  {report.pages && (
                    <span>{report.pages} pages</span>
                  )}
                  {report.size && (
                    <span>{report.size}</span>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span className="text-xs">{report.lastGenerated}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {report.status === 'ready' && (
                  <>
                    <button 
                      onClick={() => handleDownloadReport(report)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Télécharger</span>
                    </button>
                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                      <Share2 className="h-4 w-4" />
                    </button>
                  </>
                )}
                {report.status === 'generating' && (
                  <div className="flex-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 py-2 px-4 rounded-lg text-sm font-medium text-center">
                    Génération en cours...
                  </div>
                )}
                {report.status === 'error' && (
                  <button 
                    onClick={() => handleGenerateReport(report.id)}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                  >
                    Régénérer
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl border border-blue-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Actions Rapides
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Générez rapidement vos livrables les plus utilisés
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => handleGenerateReport('exec')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
            >
              <Target className="h-4 w-4" />
              <span>Executive Summary</span>
            </button>
            <button 
              onClick={() => handleGenerateReport('ts')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>TS Master</span>
            </button>
            <button 
              onClick={() => handleGenerateReport('monthly')}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
            >
              <Calendar className="h-4 w-4" />
              <span>Business Review</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}