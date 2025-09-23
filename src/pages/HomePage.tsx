import React from 'react';
import { 
  ArrowRight, 
  Zap, 
  Shield, 
  TrendingUp, 
  FileSpreadsheet, 
  BarChart3,
  CheckCircle,
  Target,
  Briefcase,
  PieChart
} from 'lucide-react';
import type { Page } from '../App';
import { useTheme } from '../contexts/ThemeContext';

interface HomePageProps {
  onNavigate: (page: Page) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { isDark, toggleTheme } = useTheme();

  const features = [
    {
      icon: FileSpreadsheet,
      title: 'Import & Normalisation',
      description: 'Importez vos FEC, balances et auxiliaires avec contrôles automatiques'
    },
    {
      icon: BarChart3,
      title: 'États Financiers',
      description: 'Reconstruction automatique du P&L, Bilan et Cash-Flow avec drill-down complet'
    },
    {
      icon: Target,
      title: 'Quality of Earnings',
      description: 'Détection automatique des éléments non-récurrents et scoring intelligent'
    },
    {
      icon: TrendingUp,
      title: 'Analyse BFR',
      description: 'Calculs DSO, DPO, DIO et recommandations d\'ajustement'
    },
    {
      icon: PieChart,
      title: 'Ratios & KPI',
      description: 'Indicateurs sectoriels, alertes et business review automatisée'
    },
    {
      icon: Briefcase,
      title: 'Livrables Pro',
      description: 'Rapports PDF et Excel prêts pour vos clients et investisseurs'
    }
  ];

  const stats = [
    { label: 'Temps gagné', value: '80%', color: 'text-green-600' },
    { label: 'Précision', value: '99.5%', color: 'text-blue-600' },
    { label: 'Conformité', value: '100%', color: 'text-orange-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header with Theme Toggle */}
      <header className="absolute top-4 right-4 z-10">
        <button
          onClick={toggleTheme}
          className="p-3 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          {isDark ? <Zap className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
        </button>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <div className="flex items-center justify-center mb-6">
              <Zap className="h-16 w-16 text-blue-600 animate-float" />
            </div>
            <h1 className="text-5xl font-bold mb-6 gradient-text">
              Pégase
            </h1>
            <p className="text-2xl text-gray-600 dark:text-gray-400 mb-4">
              Due Diligence Financière Automatisée
            </p>
            <p className="text-lg text-gray-500 dark:text-gray-500 mb-8 max-w-3xl mx-auto">
              L'outil de référence pour les experts-comptables, analystes Transaction Services et dirigeants. 
              Transformez vos FEC en rapports professionnels en quelques clics.
            </p>
            
            <div className="flex items-center justify-center space-x-4 mb-12">
              {stats.map((stat, index) => (
                <div key={index} className="text-center animate-slide-up" style={{ animationDelay: `${index * 0.2}s` }}>
                  <div className={`text-3xl font-bold ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center space-x-4">
              <button 
                onClick={() => onNavigate('dashboard')}
                className="btn-primary flex items-center space-x-2"
              >
                <span>Commencer maintenant</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              <button className="btn-secondary">
                Voir la démo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Fonctionnalités Avancées
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Tout ce dont vous avez besoin pour une due diligence complète
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md card-hover border border-gray-100 dark:border-gray-700"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Icon className="h-12 w-12 text-blue-600 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600 to-orange-500 rounded-2xl p-12 shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-4">
              Prêt à révolutionner vos analyses financières ?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Rejoignez les centaines d'experts qui font confiance à Pégase
            </p>
            <div className="flex items-center justify-center space-x-4">
              <button 
                onClick={() => onNavigate('dashboard')}
                className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-lg hover:bg-blue-50 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Accéder au Dashboard
              </button>
              <button className="border border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-white/10 transition-all duration-200">
                Planifier une démo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="h-6 w-6 text-blue-600" />
            <span className="font-semibold text-gray-900 dark:text-white">Pégase</span>
            <span className="text-gray-500 dark:text-gray-400">© 2025</span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Version 1.0 - Due Diligence Financière Professionnelle
          </div>
        </div>
      </footer>
    </div>
  );
}