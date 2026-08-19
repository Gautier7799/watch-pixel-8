import React from 'react';
import { WearableDeviceState, AppView } from '../types';
import {
  Watch,
  Store,
  Sliders,
  RefreshCw,
  Sparkles,
  Globe,
} from 'lucide-react';
import { playClickSound } from '../utils/audio';

interface HeaderNavbarProps {
  activeView: AppView;
  onViewChange: (view: AppView) => void;
  deviceState: WearableDeviceState;
  onOpenAiModal: () => void;
  lang: 'ar' | 'en';
  onToggleLang: () => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  activeView,
  onViewChange,
  deviceState,
  onOpenAiModal,
  lang,
  onToggleLang,
}) => {
  const isAr = lang === 'ar';

  return (
    <header className="sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-xl border-b border-neutral-800/80 px-3 sm:px-6 py-2.5 sm:py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* App Brand */}
        <div
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none"
          onClick={() => {
            playClickSound();
            onViewChange('store');
          }}
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-amber-300 p-0.5 shadow-lg shadow-sky-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center text-sky-400">
              <Watch size={20} className="stroke-[2.2]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="font-extrabold text-sm sm:text-lg text-white tracking-tight leading-none">
                Watch Pixel <span className="text-sky-400 font-medium">8</span>
              </h1>
              <span className="text-[9px] sm:text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-1.5 py-0.5 rounded font-mono font-bold">
                WFF
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium hidden xs:block">
              {isAr ? 'متجر ومحرر ومزامنة Wear OS 5' : 'Wear OS 5 • Material 3 Expressive'}
            </p>
          </div>
        </div>

        {/* Center Primary Nav Views (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 bg-neutral-900/90 p-1.5 rounded-2xl border border-neutral-800 text-xs">
          {[
            { id: 'store', label: isAr ? 'متجر الخلفيات' : 'Store Gallery', icon: <Store size={14} /> },
            { id: 'editor', label: isAr ? 'محرر WFF' : 'WFF Studio', icon: <Sliders size={14} /> },
            { id: 'sync', label: isAr ? 'المزامنة والربط' : 'Wearable Sync', icon: <RefreshCw size={14} /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                playClickSound();
                onViewChange(item.id as AppView);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
                activeView === item.id
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Right Tools & Language Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Quick AI Trigger */}
          <button
            id="header-ai-generate-btn"
            type="button"
            onClick={() => {
              playClickSound();
              onOpenAiModal();
            }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-amber-600/20 hover:from-amber-500/20 hover:to-amber-600/30 border border-amber-500/30 text-amber-300 text-xs font-semibold shadow-sm transition-all cursor-pointer"
            title="Gemini AI Face Architect"
          >
            <Sparkles size={14} className="text-amber-400 animate-pulse" />
            <span className="hidden sm:inline">{isAr ? 'توليد ذكي' : 'AI Studio'}</span>
          </button>

          {/* Connected Device Status Pill */}
          <button
            type="button"
            onClick={() => {
              playClickSound();
              onViewChange('sync');
            }}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs text-neutral-300 transition-colors cursor-pointer"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                deviceState.isConnected ? 'bg-emerald-400 animate-ping' : 'bg-neutral-600'
              }`}
            />
            <span className="hidden md:inline font-mono font-medium">Pixel Watch 3</span>
            <span className="text-emerald-400 font-bold font-mono text-[11px] sm:text-xs">
              {deviceState.batteryLevel}%
            </span>
          </button>

          {/* Language Switcher (AR / EN) */}
          <button
            type="button"
            onClick={() => {
              playClickSound();
              onToggleLang();
            }}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-bold text-neutral-300 transition-colors cursor-pointer"
            title={isAr ? 'Switch to English' : 'التحويل للعربية'}
          >
            <Globe size={13} className="text-sky-400" />
            <span>{isAr ? 'EN' : 'عربي'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Top Navigation Pills Bar */}
      <div className="flex md:hidden items-center justify-between gap-1 mt-2.5 pt-2 border-t border-neutral-800/80 text-xs">
        {[
          { id: 'simulator', label: isAr ? 'المحاكي' : 'Watch', icon: <Watch size={13} /> },
          { id: 'store', label: isAr ? 'المتجر' : 'Store', icon: <Store size={13} /> },
          { id: 'editor', label: isAr ? 'المحرر' : 'Editor', icon: <Sliders size={13} /> },
          { id: 'sync', label: isAr ? 'المزامنة' : 'Sync', icon: <RefreshCw size={13} /> },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => {
              playClickSound();
              onViewChange(item.id as AppView);
            }}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-1 rounded-xl font-semibold transition-all cursor-pointer text-[11px] ${
              activeView === item.id
                ? 'bg-sky-500 text-white shadow-sm font-bold'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </header>
  );
};
