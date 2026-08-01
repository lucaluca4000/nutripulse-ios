import React, { useState, useEffect } from 'react';
import {
  Download,
  Smartphone,
  CheckCircle2,
  Share,
  PlusSquare,
  X,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  HelpCircle,
  Upload,
  RefreshCw,
  FileCheck,
  AlertCircle,
} from 'lucide-react';
import { UserAccount } from '../types';
import { triggerApkDownload, triggerIosDownload } from '../utils/downloadUtils';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserAccount | null;
  onCheckUpdate?: () => void;
}

interface AppFileInfo {
  exists: boolean;
  sizeMb: string;
  mtime: string;
  type?: string;
}

export const DownloadAppModal: React.FC<DownloadAppModalProps> = ({
  isOpen,
  onClose,
  onCheckUpdate,
}) => {
  const [selectedOS, setSelectedOS] = useState<'android' | 'ios'>('android');
  const [downloadStarted, setDownloadStarted] = useState<string | null>(null);
  const [showAdvancedGuide, setShowAdvancedGuide] = useState<boolean>(false);
  const [showAdminUpload, setShowAdminUpload] = useState<boolean>(false);

  // File info states
  const [apkInfo, setApkInfo] = useState<AppFileInfo | null>(null);
  const [iosInfo, setIosInfo] = useState<AppFileInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState<boolean>(false);

  // Upload states
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);
  const [uploadErrorMsg, setUploadErrorMsg] = useState<string | null>(null);

  const fetchAppInfo = async () => {
    try {
      setLoadingInfo(true);
      const res = await fetch('/api/admin/app-info');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setApkInfo(data.apk || null);
          setIosInfo(data.ios || null);
        }
      }
    } catch (err) {
      console.error('Error fetching app info:', err);
    } finally {
      setLoadingInfo(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAppInfo();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownloadApk = () => {
    triggerApkDownload();
    setDownloadStarted('NutriPulse-AI-v1.0.apk (Android)');
  };

  const handleDownloadIos = () => {
    triggerIosDownload();
    setDownloadStarted('NutriPulse-iOS-App.zip (iOS)');
  };

  const handleFileSelectAndUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadErrorMsg(null);
    setUploadSuccessMsg(null);
    setIsUploading(true);
    setUploadProgress(`Lecture du fichier ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)...`);

    try {
      const isApk = file.name.endsWith('.apk');
      const isIos = file.name.endsWith('.ipa') || file.name.endsWith('.zip');
      const targetOS = isApk ? 'android' : isIos ? 'ios' : selectedOS;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64Data = event.target?.result as string;
          if (!base64Data) {
            throw new Error('Impossible de lire le fichier');
          }

          setUploadProgress('Envoi du fichier vers le serveur...');

          const res = await fetch('/api/admin/upload-app', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              targetOS,
              fileName: file.name,
              base64Data,
            }),
          });

          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data.error || 'Erreur lors du téléversement');
          }

          setUploadSuccessMsg(`🎉 ${data.message}`);
          fetchAppInfo();
        } catch (uploadErr: any) {
          setUploadErrorMsg(uploadErr.message || 'Échec du téléversement du fichier.');
        } finally {
          setIsUploading(false);
          setUploadProgress('');
        }
      };

      reader.onerror = () => {
        setUploadErrorMsg('Erreur de lecture du fichier local.');
        setIsUploading(false);
        setUploadProgress('');
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setUploadErrorMsg(err.message || 'Erreur inattendue.');
      setIsUploading(false);
      setUploadProgress('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fade-in font-sans">
      <div className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Glow bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-lime-400 via-emerald-400 to-sky-400" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/80 bg-zinc-950 flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-lime-400/10 border border-lime-400/30 flex items-center justify-center text-lime-400 shadow-lg shrink-0">
              <Download className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wide truncate">
                Télécharger NutriPulse
              </h2>
              <p className="text-xs text-zinc-400 truncate mt-0.5">
                Choisissez votre smartphone :
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-2xl transition-colors shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {downloadStarted && (
          <div className="px-4 py-3 bg-lime-400/15 border-b border-lime-400/30 flex items-center justify-between text-xs text-lime-300 font-bold animate-fade-in">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0" />
              <span>Téléchargement lancé : <strong>{downloadStarted}</strong></span>
            </div>
            <button
              onClick={() => setDownloadStarted(null)}
              className="text-zinc-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* OS Selection Toggle Cards */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-2 gap-3">
            {/* Android Selector Card */}
            <button
              onClick={() => setSelectedOS('android')}
              className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between space-y-3 relative overflow-hidden ${
                selectedOS === 'android'
                  ? 'bg-gradient-to-br from-lime-950/40 via-zinc-900 to-zinc-900 border-lime-400 shadow-xl shadow-lime-400/10'
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 opacity-75'
              }`}
            >
              {selectedOS === 'android' && (
                <div className="absolute top-2.5 right-2.5 w-3 h-3 bg-lime-400 rounded-full animate-pulse" />
              )}
              <div className="space-y-1">
                <div className="w-10 h-10 rounded-xl bg-lime-400/20 text-lime-400 flex items-center justify-center font-bold text-xl">
                  🤖
                </div>
                <h3 className="font-black text-white text-base pt-1">Android</h3>
                <p className="text-[11px] text-zinc-400 leading-snug">Samsung, Xiaomi, Pixel...</p>
              </div>
              <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full w-fit ${
                selectedOS === 'android' ? 'bg-lime-400 text-black' : 'bg-zinc-800 text-zinc-400'
              }`}>
                Fichier .APK
              </span>
            </button>

            {/* iPhone / iOS Selector Card */}
            <button
              onClick={() => setSelectedOS('ios')}
              className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between space-y-3 relative overflow-hidden ${
                selectedOS === 'ios'
                  ? 'bg-gradient-to-br from-sky-950/40 via-zinc-900 to-zinc-900 border-sky-400 shadow-xl shadow-sky-400/10'
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 opacity-75'
              }`}
            >
              {selectedOS === 'ios' && (
                <div className="absolute top-2.5 right-2.5 w-3 h-3 bg-sky-400 rounded-full animate-pulse" />
              )}
              <div className="space-y-1">
                <div className="w-10 h-10 rounded-xl bg-sky-400/20 text-sky-400 flex items-center justify-center font-bold text-xl">
                  🍎
                </div>
                <h3 className="font-black text-white text-base pt-1">iPhone / iPad</h3>
                <p className="text-[11px] text-zinc-400 leading-snug">iOS (Apple)</p>
              </div>
              <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full w-fit ${
                selectedOS === 'ios' ? 'bg-sky-400 text-black' : 'bg-zinc-800 text-zinc-400'
              }`}>
                iOS / Safari
              </span>
            </button>
          </div>

          {/* Dynamic Content Based on Selection */}
          {selectedOS === 'android' ? (
            <div className="bg-zinc-900/90 border border-lime-400/40 rounded-2xl p-4 sm:p-5 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-lime-400/20 text-lime-400 rounded-xl shrink-0">
                    <Smartphone className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-sm">Application Android (APK)</h4>
                    <p className="text-xs text-zinc-400">Téléchargement direct et installation simple</p>
                  </div>
                </div>
                {apkInfo && apkInfo.exists && (
                  <div className="text-right text-[10px] text-zinc-400 bg-black/60 px-2.5 py-1 rounded-lg border border-zinc-800">
                    <span className="text-lime-400 font-bold">{apkInfo.sizeMb} MB</span>
                    <br />
                    <span>{new Date(apkInfo.mtime).toLocaleDateString('fr-FR')}</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleDownloadApk}
                className="w-full py-3.5 px-4 bg-lime-400 hover:bg-lime-300 text-black font-black text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-lime-400/25 flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
              >
                <Download className="w-5 h-5 stroke-[3]" />
                <span>Télécharger NutriPulse pour Android (.APK)</span>
              </button>

              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs text-zinc-300 space-y-2">
                <p className="font-bold text-lime-400 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>2 étapes faciles :</span>
                </p>
                <ol className="list-decimal pl-4 space-y-1 text-zinc-400 text-[11px]">
                  <li>Cliquez sur le bouton vert ci-dessus pour télécharger le fichier.</li>
                  <li>Ouvrez le fichier téléchargé et appuyez sur <strong>Installer</strong>.</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-900/90 border border-sky-400/40 rounded-2xl p-4 sm:p-5 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-sky-400/20 text-sky-400 rounded-xl shrink-0">
                    <Smartphone className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-sm">Application iPhone / iPad (.IPA)</h4>
                    <p className="text-xs text-zinc-400">Téléchargement direct du fichier d'application iOS</p>
                  </div>
                </div>
                {iosInfo && iosInfo.exists && (
                  <div className="text-right text-[10px] text-zinc-400 bg-black/60 px-2.5 py-1 rounded-lg border border-zinc-800">
                    <span className="text-sky-400 font-bold">{iosInfo.sizeMb} MB</span>
                    <br />
                    <span>{new Date(iosInfo.mtime).toLocaleDateString('fr-FR')}</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleDownloadIos}
                className="w-full py-3.5 px-4 bg-sky-400 hover:bg-sky-300 text-black font-black text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-sky-400/25 flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
              >
                <Download className="w-5 h-5 stroke-[3]" />
                <span>Télécharger NutriPulse pour iOS (.IPA)</span>
              </button>

              <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-sky-400" />
                    Alternative 1-clic : Sans ordinateur
                  </span>
                  <span className="text-[10px] bg-lime-400/20 text-lime-300 px-2 py-0.5 rounded-md font-mono font-bold">Instantané</span>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Sur iPhone avec <strong>Safari</strong>, vous pouvez aussi installer l'application en 5 secondes :<br />
                  Appuyez sur <strong>Partager</strong> <Share className="w-3.5 h-3.5 text-sky-400 inline mx-0.5" /> &gt; puis <PlusSquare className="w-3.5 h-3.5 text-lime-400 inline mx-0.5" /> <strong>"Sur l'écran d'accueil"</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Direct APK Upload Admin Panel */}
          <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 rounded-2xl border border-lime-400/40 p-3.5 sm:p-4 space-y-3">
            <button
              onClick={() => setShowAdminUpload(!showAdminUpload)}
              className="w-full flex items-center justify-between text-left group"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-lime-400/20 text-lime-400 flex items-center justify-center shrink-0">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-xs sm:text-sm group-hover:text-lime-400 transition-colors">
                    Mettre à jour l'APK directement depuis le site
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Sélectionnez votre nouveau fichier .apk pour le remplacer instantanément
                  </p>
                </div>
              </div>
              <ChevronRight
                className={`w-4 h-4 text-zinc-400 group-hover:text-white transition-transform ${
                  showAdminUpload ? 'rotate-90' : ''
                }`}
              />
            </button>

            {showAdminUpload && (
              <div className="pt-2 border-t border-zinc-800/80 space-y-3 animate-fade-in">
                {uploadSuccessMsg && (
                  <div className="p-3 bg-lime-500/20 border border-lime-400/50 rounded-xl text-xs text-lime-300 font-bold flex items-center space-x-2">
                    <FileCheck className="w-4 h-4 text-lime-400 shrink-0" />
                    <span>{uploadSuccessMsg}</span>
                  </div>
                )}

                {uploadErrorMsg && (
                  <div className="p-3 bg-red-500/20 border border-red-400/50 rounded-xl text-xs text-red-300 font-bold flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{uploadErrorMsg}</span>
                  </div>
                )}

                <div className="relative">
                  <label className="block w-full cursor-pointer">
                    <div className="p-4 bg-zinc-950 hover:bg-zinc-900 border-2 border-dashed border-lime-400/40 hover:border-lime-400 rounded-2xl text-center space-y-2 transition-all">
                      {isUploading ? (
                        <div className="flex flex-col items-center justify-center space-y-2 py-2">
                          <RefreshCw className="w-6 h-6 text-lime-400 animate-spin" />
                          <p className="text-xs text-lime-300 font-bold">{uploadProgress}</p>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-7 h-7 text-lime-400 mx-auto" />
                          <div>
                            <p className="text-xs font-bold text-white">
                              Cliquez ici pour choisir un nouveau fichier .APK ou .IPA
                            </p>
                            <p className="text-[10px] text-zinc-400 mt-0.5">
                              Fichiers supportés : .apk (Android) ou .ipa / .zip (iOS)
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      accept=".apk,.ipa,.zip"
                      onChange={handleFileSelectAndUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* 1-Click Update Box */}
          {onCheckUpdate && (
            <div className="p-3.5 bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 rounded-2xl border border-zinc-800 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-lime-400 block mb-0.5">
                  MISES À JOUR AUTOMATIQUES PWA
                </span>
                <p className="text-xs text-white font-bold">
                  Vérifier les mises à jour web instantanées
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onCheckUpdate();
                }}
                className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shrink-0 active:scale-95 border border-zinc-700"
              >
                Vérifier
              </button>
            </div>
          )}

          {/* Advanced / Help Accordion */}
          <div className="pt-1">
            <button
              onClick={() => setShowAdvancedGuide(!showAdvancedGuide)}
              className="w-full py-2 px-3 bg-zinc-900/40 hover:bg-zinc-900 rounded-xl text-xs text-zinc-400 hover:text-white flex items-center justify-between transition-colors border border-zinc-800/60"
            >
              <span className="flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-lime-400" />
                <span>Où trouver les fichiers d'installation sur PC ?</span>
              </span>
              <ChevronRight className={`w-4 h-4 transition-transform ${showAdvancedGuide ? 'rotate-90' : ''}`} />
            </button>

            {showAdvancedGuide && (
              <div className="mt-2 p-3.5 bg-zinc-900 rounded-xl border border-zinc-800 text-[11px] text-zinc-300 space-y-2 animate-fade-in">
                <p className="font-bold text-white">Emplacement des fichiers sur votre serveur :</p>
                <p className="text-zinc-400 leading-relaxed">
                  Lorsque vous téléversez un fichier ci-dessus, il est automatiquement enregistré dans :
                </p>
                <code className="text-lime-300 bg-black/80 p-2 rounded block font-mono border border-zinc-800 leading-relaxed text-[10px]">
                  public/downloads/<br />
                  ├── NutriPulse-AI-v1.0.apk (Android)<br />
                  └── NutriPulse-AI-v1.0.ipa (iOS)
                </code>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-950 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5 text-zinc-400 font-mono text-[11px]">
            <ShieldCheck className="w-4 h-4 text-lime-400 shrink-0" />
            <span className="hidden sm:inline">NutriPulse Mobile App V1.0</span>
            <span className="sm:hidden">V1.0 Mobile</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl transition-colors border border-zinc-800"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

