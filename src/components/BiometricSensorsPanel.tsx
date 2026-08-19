import React from 'react';
import { BiometricSensorData } from '../types';
import {
  Heart,
  Footprints,
  Flame,
  Activity,
  Zap,
  RotateCw,
  Play,
  Pause,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { playClickSound, playSensorSlideSound } from '../utils/audio';

interface BiometricSensorsPanelProps {
  sensorData: BiometricSensorData;
  onSensorDataChange: (data: Partial<BiometricSensorData>) => void;
  crownTarget: 'steps' | 'heart_rate' | 'battery';
  onCrownTargetChange: (target: 'steps' | 'heart_rate' | 'battery') => void;
  lang: 'ar' | 'en';
  isLiveSimulating?: boolean;
  onToggleLiveSimulation?: () => void;
}

export const BiometricSensorsPanel: React.FC<BiometricSensorsPanelProps> = ({
  sensorData,
  onSensorDataChange,
  crownTarget,
  onCrownTargetChange,
  lang,
  isLiveSimulating = false,
  onToggleLiveSimulation,
}) => {
  const isAr = lang === 'ar';

  const getHeartRateZone = (bpm: number) => {
    if (bpm < 70) {
      return {
        nameAr: 'وقت الراحة (Resting)',
        nameEn: 'Resting Zone',
        color: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
        barColor: 'bg-sky-400',
      };
    }
    if (bpm < 120) {
      return {
        nameAr: 'حرق الدهون (Fat Burn)',
        nameEn: 'Fat Burn Zone',
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        barColor: 'bg-amber-400',
      };
    }
    if (bpm < 160) {
      return {
        nameAr: 'تمارين هوائية (Cardio)',
        nameEn: 'Cardio Aerobic',
        color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
        barColor: 'bg-rose-500',
      };
    }
    return {
      nameAr: 'أقصى جهد (Peak Effort)',
      nameEn: 'Peak Performance',
      color: 'text-red-500 bg-red-500/20 border-red-500/40',
      barColor: 'bg-red-600',
    };
  };

  const hrZone = getHeartRateZone(sensorData.heartRate);
  const stepPercent = Math.round((sensorData.steps / (sensorData.stepGoal || 10000)) * 100);
  const estimatedKm = (sensorData.steps * 0.00078).toFixed(2);
  const autoCalories = Math.round(
    sensorData.steps * 0.042 + (sensorData.heartRate > 90 ? (sensorData.heartRate - 90) * 2.5 : 0)
  );

  const presets = [
    {
      id: 'rest',
      labelAr: '🧘 راحة',
      labelEn: '🧘 Rest',
      hr: 64,
      steps: 1850,
    },
    {
      id: 'walk',
      labelAr: '🚶 مشي',
      labelEn: '🚶 Walk',
      hr: 96,
      steps: 6400,
    },
    {
      id: 'run',
      labelAr: '🏃 ركض',
      labelEn: '🏃 Run',
      hr: 152,
      steps: 12800,
    },
    {
      id: 'hiit',
      labelAr: '🚴 تمرين مكثف',
      labelEn: '🚴 HIIT',
      hr: 178,
      steps: 18900,
    },
  ];

  const handlePresetSelect = (hr: number, steps: number) => {
    playClickSound();
    onSensorDataChange({
      heartRate: hr,
      steps: steps,
      calories: Math.round(steps * 0.042 + (hr > 90 ? (hr - 90) * 2.5 : 0)),
    });
  };

  return (
    <div
      id="biometric-sensors-simulator"
      className="w-full bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-4 shadow-xl text-neutral-200 transition-all duration-300 space-y-4"
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Activity size={18} className="animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>{isAr ? 'محاكي المستشعرات الحيوية' : 'Biometric Sensor Simulator'}</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Live Sensor Sync
              </span>
            </h4>
            <p className="text-[11px] text-neutral-400">
              {isAr
                ? 'حرّك أشرطة التمرير لمشاهدة تحديث التعقيدات على شاشة الساعة فوراً'
                : 'Adjust sliders to preview instant complication gauge updates'}
            </p>
          </div>
        </div>

        {onToggleLiveSimulation && (
          <button
            id="toggle-live-simulation-btn"
            type="button"
            onClick={onToggleLiveSimulation}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
              isLiveSimulating
                ? 'bg-rose-500 text-white shadow-rose-500/30 animate-pulse font-bold'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700'
            }`}
          >
            {isLiveSimulating ? <Pause size={13} /> : <Play size={13} className="fill-current" />}
            <span>{isLiveSimulating ? (isAr ? 'محاكاة حية ⚡' : 'Live Active ⚡') : (isAr ? 'محاكاة تلقائية' : 'Auto Pulse')}</span>
          </button>
        )}
      </div>

      {/* Heart Rate Slider */}
      <div className="bg-neutral-950/70 p-3.5 rounded-xl border border-neutral-800/80 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Heart
              size={16}
              className="text-rose-500 fill-rose-500"
              style={{
                animation: `pulse ${Math.max(0.35, 60 / sensorData.heartRate)}s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
              }}
            />
            <span className="font-bold text-white">
              {isAr ? 'معدل نبضات القلب (Heart Rate)' : 'Heart Rate'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${hrZone.color}`}>
              {isAr ? hrZone.nameAr : hrZone.nameEn}
            </span>
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-base font-extrabold text-white">{sensorData.heartRate}</span>
              <span className="text-[10px] text-neutral-400">BPM</span>
            </div>
          </div>
        </div>

        <input
          id="heart-rate-range-slider"
          type="range"
          min={45}
          max={200}
          step={1}
          value={sensorData.heartRate}
          onChange={(e) => {
            const val = Number(e.target.value);
            playSensorSlideSound();
            onSensorDataChange({
              heartRate: val,
              calories: Math.round(
                sensorData.steps * 0.042 + (val > 90 ? (val - 90) * 2.5 : 0)
              ),
            });
          }}
          className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500 focus:outline-none"
        />
      </div>

      {/* Step Count Slider */}
      <div className="bg-neutral-950/70 p-3.5 rounded-xl border border-neutral-800/80 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Footprints
              size={16}
              className={stepPercent >= 100 ? 'text-emerald-400' : 'text-sky-400'}
            />
            <span className="font-bold text-white">
              {isAr ? 'عداد الخطوات اليومي (Daily Steps)' : 'Daily Step Count'}
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono">
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                stepPercent >= 100
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-sky-500/20 text-sky-300 border-sky-500/30'
              }`}
            >
              {stepPercent}% {isAr ? 'من الهدف' : 'of Goal'}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-extrabold text-white">
                {sensorData.steps.toLocaleString()}
              </span>
              <span className="text-[10px] text-neutral-400">/ 10k</span>
            </div>
          </div>
        </div>

        <input
          id="step-count-range-slider"
          type="range"
          min={0}
          max={25000}
          step={50}
          value={sensorData.steps}
          onChange={(e) => {
            const val = Number(e.target.value);
            playSensorSlideSound();
            onSensorDataChange({
              steps: val,
              calories: Math.round(
                val * 0.042 + (sensorData.heartRate > 90 ? (sensorData.heartRate - 90) * 2.5 : 0)
              ),
            });
          }}
          className={`w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer focus:outline-none ${
            stepPercent >= 100 ? 'accent-emerald-400' : 'accent-sky-500'
          }`}
        />

        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-neutral-800/60 text-[11px]">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <TrendingUp size={12} className="text-sky-400" />
            <span>{isAr ? 'المسافة:' : 'Distance:'}</span>
            <span className="font-mono font-bold text-neutral-200">{estimatedKm} km</span>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-400">
            <Flame size={12} className="text-amber-400" />
            <span>{isAr ? 'السعرات:' : 'Calories:'}</span>
            <span className="font-mono font-bold text-amber-300">
              {sensorData.calories || autoCalories} kcal
            </span>
          </div>
        </div>
      </div>

      {/* Digital Crown Target Selector */}
      <div className="bg-neutral-950/70 p-3 rounded-xl border border-neutral-800/80 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-neutral-300 font-bold">
            <RotateCw size={14} className="text-amber-400" />
            <span>{isAr ? 'التحكم بعجلة التاج:' : 'Crown Wheel Target:'}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => {
              playClickSound();
              onCrownTargetChange('steps');
            }}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
              crownTarget === 'steps'
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 shadow-sm'
                : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:bg-neutral-800'
            }`}
          >
            <Footprints size={13} />
            <span>{isAr ? 'الخطوات' : 'Steps'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playClickSound();
              onCrownTargetChange('heart_rate');
            }}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
              crownTarget === 'heart_rate'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-sm'
                : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:bg-neutral-800'
            }`}
          >
            <Heart size={13} />
            <span>{isAr ? 'النبض' : 'Heart Rate'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playClickSound();
              onCrownTargetChange('battery');
            }}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
              crownTarget === 'battery'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:bg-neutral-800'
            }`}
          >
            <Zap size={13} />
            <span>{isAr ? 'البطارية' : 'Battery'}</span>
          </button>
        </div>
      </div>

      {/* Quick Activity Presets */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1.5">
          <Sparkles size={13} className="text-amber-400" />
          <span>{isAr ? 'أوضاع النشاط السريعة:' : 'Quick Presets:'}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {presets.map((p) => {
            const isMatch =
              Math.abs(sensorData.heartRate - p.hr) <= 5 &&
              Math.abs(sensorData.steps - p.steps) <= 500;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePresetSelect(p.hr, p.steps)}
                className={`p-2 rounded-xl text-xs font-medium border text-left transition-all cursor-pointer ${
                  isMatch
                    ? 'bg-neutral-800 border-sky-500/60 text-white shadow-sm ring-1 ring-sky-500/30'
                    : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:bg-neutral-800/80 hover:text-neutral-200'
                }`}
              >
                <div className="font-bold text-white truncate">{isAr ? p.labelAr : p.labelEn}</div>
                <div className="text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5 font-mono">
                  <span>{p.hr} bpm</span>
                  <span>•</span>
                  <span>{(p.steps / 1000).toFixed(1)}k</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
