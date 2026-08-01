import React, { ErrorInfo, ReactNode } from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  declare props: Props;
  declare state: State;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught Error in NutriPulse Application:', error, errorInfo);

    const isChunkError =
      error.name === 'ChunkLoadError' ||
      error.message?.includes('Loading chunk') ||
      error.message?.includes('Importing a module script failed');

    if (isChunkError) {
      console.log('Chunk load failure detected after update. Triggering auto-reload...');
      const hasReloaded = sessionStorage.getItem('nutripulse_chunk_reloaded');
      if (!hasReloaded) {
        sessionStorage.setItem('nutripulse_chunk_reloaded', 'true');
        window.location.reload();
      }
    }
  }

  handleReload = () => {
    sessionStorage.removeItem('nutripulse_chunk_reloaded');
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      });
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 font-sans">
          <div className="bg-zinc-950 border border-lime-400/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-5 animate-fade-in">
            <div className="w-14 h-14 bg-lime-400/10 border border-lime-400/30 text-lime-400 rounded-2xl mx-auto flex items-center justify-center">
              <Sparkles className="w-7 h-7" />
            </div>
            
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-lime-400 block">
                MISE À JOUR DE L'APPLICATION
              </span>
              <h1 className="text-xl font-black uppercase tracking-tight">
                Optimisation en cours
              </h1>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Une nouvelle version du site et de l'application a été déployée. Vos repas et données enregistrés sont en sécurité.
              </p>
            </div>

            <button
              onClick={this.handleReload}
              className="w-full py-4 px-5 bg-lime-400 hover:bg-lime-300 text-black font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-lime-400/20 flex items-center justify-center space-x-2 transition-all active:scale-95"
            >
              <RefreshCw className="w-5 h-5 stroke-[2.5]" />
              <span>Rafraîchir l'application (1-Clic)</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
