import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  X,
  Download,
  Eye,
  FileSpreadsheet,
  Clock,
  BarChart3,
  Save
} from 'lucide-react';
import type { Page } from '../App';
import { useData } from '../contexts/DataContext';

interface ImportPageProps {
  onNavigate: (page: Page) => void;
}

interface FileUpload {
  id: string;
  name: string;
  size: string;
  type: 'FEC' | 'Balance' | 'GL' | 'Auxiliaire';
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  errors?: string[];
  controls?: {
    totalLines: number;
    validLines: number;
    warnings: number;
    errors: number;
  };
}

export function ImportPage({ onNavigate }: ImportPageProps) {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addImportedFile, saveData } = useData();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (fileList: FileList) => {
    Array.from(fileList).forEach(file => {
      const newFile: FileUpload = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: formatFileSize(file.size),
        type: getFileType(file.name),
        status: 'uploading',
        progress: 0
      };

      setFiles(prev => [...prev, newFile]);
      simulateUpload(newFile.id, file);
    });
  };

  const simulateUpload = (fileId: string, originalFile: File) => {
    const interval = setInterval(() => {
      setFiles(prev => prev.map(file => {
        if (file.id === fileId) {
          if (file.progress < 100) {
            return { ...file, progress: file.progress + 10 };
          } else if (file.status === 'uploading') {
            return { 
              ...file, 
              status: 'processing',
              progress: 0
            };
          } else if (file.status === 'processing') {
            if (file.progress < 100) {
              return { ...file, progress: file.progress + 15 };
            } else {
              clearInterval(interval);
              const controlsData = {
                totalLines: Math.floor(Math.random() * 10000) + 5000,
                validLines: Math.floor(Math.random() * 9500) + 4500,
                warnings: Math.floor(Math.random() * 50),
                errors: Math.floor(Math.random() * 10)
              };
              
              // Add to global data store
              addImportedFile({
                name: file.name,
                size: file.size,
                type: file.type,
                status: 'completed',
                progress: 100,
                controls: controlsData
              });
              
              return {
                ...file,
                status: 'completed',
                progress: 100,
                controls: controlsData
              };
            }
          }
        }
        return file;
      }));
    }, 500);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileType = (filename: string): FileUpload['type'] => {
    if (filename.toLowerCase().includes('fec')) return 'FEC';
    if (filename.toLowerCase().includes('balance')) return 'Balance';
    if (filename.toLowerCase().includes('gl') || filename.toLowerCase().includes('livre')) return 'GL';
    return 'Auxiliaire';
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const getStatusIcon = (status: FileUpload['status']) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusText = (status: FileUpload['status']) => {
    switch (status) {
      case 'uploading':
        return 'Upload...';
      case 'processing':
        return 'Analyse...';
      case 'completed':
        return 'Traité';
      case 'error':
        return 'Erreur';
    }
  };

  const completedFiles = files.filter(f => f.status === 'completed');
  const hasCompletedFiles = completedFiles.length > 0;

  const handleSaveProgress = () => {
    saveData();
    alert('Import sauvegardé avec succès !');
  };

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Import & Contrôles
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Importez vos fichiers comptables et validez les contrôles automatiques
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {files.length > 0 && (
            <button 
              onClick={handleSaveProgress}
              className="btn-secondary flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Sauvegarder</span>
            </button>
          )}
          {hasCompletedFiles && (
            <button 
              onClick={() => onNavigate('analysis')}
              className="btn-primary flex items-center space-x-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Analyser les données</span>
            </button>
          )}
        </div>
      </div>

      {/* Upload Zone */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-12">
        <div
          className={`text-center transition-colors ${dragActive ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 rounded-xl p-4' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Glissez-déposez vos fichiers ici
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Formats acceptés : FEC (.txt), Balance (.xlsx, .csv), Grand Livre (.csv), Auxiliaires (.xlsx)
          </p>
          <div className="space-y-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-primary"
            >
              Sélectionner des fichiers
            </button>
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>FEC obligatoire</span>
              </div>
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="h-4 w-4" />
                <span>Balances recommandées</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        accept=".txt,.xlsx,.csv,.xls"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />

      {/* Files List */}
      {files.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Fichiers Importés ({files.length})
              </h3>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {completedFiles.length} traités • {files.filter(f => f.status === 'processing' || f.status === 'uploading').length} en cours
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {files.map((file) => (
              <div key={file.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(file.status)}
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {file.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {file.type} • {file.size} • {getStatusText(file.status)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {file.status === 'completed' && (
                      <>
                        <button 
                          onClick={() => alert(`Aperçu de ${file.name}`)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => alert(`Téléchargement de ${file.name} initié`)}
                          className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => removeFile(file.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                {(file.status === 'uploading' || file.status === 'processing') && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span>{file.status === 'uploading' ? 'Upload' : 'Analyse'} en cours...</span>
                      <span>{file.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="progress-bar h-2 rounded-full transition-all duration-300"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Controls Results */}
                {file.status === 'completed' && file.controls && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      <div className="text-lg font-semibold text-blue-600">
                        {file.controls.totalLines.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Lignes totales
                      </div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      <div className="text-lg font-semibold text-green-600">
                        {file.controls.validLines.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Lignes valides
                      </div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                      <div className="text-lg font-semibold text-yellow-600">
                        {file.controls.warnings}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Avertissements
                      </div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                      <div className="text-lg font-semibold text-red-600">
                        {file.controls.errors}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Erreurs
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Steps */}
      {hasCompletedFiles && (
        <div className="bg-gradient-to-r from-blue-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl border border-blue-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Import terminé avec succès !
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Vos fichiers sont prêts pour l'analyse. Vous pouvez maintenant générer les états financiers et lancer la due diligence.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => onNavigate('analysis')}
                className="btn-primary"
              >
                Commencer l'analyse
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}