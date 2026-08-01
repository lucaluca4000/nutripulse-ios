import React, { useState } from 'react';
import { RefreshCw, Sparkles, Download, CheckCircle, ArrowRight, ShieldCheck, X } from 'lucide-react';
import { VersionInfo, APP_VERSION, performOneClickUpdate } from '../utils/version';

interface UpdateNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverVersionInfo: VersionInfo | null;
  isManualCheck?: boolean;
}

export const UpdateNotificationModal: React.FC<UpdateNotificationModalProps> = ({
  isOpen,
  onClose,
  serverVersionInfo,
  isManualCheck = false,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen) return null;

  const handleUpdateClick = async () => {
    setIsUpdating(true);
    await performOneClickUpdate();
  };

  const isUpToDate = !serverVersionInfo || serverVersionInfo.version === APP_VERSION;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-zinc-950 border border-lime-400/40 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden relative animate-scale-up">
        {/* Glow Header */}
        <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 p-6 border-b border-zinc-800 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 rounded-xl transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-lime-400 text-black flex items-center justify-center font-black shadow-lg shadow-lime-400/20 shrink-0">
              <Sparkles className="w-5 h-5 fill-black" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-lime-400 block">
                {isUpToDate ? 'APPLICATION À JOUR' : 'MISE À JOUR DISPONIBLE'}
              </span>
              <h2 className="text-xl font-black uppercase tracking-tight text-white">
                {isUpToDate ? `Version ${APP_VERSION}` : `Nouvelle version ${serverVersionInfo?.version}`}
              </h2>
            </div>
          </div>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            {isUpToDate
              ? 'Vous profitez actuellement de toutes les dernières fonctionnalités et optimisations de NutriPulse.'
              : 'Une nouvelle version améliorée de l’application est disponible. La mise à jour est instantanée !'}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {isUpToDate ? (
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-lime-400/10 border border-lime-400/30 text-lime-400 mx-auto flex items-center justify-center">
                <CheckCircle className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-sm">Votre application est 100% à jour</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Version installée : <strong className="text-lime-400 font-mono">v{APP_VERSION}</strong>
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
              >
                Fermer
              </button>
            </div>
          ) : (
            <>
              {/* Release Notes */}
              {serverVersionInfo?.notes && serverVersionInfo.notes.length > 0 && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-2.5">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 font-bold block">
                    Nouveautés de cette mise à jour :
                  </span>
                  <ul className="space-y-2 text-xs text-zinc-200 font-medium">
                    {serverVersionInfo.notes.map((note, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-lime-400 font-bold shrink-0 mt-0.5">•</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Data Safety Reassurance */}
              <div className="flex items-center space-x-2.5 text-xs text-zinc-400 bg-zinc-950/80 p-3 rounded-xl border border-zinc-800/80">
                <ShieldCheck className="w-4 h-4 text-lime-400 shrink-0" />
                <span>
                  Vos repas enregistrés, données et profil sont <strong>100% conservés</strong>.
                </span>
              </div>

              {/* Main 1-Click Update Action Button */}
              <button
                onClick={handleUpdateClick}
                disabled={isUpdating}
                className="w-full py-4 px-5 bg-lime-400 hover:bg-lime-300 text-black font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-lime-400/20 flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 stroke-[2.5] ${isUpdating ? 'animate-spin' : ''}`} />
                <span>{isUpdating ? 'Mise à jour en cours...' : 'Mettre à jour en 1-Clic'}</span>
                {!isUpdating && <ArrowRight className="w-4 h-4 ml-1" />}
              </button>

              {/* Native APK / iOS Direct Download alternative */}
              {(serverVersionInfo?.downloadApkUrl || serverVersionInfo?.downloadIosUrl) && (
                <div className="pt-2 border-t border-zinc-800 text-center">
                  <p className="text-[11px] text-zinc-400">
                    Vous avez l'application mobile Android (.APK) ou iOS (.IPA) ?
                  </p>
                  <div className="flex justify-center space-x-3 mt-2">
                    {serverVersionInfo.downloadApkUrl && (
                      <a
                        href={serverVersionInfo.downloadApkUrl}
                        download="NutriPulse-AI-v1.0.apk"
                        className="text-[11px] font-bold text-lime-400 hover:underline inline-flex items-center space-x-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Télécharger APK Android</span>
                      </a>
                    )}
                    {serverVersionInfo.downloadIosUrl && (
                      <a
                        href={serverVersionInfo.downloadIosUrl}
                        download="NutriPulse-AI-v1.0.ipa"
                        className="text-[11px] font-bold text-sky-400 hover:underline inline-flex items-center space-x-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Télécharger Fichier iOS</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Later Dismiss button */}
              <button
                onClick={onClose}
                className="w-full py-2.5 text-zinc-400 hover:text-white font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Plus tard
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
