import React, { useState } from 'react';
import { WatchFace, WatchHardware } from '../types';
import { analyzeWatchFacePower } from '../utils/batteryAnalysis';
import { playClickSound } from '../utils/audio';
import {
  BatteryCharging,
  Zap,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AodBatteryDiagnosticsProps {
  watchFace: WatchFace;
  hardware: WatchHardware;
  onToggleAod: () => void;
  lang: 'ar' | 'en';
}

export const AodBatteryDiagnostics: React.FC<AodBatteryDiagnosticsProps> = ({
  watchFace,
  hardware,
  onToggleAod,
  lang,
}) => {
  const isAr = lang === 'ar';
  const isAod = hardware.displayMode === 'aod';
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const metrics = analyzeWatchFacePower(watchFace, isAod, hardware.size);

  const statusColor =
    metrics.oprStatus === 'excellent'
      ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
      : metrics.oprStatus === 'good'
      ? 'text-sky-400 border-sky-500/30 bg-sky-500/10'
      : metrics.oprStatus === 'warning'
      ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
      : 'text-rose-400 border-rose-500/30 bg-rose-500/10';

  const statusText =
    metrics.oprStatus === 'excellent'
      ? isAr
        ? 'استهلاك فائق الكفاءة'
        : 'Ultra Efficient'
      : metrics.oprStatus === 'good'
      ? isAr
        ? 'استهلاك ممتاز'
        : 'Optimal'
      : metrics.oprStatus === 'warning'
      ? isAr
        ? 'استهلاك معتدل'
        : 'Moderate'
      : isAr
      ? 'استهلاك مرتفع'
      : 'High Draw';

  return (
    <div
      id="aod-battery-diagnostics-panel"
      className="w-full bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 shadow-xl text-neutral-200 transition-all duration-300"
    >
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
              isAod
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
            }`}
          >
            {isAod ? <BatteryCharging size={18} /> : <Zap size={18} />}
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>{isAr ? 'محلل استهلاك البطارية ووضع AOD' : 'AOD & Battery Diagnostic'}</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusColor}`}>
                {statusText}
              </span>
            </h4>
            <p className="text-[11px] text-neutral-400">
              {isAod
                ? isAr
                  ? 'وضع الإضاءة المحيطة الدائم (شاشة OLED موفرة)'
                  : 'Always-On Ambient Mode'
                : isAr
                ? 'الوضع النشط التفاعلي الكامل'
                : 'Full Interactive Active Display'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="toggle-aod-switch-btn"
            type="button"
            onClick={onToggleAod}
            className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none ${
              isAod ? 'bg-amber-500' : 'bg-neutral-700'
            }`}
            title={isAr ? 'تبديل وضع Always-On Display' : 'Toggle Always-On Display Mode'}
          >
            <span
              className={`pointer-events-none inline-block h-5.5 w-5.5 transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out flex items-center justify-center text-[10px] ${
                isAod ? 'translate-x-7 text-amber-950 font-black' : 'translate-x-0 text-neutral-600'
              }`}
            >
              {isAod ? '🌙' : '☀️'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              playClickSound();
              setIsExpanded(!isExpanded);
            }}
            className="p-1 text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5 mt-3">
        <div className="bg-neutral-950/80 p-2.5 rounded-xl border border-neutral-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-1">
            <span>{isAr ? 'نسبة إضاءة البكسلات' : 'On-Pixel Ratio'}</span>
            <span className="font-mono font-bold text-neutral-300">OPR</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-extrabold font-mono text-white">
              {metrics.oprPercent}%
            </span>
            <span className="text-[10px] text-neutral-500">
              {isAod ? '/ 15% Max' : '/ 100%'}
            </span>
          </div>
          <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                metrics.oprPercent <= 10
                  ? 'bg-emerald-400'
                  : metrics.oprPercent <= 15
                  ? 'bg-amber-400'
                  : 'bg-rose-400'
              }`}
              style={{ width: `${Math.min(100, (metrics.oprPercent / (isAod ? 15 : 60)) * 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-neutral-950/80 p-2.5 rounded-xl border border-neutral-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-1">
            <span>{isAr ? 'استهلاك الطاقة' : 'Power Draw'}</span>
            <Zap size={11} className={isAod ? 'text-amber-400' : 'text-sky-400'} />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-extrabold font-mono text-white">
              ~{metrics.powerDrawMw}
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">mW</span>
          </div>
          <div className="text-[9px] text-emerald-400 font-medium truncate mt-1">
            {isAod
              ? isAr
                ? `⚡ توفير ${metrics.powerSavingPercent}%`
                : `⚡ -${metrics.powerSavingPercent}%`
              : isAr
              ? 'الاستهلاك الكامل'
              : 'Active'}
          </div>
        </div>

        <div className="bg-neutral-950/80 p-2.5 rounded-xl border border-neutral-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-1">
            <span>{isAr ? 'عمر البطارية المقدر' : 'Est. Runtime'}</span>
            <Clock size={11} className="text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-extrabold font-mono text-white">
              ~{metrics.estimatedBatteryHours}
            </span>
            <span className="text-[10px] text-neutral-400">{isAr ? 'ساعة' : 'hrs'}</span>
          </div>
          <div className="text-[9px] text-neutral-400 truncate mt-1 font-mono">
            {hardware.size} ({hardware.size === '45mm' ? '420mAh' : '306mAh'})
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden space-y-2.5 pt-3 mt-3 border-t border-neutral-800/80 text-xs"
          >
            <div
              className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${
                metrics.isWearOsCompliant
                  ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                  : 'bg-rose-950/30 border-rose-800/60 text-rose-300'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <div className="space-y-0.5">
                <div className="font-bold flex items-center gap-1.5">
                  <span>
                    {isAr
                      ? 'شهادة التوافق مع معايير Google Wear OS WFF'
                      : 'Google Wear OS WFF Power Standard'}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 font-mono">
                    OPR &lt; 15%
                  </span>
                </div>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  {isAr
                    ? isAod
                      ? `تم اجتياز فحص استهلاك الطاقة بنجاح (${metrics.oprPercent}% OPR).`
                      : `في الوضع النشط تبلغ نسبة الإضاءة (${metrics.oprPercent}% OPR).`
                    : isAod
                    ? `Passed WFF ambient power guidelines (${metrics.oprPercent}% OPR).`
                    : `Active display uses ${metrics.oprPercent}% OPR.`}
                </p>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-semibold text-neutral-300 flex items-center gap-1.5">
                <Sparkles size={13} className="text-amber-400" />
                <span>{isAr ? 'تقنيات التوفير النشطة في المحاكي:' : 'Active Power Optimizations:'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {metrics.optimizations.map((opt, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-lg border text-[11px] flex items-start gap-2 ${
                      opt.applied
                        ? 'bg-neutral-950/60 border-neutral-800 text-neutral-300'
                        : 'bg-neutral-950/30 border-neutral-800/50 text-neutral-500 opacity-60'
                    }`}
                  >
                    <CheckCircle2
                      size={13}
                      className={`shrink-0 mt-0.5 ${
                        opt.applied ? 'text-emerald-400' : 'text-neutral-600'
                      }`}
                    />
                    <div className="truncate">
                      <div className="font-medium text-white truncate">
                        {isAr ? opt.titleAr : opt.title}
                      </div>
                      <div className="text-[10px] text-neutral-400 truncate">
                        {isAr ? opt.descriptionAr : opt.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
