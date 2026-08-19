import React from 'react';
import { WatchFace, AppView } from '../types';
import { Watch, Store, Sliders, RefreshCw } from 'lucide-react';
import { playClickSound } from '../utils/audio';
import { motion } from 'motion/react';
import { hexToRgb, rgbToHsl, hslToHex } from '../utils/materialColorExtractor';

interface MobileBottomNavBarProps {
  activeView: AppView;
  onViewChange: (view: AppView) => void;
  watchFace: WatchFace;
  lang: 'ar' | 'en';
}

export const MobileBottomNavBar: React.FC<MobileBottomNavBarProps> = ({
  activeView,
  onViewChange,
  watchFace,
  lang,
}) => {
  const isAr = lang === 'ar';

  // Compute dynamic Material You color tokens from current watchface palette
  const primaryHex = watchFace?.colors?.primary || '#8AB4F8';
  const accentHex = watchFace?.colors?.accent || '#A8C7FA';

  let surfaceTint = '#121316';
  let activePillBg = 'rgba(138, 180, 248, 0.18)';
  let glowColor = 'rgba(138, 180, 248, 0.25)';
  let activeTextColor = primaryHex;

  try {
    const [pr, pg, pb] = hexToRgb(primaryHex);
    const [ph, ps] = rgbToHsl(pr, pg, pb);

    surfaceTint = hslToHex(ph, Math.min(22, Math.max(6, ps * 0.25)), 6);
    activePillBg = `${hslToHex(ph, Math.min(90, ps + 10), 65)}26`;
    glowColor = `${hslToHex(ph, Math.min(90, ps), 70)}30`;
    activeTextColor = hslToHex(ph, Math.min(95, ps + 15), 78);
  } catch {
    surfaceTint = '#121316';
    activePillBg = 'rgba(138, 180, 248, 0.18)';
    glowColor = 'rgba(138, 180, 248, 0.25)';
    activeTextColor = primaryHex;
  }

  const tabs: { id: AppView; label: string; icon: React.ReactNode }[] = [
    {
      id: 'simulator',
      label: isAr ? 'المحاكي' : 'Watch',
      icon: <Watch size={20} className="stroke-[2.2]" />,
    },
    {
      id: 'store',
      label: isAr ? 'المتجر' : 'Store',
      icon: <Store size={20} className="stroke-[2.2]" />,
    },
    {
      id: 'editor',
      label: isAr ? 'المحرر' : 'Studio',
      icon: <Sliders size={20} className="stroke-[2.2]" />,
    },
    {
      id: 'sync',
      label: isAr ? 'المزامنة' : 'Sync',
      icon: <RefreshCw size={20} className="stroke-[2.2]" />,
    },
  ];

  return (
    <nav
      id="mobile-bottom-navigation-bar"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 transition-colors duration-500 backdrop-blur-2xl px-3 py-2 border-t select-none"
      style={{
        backgroundColor: `${surfaceTint}F2`,
        borderColor: `${primaryHex}2A`,
        boxShadow: `0 -8px 24px -4px ${glowColor}, 0 -1px 0 0 ${primaryHex}20`,
      }}
    >
      {/* Top Ambient Material You Accent Line */}
      <div
        className="absolute top-0 left-0 right-0 h-[1.5px] transition-colors duration-500"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${primaryHex}60 30%, ${accentHex}90 50%, ${primaryHex}60 70%, transparent 100%)`,
        }}
      />

      <div className="max-w-md mx-auto flex items-center justify-around gap-1 relative">
        {tabs.map((tab) => {
          const isSelected = activeView === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                playClickSound();
                onViewChange(tab.id);
              }}
              className="relative flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-2xl min-h-[48px] cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              style={{
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {/* Material 3 Expressive Pill Active Indicator */}
              {isSelected && (
                <motion.div
                  layoutId="m3-active-indicator"
                  className="absolute inset-0 rounded-2xl border transition-colors duration-300 pointer-events-none"
                  style={{
                    backgroundColor: activePillBg,
                    borderColor: `${primaryHex}4D`,
                    boxShadow: `0 0 16px ${glowColor}`,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 420,
                    damping: 34,
                  }}
                />
              )}

              {/* Icon Container with scale animation */}
              <div
                className="relative z-10 transition-all duration-300 transform flex items-center justify-center"
                style={{
                  color: isSelected ? activeTextColor : '#9CA3AF',
                  transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                }}
              >
                {tab.icon}
              </div>

              {/* Label */}
              <span
                className="relative z-10 text-[10.5px] mt-0.5 font-medium tracking-tight transition-all duration-300 truncate max-w-[68px] text-center"
                style={{
                  color: isSelected ? activeTextColor : '#9CA3AF',
                  fontWeight: isSelected ? 700 : 500,
                  textShadow: isSelected ? `0 0 10px ${primaryHex}40` : 'none',
                }}
              >
                {tab.label}
              </span>

              {/* Small Active Material You Dot */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="relative z-10 w-1 h-1 rounded-full mt-0.5 transition-colors duration-300"
                  style={{
                    backgroundColor: primaryHex,
                    boxShadow: `0 0 6px ${primaryHex}`,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
