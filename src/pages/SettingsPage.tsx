import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  Building2, 
  Shield, 
  Bell,
  Palette,
  Database,
  Download,
  Upload,
  Save,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Key
} from 'lucide-react';
import type { Page } from '../App';
import { useTheme } from '../contexts/ThemeContext';
import { isBrowserEnvironment, safeGetItem, safeRemoveItem, safeSetItem } from '../utils/storage';

interface SettingsPageProps {
  onNavigate: (page: Page) => void;
}

interface UserSettings {
  name: string;
  email: string;
  company: string;
  role: string;
  sector: string;
  timezone: string;
  language: string;
}

interface SystemSettings {
  autoSave: boolean;
  notifications: boolean;
  emailReports: boolean;
  dataRetention: number;
  securityLevel: 'standard' | 'high' | 'maximum';
  maskSensitiveData: boolean;
}

interface SectorConfig {
  id: string;
  name: string;
  enabled: boolean;
  kpis: string[];
  ratiosBenchmarks: Record<string, number>;
}

const DEFAULT_USER_SETTINGS: UserSettings = {
  name: 'Jean Dupont',
  email: 'jean.dupont@cabinet-expertise.fr',
  company: 'Cabinet Expertise & Conseil',
  role: 'Expert-Comptable',
  sector: 'multi',
  timezone: 'Europe/Paris',
  language: 'fr'
};

const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  autoSave: true,
  notifications: true,
  emailReports: false,
  dataRetention: 36,
  securityLevel: 'high',
  maskSensitiveData: true
};

const DEFAULT_SECTOR_CONFIGS: SectorConfig[] = [
  {
    id: 'btp',
    name: 'BTP & Construction',
    enabled: true,
    kpis: ['Avancement', 'Retenues garantie', 'Sous-traitance'],
    ratiosBenchmarks: { ebitdaMargin: 8.5, currentRatio: 1.2 }
  },
  {
    id: 'retail',
    name: 'Commerce & Distribution',
    enabled: false,
    kpis: ['Ticket moyen', 'Rotation stock', 'Prime cost'],
    ratiosBenchmarks: { ebitdaMargin: 12.0, currentRatio: 1.5 }
  },
  {
    id: 'saas',
    name: 'SaaS & Tech',
    enabled: false,
    kpis: ['MRR', 'ARR', 'Churn rate', 'CAC/LTV'],
    ratiosBenchmarks: { ebitdaMargin: 25.0, currentRatio: 2.0 }
  }
];

const SECURITY_LEVELS: SystemSettings['securityLevel'][] = ['standard', 'high', 'maximum'];

function createDefaultUserSettings(): UserSettings {
  return { ...DEFAULT_USER_SETTINGS };
}

function createDefaultSystemSettings(): SystemSettings {
  return { ...DEFAULT_SYSTEM_SETTINGS };
}

function cloneSectorConfig(config: SectorConfig): SectorConfig {
  return {
    id: config.id,
    name: config.name,
    enabled: config.enabled,
    kpis: [...config.kpis],
    ratiosBenchmarks: { ...config.ratiosBenchmarks }
  };
}

function createDefaultSectorConfigs(): SectorConfig[] {
  return DEFAULT_SECTOR_CONFIGS.map(cloneSectorConfig);
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function parseJSON<T>(value: string | null, key: string): T | undefined {
  if (!value) {
    return undefined;
  }

  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn(`Impossible de parser les paramètres sauvegardés pour ${key}`, error);
    return undefined;
  }
}

function sanitizeUserSettings(raw: unknown): UserSettings {
  if (!raw || typeof raw !== 'object') {
    return createDefaultUserSettings();
  }

  const candidate = raw as Partial<UserSettings>;

  return {
    name: typeof candidate.name === 'string' ? candidate.name : DEFAULT_USER_SETTINGS.name,
    email: typeof candidate.email === 'string' ? candidate.email : DEFAULT_USER_SETTINGS.email,
    company: typeof candidate.company === 'string' ? candidate.company : DEFAULT_USER_SETTINGS.company,
    role: typeof candidate.role === 'string' ? candidate.role : DEFAULT_USER_SETTINGS.role,
    sector: typeof candidate.sector === 'string' ? candidate.sector : DEFAULT_USER_SETTINGS.sector,
    timezone: typeof candidate.timezone === 'string' ? candidate.timezone : DEFAULT_USER_SETTINGS.timezone,
    language: typeof candidate.language === 'string' ? candidate.language : DEFAULT_USER_SETTINGS.language
  };
}

function sanitizeSystemSettings(raw: unknown): SystemSettings {
  if (!raw || typeof raw !== 'object') {
    return createDefaultSystemSettings();
  }

  const candidate = raw as Partial<SystemSettings>;
  const dataRetention = toFiniteNumber(candidate.dataRetention);
  const securityLevel = SECURITY_LEVELS.includes(candidate.securityLevel as SystemSettings['securityLevel'])
    ? (candidate.securityLevel as SystemSettings['securityLevel'])
    : DEFAULT_SYSTEM_SETTINGS.securityLevel;

  return {
    autoSave: typeof candidate.autoSave === 'boolean' ? candidate.autoSave : DEFAULT_SYSTEM_SETTINGS.autoSave,
    notifications: typeof candidate.notifications === 'boolean' ? candidate.notifications : DEFAULT_SYSTEM_SETTINGS.notifications,
    emailReports: typeof candidate.emailReports === 'boolean' ? candidate.emailReports : DEFAULT_SYSTEM_SETTINGS.emailReports,
    dataRetention: dataRetention !== null ? Math.max(1, Math.round(dataRetention)) : DEFAULT_SYSTEM_SETTINGS.dataRetention,
    securityLevel,
    maskSensitiveData: typeof candidate.maskSensitiveData === 'boolean'
      ? candidate.maskSensitiveData
      : DEFAULT_SYSTEM_SETTINGS.maskSensitiveData
  };
}

function sanitizeSectorConfigs(raw: unknown): SectorConfig[] {
  if (!Array.isArray(raw)) {
    return createDefaultSectorConfigs();
  }

  const sanitized: SectorConfig[] = [];

  raw.forEach(entry => {
    if (!entry || typeof entry !== 'object') {
      return;
    }

    const candidate = entry as Partial<SectorConfig>;
    const id = typeof candidate.id === 'string' && candidate.id.trim() !== '' ? candidate.id : undefined;
    const name = typeof candidate.name === 'string' && candidate.name.trim() !== '' ? candidate.name : undefined;

    if (!id || !name) {
      return;
    }

    const fallback = DEFAULT_SECTOR_CONFIGS.find(config => config.id === id);

    const enabled = typeof candidate.enabled === 'boolean'
      ? candidate.enabled
      : fallback?.enabled ?? false;

    let kpis: string[];
    if (Array.isArray(candidate.kpis)) {
      kpis = candidate.kpis
        .filter(kpi => typeof kpi === 'string')
        .map(kpi => kpi.trim())
        .filter(kpi => kpi !== '');
    } else if (fallback) {
      kpis = [...fallback.kpis];
    } else {
      kpis = [];
    }

    let ratiosBenchmarks: Record<string, number> = {};
    if (
      candidate.ratiosBenchmarks &&
      typeof candidate.ratiosBenchmarks === 'object' &&
      !Array.isArray(candidate.ratiosBenchmarks)
    ) {
      Object.entries(candidate.ratiosBenchmarks).forEach(([key, value]) => {
        const numeric = toFiniteNumber(value);
        if (typeof key === 'string' && key.trim() !== '' && numeric !== null) {
          ratiosBenchmarks[key] = numeric;
        }
      });
    }

    if (Object.keys(ratiosBenchmarks).length === 0) {
      ratiosBenchmarks = fallback ? { ...fallback.ratiosBenchmarks } : {};
    }

    sanitized.push({
      id,
      name,
      enabled,
      kpis,
      ratiosBenchmarks
    });
  });

  return sanitized.length > 0 ? sanitized : createDefaultSectorConfigs();
}

export function SettingsPage({ onNavigate }: SettingsPageProps) {
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'profile' | 'company' | 'security' | 'notifications' | 'sectors' | 'system'>('profile');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<'saved' | 'reset'>('saved');
  const [showApiKey, setShowApiKey] = useState(false);

  const [userSettings, setUserSettings] = useState<UserSettings>(() => createDefaultUserSettings());

  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => createDefaultSystemSettings());

  const [sectorConfigs, setSectorConfigs] = useState<SectorConfig[]>(() => createDefaultSectorConfigs());

  const handleSave = () => {
    safeSetItem('pegase_user_settings', JSON.stringify(userSettings));
    safeSetItem('pegase_system_settings', JSON.stringify(systemSettings));
    safeSetItem('pegase_sector_configs', JSON.stringify(sectorConfigs));

    setSuccessMessage('saved');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleReset = () => {
    if (!isBrowserEnvironment()) {
      console.warn('Réinitialisation des paramètres indisponible dans cet environnement');
      return;
    }

    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?')) {
      safeRemoveItem('pegase_user_settings');
      safeRemoveItem('pegase_system_settings');
      safeRemoveItem('pegase_sector_configs');

      setUserSettings(createDefaultUserSettings());
      setSystemSettings(createDefaultSystemSettings());
      setSectorConfigs(createDefaultSectorConfigs());

      setSuccessMessage('reset');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleExportSettings = () => {
    if (!isBrowserEnvironment() || typeof document === 'undefined') {
      console.warn('Export des paramètres indisponible dans cet environnement');
      return;
    }

    const settings = {
      user: userSettings,
      system: systemSettings,
      sectors: sectorConfigs,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pegase-settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw = e.target?.result;
        if (typeof raw !== 'string') {
          throw new Error('Format de fichier invalide');
        }

        const settings = JSON.parse(raw) as Partial<{ user: unknown; system: unknown; sectors: unknown }>;
        if (settings.user !== undefined) {
          setUserSettings(sanitizeUserSettings(settings.user));
        }
        if (settings.system !== undefined) {
          setSystemSettings(sanitizeSystemSettings(settings.system));
        }
        if (settings.sectors !== undefined) {
          setSectorConfigs(sanitizeSectorConfigs(settings.sectors));
        }
        setSuccessMessage('saved');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } catch (error) {
        console.warn('Erreur lors de l\'import des paramètres', error);
        alert('Erreur lors de l\'import des paramètres');
      }
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    const savedUser = parseJSON<unknown>(safeGetItem('pegase_user_settings'), 'pegase_user_settings');
    const savedSystem = parseJSON<unknown>(safeGetItem('pegase_system_settings'), 'pegase_system_settings');
    const savedSectors = parseJSON<unknown>(safeGetItem('pegase_sector_configs'), 'pegase_sector_configs');

    if (savedUser !== undefined) {
      setUserSettings(sanitizeUserSettings(savedUser));
    }
    if (savedSystem !== undefined) {
      setSystemSettings(sanitizeSystemSettings(savedSystem));
    }
    if (savedSectors !== undefined) {
      setSectorConfigs(sanitizeSectorConfigs(savedSectors));
    }
  }, []);

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'company', label: 'Société', icon: Building2 },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'sectors', label: 'Secteurs', icon: Settings },
    { id: 'system', label: 'Système', icon: Database }
  ];

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Paramètres
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configuration de votre environnement Pégase
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {showSuccess && (
            <div className="flex items-center space-x-2 bg-green-100 dark:bg-green-900/20 text-green-600 px-4 py-2 rounded-lg">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">
                {successMessage === 'saved' ? 'Paramètres sauvegardés' : 'Paramètres réinitialisés'}
              </span>
            </div>
          )}
          <button 
            onClick={handleReset}
            className="btn-secondary flex items-center space-x-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Réinitialiser</span>
          </button>
          <button 
            onClick={handleSave}
            className="btn-primary flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Sauvegarder</span>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
            
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Profil Utilisateur
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      value={userSettings.name}
                      onChange={(e) => setUserSettings(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={userSettings.email}
                      onChange={(e) => setUserSettings(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rôle
                    </label>
                    <select
                      value={userSettings.role}
                      onChange={(e) => setUserSettings(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="Expert-Comptable">Expert-Comptable</option>
                      <option value="Analyste TS">Analyste Transaction Services</option>
                      <option value="Directeur Financier">Directeur Financier</option>
                      <option value="Dirigeant">Dirigeant</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fuseau horaire
                    </label>
                    <select
                      value={userSettings.timezone}
                      onChange={(e) => setUserSettings(prev => ({ ...prev, timezone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="Europe/Paris">Europe/Paris</option>
                      <option value="Europe/London">Europe/London</option>
                      <option value="America/New_York">America/New_York</option>
                    </select>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Préférences d'affichage
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Thème sombre
                        </label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Basculer entre le mode clair et sombre
                        </p>
                      </div>
                      <button
                        onClick={toggleTheme}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          isDark ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            isDark ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Company Tab */}
            {activeTab === 'company' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Informations Société
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nom de la société
                    </label>
                    <input
                      type="text"
                      value={userSettings.company}
                      onChange={(e) => setUserSettings(prev => ({ ...prev, company: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Secteur principal
                    </label>
                    <select
                      value={userSettings.sector}
                      onChange={(e) => setUserSettings(prev => ({ ...prev, sector: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="multi">Multi-sectoriel</option>
                      <option value="btp">BTP & Construction</option>
                      <option value="retail">Commerce & Distribution</option>
                      <option value="saas">SaaS & Tech</option>
                      <option value="services">Services B2B</option>
                      <option value="industrie">Industrie</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Sécurité & Confidentialité
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Niveau de sécurité
                    </label>
                    <select
                      value={systemSettings.securityLevel}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, securityLevel: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="standard">Standard</option>
                      <option value="high">Élevé</option>
                      <option value="maximum">Maximum</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Masquer les données sensibles
                      </label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Anonymise les tiers et libellés dans les exports
                      </p>
                    </div>
                    <button
                      onClick={() => setSystemSettings(prev => ({ ...prev, maskSensitiveData: !prev.maskSensitiveData }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        systemSettings.maskSensitiveData ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          systemSettings.maskSensitiveData ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Clé API
                      </label>
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value="pk_live_1234567890abcdef"
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white"
                      />
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <Key className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Notifications push
                      </label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Recevoir des notifications en temps réel
                      </p>
                    </div>
                    <button
                      onClick={() => setSystemSettings(prev => ({ ...prev, notifications: !prev.notifications }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        systemSettings.notifications ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          systemSettings.notifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Rapports par email
                      </label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Envoi automatique des rapports mensuels
                      </p>
                    </div>
                    <button
                      onClick={() => setSystemSettings(prev => ({ ...prev, emailReports: !prev.emailReports }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        systemSettings.emailReports ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          systemSettings.emailReports ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Sectors Tab */}
            {activeTab === 'sectors' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Configuration Sectorielle
                </h2>
                
                <div className="space-y-4">
                  {sectorConfigs.map((sector) => (
                    <div key={sector.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {sector.name}
                        </h3>
                        <button
                          onClick={() => setSectorConfigs(prev => prev.map(s => 
                            s.id === sector.id ? { ...s, enabled: !s.enabled } : s
                          ))}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            sector.enabled ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              sector.enabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      
                      {sector.enabled && (
                        <div className="space-y-2">
                          <div>
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              KPI spécifiques
                            </label>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {sector.kpis.map((kpi, index) => (
                                <span key={index} className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-600 px-2 py-1 rounded">
                                  {kpi}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* System Tab */}
            {activeTab === 'system' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Paramètres Système
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Sauvegarde automatique
                      </label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Sauvegarde toutes les 5 minutes
                      </p>
                    </div>
                    <button
                      onClick={() => setSystemSettings(prev => ({ ...prev, autoSave: !prev.autoSave }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        systemSettings.autoSave ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          systemSettings.autoSave ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rétention des données (mois)
                    </label>
                    <input
                      type="number"
                      min="12"
                      max="120"
                      value={systemSettings.dataRetention}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, dataRetention: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                      Import / Export des paramètres
                    </h3>
                    <div className="flex items-center space-x-4">
                      <button 
                        onClick={handleExportSettings}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        <span>Exporter</span>
                      </button>
                      
                      <label className="flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors cursor-pointer">
                        <Upload className="h-4 w-4" />
                        <span>Importer</span>
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImportSettings}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}