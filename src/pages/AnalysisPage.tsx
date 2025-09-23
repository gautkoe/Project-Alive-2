import React, { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle,
  BarChart3,
  PieChart,
  Target,
  Calculator,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Download,
  RefreshCw,
  Settings,
  Save,
  Plus,
  Edit3
} from 'lucide-react';
import type { Page } from '../App';
import { useData } from '../contexts/DataContext';

interface AnalysisPageProps {
  onNavigate: (page: Page) => void;
}

export function AnalysisPage({ onNavigate }: AnalysisPageProps) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'qoe' | 'bfr' | 'ratios'>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('LTM');
  const { 
    financialData, 
    qoeAdjustments, 
    updateQoeAdjustment, 
    addQoeAdjustment, 
    removeQoeAdjustment,
    saveData 
  } = useData();

  const handleQoEAction = (id: string, action: 'accept' | 'reject') => {
    updateQoeAdjustment(id, { status: action === 'accept' ? 'accepted' : 'rejected' });
    saveData();
  };

  const handleAddQoEAdjustment = () => {
    const item = prompt('Nom de l\'ajustement:');
    const amountStr = prompt('Montant (négatif pour retirer):');
    const description = prompt('Description:');
    
    if (item && amountStr && description) {
      const amount = parseFloat(amountStr);
      addQoeAdjustment({
        item,
        amount,
        type: amount > 0 ? 'add' : 'remove',
        category: 'Normalisation',
        confidence: 85,
        status: 'pending',
        description
      });
      saveData();
    }
  };

  const calculateChange = (current: number, previous: number) => {
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const ratios = [
    { name: 'EBITDA Margin', value: `${(financialData.ebitda.current / financialData.revenue.current * 100).toFixed(1)}%`, previous: `${(financialData.ebitda.previous / financialData.revenue.previous * 100).toFixed(1)}%`, trend: 'up' },
    { name: 'Current Ratio', value: '1.85', previous: '1.72', trend: 'up' },
    { name: 'Quick Ratio', value: '1.23', previous: '1.18', trend: 'up' },
    { name: 'Gearing', value: '0.49', previous: '0.58', trend: 'down' },
    { name: 'DSCR', value: '2.1x', previous: '1.8x', trend: 'up' },
    { name: 'ROA', value: '12.5%', previous: '11.2%', trend: 'up' }
  ];

  const bfrAnalysis = {
    dso: { value: 45, benchmark: 35, trend: 'up' },
    dpo: { value: 28, benchmark: 35, trend: 'down' },
    dio: { value: 22, benchmark: 18, trend: 'up' },
    current: financialData.workingCapital.current,
    normative: 1450000,
    adjustment: financialData.workingCapital.current - 1450000
  };

  const handleSaveProgress = () => {
    saveData();
    alert('Analyse sauvegardée avec succès !');
  };

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analyse Financière
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Due diligence complète et détection d'anomalies
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
          <button className="btn-secondary flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Recalculer</span>
          </button>
          <button 
            onClick={() => onNavigate('reports')}
            className="btn-primary flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
            { id: 'qoe', label: 'Quality of Earnings', icon: Target },
            { id: 'bfr', label: 'BFR Analysis', icon: TrendingUp },
            { id: 'ratios', label: 'Ratios', icon: PieChart }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Chiffre d'Affaires
                </h3>
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {(financialData.revenue.current / 1000000).toFixed(1)}M€
              </div>
              <div className="text-sm text-green-600">
                +{calculateChange(financialData.revenue.current, financialData.revenue.previous)}%
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  EBITDA
                </h3>
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {(financialData.ebitda.current / 1000000).toFixed(1)}M€
              </div>
              <div className="text-sm text-green-600">
                +{calculateChange(financialData.ebitda.current, financialData.ebitda.previous)}%
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  EBITDA Normalisé
                </h3>
                <Target className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {(financialData.ebitdaNormalized / 1000000).toFixed(1)}M€
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {qoeAdjustments.filter(a => a.status === 'accepted').length} ajustements appliqués
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Net Debt
                </h3>
                <ArrowDownRight className="h-4 w-4 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {(financialData.netDebt.current / 1000000).toFixed(1)}M€
              </div>
              <div className="text-sm text-green-600">
                {calculateChange(financialData.netDebt.current, financialData.netDebt.previous)}%
              </div>
            </div>
          </div>

          {/* Chart Placeholder */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Évolution Mensuelle
            </h3>
            <div className="h-80 bg-gradient-to-br from-blue-50 to-orange-50 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg">Graphique interactif</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">CA, EBITDA, Cash-Flow par mois avec drill-down</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QoE Tab */}
      {selectedTab === 'qoe' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Ajustements Quality of Earnings
              </h3>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={handleAddQoEAdjustment}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Ajouter</span>
                </button>
                <div className="text-right">
                  <div className="text-sm text-gray-500 dark:text-gray-400">EBITDA Normalisé</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {(financialData.ebitdaNormalized / 1000000).toFixed(1)}M€
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {qoeAdjustments.map((adjustment) => (
                <div key={adjustment.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {adjustment.item}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          adjustment.category === 'Non-récurrent' ? 'bg-red-100 text-red-600 dark:bg-red-900/20' :
                          adjustment.category === 'Owner benefit' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/20' :
                          'bg-blue-100 text-blue-600 dark:bg-blue-900/20'
                        }`}>
                          {adjustment.category}
                        </span>
                        <span className={`text-sm font-medium ${
                          adjustment.confidence > 90 ? 'text-green-600' :
                          adjustment.confidence > 80 ? 'text-orange-500' : 'text-red-500'
                        }`}>
                          {adjustment.confidence}% confiance
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {adjustment.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className={`text-lg font-semibold ${
                          adjustment.type === 'add' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {adjustment.type === 'add' ? '+' : ''}{adjustment.amount.toLocaleString()}€
                        </div>
                        <div className="flex items-center space-x-2">
                          {adjustment.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleQoEAction(adjustment.id, 'accept')}
                                className="px-3 py-1 bg-green-100 text-green-600 text-xs font-medium rounded hover:bg-green-200 transition-colors"
                              >
                                Accepter
                              </button>
                              <button 
                                onClick={() => {
                                  const newAmount = prompt('Nouveau montant:', adjustment.amount.toString());
                                  if (newAmount) {
                                    updateQoeAdjustment(adjustment.id, { amount: parseFloat(newAmount) });
                                    saveData();
                                  }
                                }}
                                className="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded hover:bg-blue-200 transition-colors"
                              >
                                <Edit3 className="h-3 w-3" />
                              </button>
                              <button 
                                onClick={() => handleQoEAction(adjustment.id, 'reject')}
                                className="px-3 py-1 bg-red-100 text-red-600 text-xs font-medium rounded hover:bg-red-200 transition-colors"
                              >
                                Rejeter
                              </button>
                            </>
                          )}
                          {adjustment.status === 'accepted' && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                          {adjustment.status === 'rejected' && (
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Résumé des ajustements
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {qoeAdjustments.filter(a => a.status === 'accepted').length}
                  </div>
                  <div className="text-xs text-gray-500">Acceptés</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {qoeAdjustments.filter(a => a.status === 'pending').length}
                  </div>
                  <div className="text-xs text-gray-500">En attente</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {qoeAdjustments.filter(a => a.status === 'rejected').length}
                  </div>
                  <div className="text-xs text-gray-500">Rejetés</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BFR Tab */}
      {selectedTab === 'bfr' && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">DSO - Délai Clients</h4>
              <div className="text-3xl font-bold text-orange-500 mb-2">{bfrAnalysis.dso.value}j</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Benchmark: {bfrAnalysis.dso.benchmark}j
              </div>
              <div className="mt-3 text-sm text-orange-500">
                +{bfrAnalysis.dso.value - bfrAnalysis.dso.benchmark}j vs benchmark
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">DPO - Délai Fournisseurs</h4>
              <div className="text-3xl font-bold text-red-500 mb-2">{bfrAnalysis.dpo.value}j</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Benchmark: {bfrAnalysis.dpo.benchmark}j
              </div>
              <div className="mt-3 text-sm text-red-500">
                -{bfrAnalysis.dpo.benchmark - bfrAnalysis.dpo.value}j vs benchmark
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">DIO - Rotation Stock</h4>
              <div className="text-3xl font-bold text-orange-500 mb-2">{bfrAnalysis.dio.value}j</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Benchmark: {bfrAnalysis.dio.benchmark}j
              </div>
              <div className="mt-3 text-sm text-orange-500">
                +{bfrAnalysis.dio.value - bfrAnalysis.dio.benchmark}j vs benchmark
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Analyse BFR & Recommandations
            </h3>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">BFR Actuel</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(bfrAnalysis.current / 1000000).toFixed(1)}M€
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">BFR Normatif</div>
                <div className="text-2xl font-bold text-blue-600">
                  {(bfrAnalysis.normative / 1000000).toFixed(1)}M€
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Ajustement Possible</div>
                <div className="text-2xl font-bold text-orange-500">
                  {(bfrAnalysis.adjustment / 1000000).toFixed(1)}M€
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">
                Recommandations d'optimisation
              </h4>
              <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                <li>• Améliorer le recouvrement client (DSO élevé)</li>
                <li>• Négocier des délais fournisseurs plus longs</li>
                <li>• Optimiser la rotation des stocks</li>
                <li>• Potentiel de libération: {(Math.abs(bfrAnalysis.adjustment) / 1000000).toFixed(1)}M€</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Ratios Tab */}
      {selectedTab === 'ratios' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ratios.map((ratio, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">{ratio.name}</h4>
                  {ratio.trend === 'up' ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {ratio.value}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Précédent: {ratio.previous}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Analyse Sectorielle
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Benchmarks Sectoriels
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">EBITDA Margin:</span>
                    <span className="font-medium">8-15% (secteur)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Current Ratio:</span>
                    <span className="font-medium">1.2-1.8 (secteur)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Gearing:</span>
                    <span className="font-medium">0.3-0.6 (secteur)</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Position vs Marché
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Performance:</span>
                    <span className="bg-green-100 dark:bg-green-900/20 text-green-600 px-2 py-1 rounded text-xs">
                      Supérieure
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Liquidité:</span>
                    <span className="bg-green-100 dark:bg-green-900/20 text-green-600 px-2 py-1 rounded text-xs">
                      Excellente
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Endettement:</span>
                    <span className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 px-2 py-1 rounded text-xs">
                      Modéré
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}