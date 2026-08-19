import React from 'react';
import { ComplicationSlot, ComplicationType } from '../types';
import {
  X,
  Battery,
  Heart,
  Footprints,
  CloudSun,
  Zap,
  Activity,
  CheckCircle2,
} from 'lucide-react';

interface ComplicationDetailModalProps {
  slot: ComplicationSlot | null;
  type: ComplicationType | null;
  onClose: () => void;
  lang: 'ar' | 'en';
}

export const ComplicationDetailModal: React.FC<ComplicationDetailModalProps> = ({
  slot,
  type,
  onClose,
  lang,
}) => {
  if (!slot || !type || type === 'none') return null;

  const isAr = lang === 'ar';

  const renderContent = () => {
    switch (type) {
      case 'battery':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-emerald-950/40 p-4 rounded-2xl border border-emerald-800/40">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Battery size={28} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-300">84%</div>
                  <div className="text-xs text-emerald-400/80">
                    {isAr ? 'متبقي حوالي 28 ساعة و30 دقيقة' : 'Approx. 28h 30m remaining'}
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-full font-medium">
                {isAr ? 'كفاءة A+' : 'Efficiency A+'}
              </span>
            </div>

            <div className="bg-neutral-900/60 p-3.5 rounded-xl border border-neutral-800">
              <div className="text-xs font-medium text-neutral-400 mb-2 flex items-center justify-between">
                <span>{isAr ? 'استهلاك الطاقة خلال 24 ساعة' : '24h Power Consumption'}</span>
                <span className="text-emerald-400 font-mono">1.2% / hr</span>
              </div>
              <div className="h-16 flex items-end gap-1.5 pt-2">
                {[100, 96, 92, 90, 88, 86, 84].map((val, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-emerald-500/60 hover:bg-emerald-400 rounded-t transition-all"
                      style={{ height: `${val * 0.5}px` }}
                    />
                    <span className="text-[9px] text-neutral-500">{`${idx * 4}h`}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'heart_rate':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-rose-950/40 p-4 rounded-2xl border border-rose-800/40">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center animate-pulse">
                  <Heart size={28} className="fill-rose-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-rose-300">
                    76 <span className="text-xs font-normal text-rose-400/80">BPM</span>
                  </div>
                  <div className="text-xs text-rose-400/80">
                    {isAr ? 'نبض أثناء الراحة: 62 BPM' : 'Resting Heart Rate: 62 BPM'}
                  </div>
                </div>
              </div>
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-800/40">
                <CheckCircle2 size={12} /> {isAr ? 'طبيعي' : 'Normal'}
              </span>
            </div>

            <div className="bg-neutral-900/60 p-3.5 rounded-xl border border-neutral-800">
              <div className="text-xs font-medium text-neutral-400 mb-2">
                {isAr ? 'تخطيط النبض اللحظي (Fitbit ECG)' : 'Live Pulse Monitor (Fitbit ECG)'}
              </div>
              <div className="h-16 flex items-center justify-center text-rose-400">
                <Activity size={48} className="animate-pulse w-full h-12" />
              </div>
            </div>
          </div>
        );

      case 'steps':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-sky-950/40 p-4 rounded-2xl border border-sky-800/40">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Footprints size={28} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-sky-300">
                    8,420 <span className="text-xs font-normal text-sky-400/80">/ 10,000</span>
                  </div>
                  <div className="text-xs text-sky-400/80">
                    {isAr ? '84% من هدف النشاط اليومي' : '84% of daily goal'}
                  </div>
                </div>
              </div>
              <span className="text-xs font-semibold text-sky-300 font-mono">6.2 km</span>
            </div>

            <div className="bg-neutral-900/60 p-3 rounded-xl border border-neutral-800 flex justify-around text-center text-xs">
              <div>
                <div className="text-neutral-500 text-[10px]">{isAr ? 'السعرات' : 'Calories'}</div>
                <div className="font-bold text-amber-300">540 kcal</div>
              </div>
              <div className="w-px h-8 bg-neutral-800" />
              <div>
                <div className="text-neutral-500 text-[10px]">{isAr ? 'الدقائق النشطة' : 'Active Mins'}</div>
                <div className="font-bold text-emerald-300">42 min</div>
              </div>
              <div className="w-px h-8 bg-neutral-800" />
              <div>
                <div className="text-neutral-500 text-[10px]">{isAr ? 'الطوابق' : 'Floors'}</div>
                <div className="font-bold text-sky-300">14</div>
              </div>
            </div>
          </div>
        );

      case 'weather':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-amber-950/40 p-4 rounded-2xl border border-amber-800/40">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <CloudSun size={28} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-amber-300">24°C</div>
                  <div className="text-xs text-amber-400/80">
                    {isAr ? 'مشمس جزئياً، الرطوبة 45%' : 'Partly Sunny, Humidity 45%'}
                  </div>
                </div>
              </div>
              <span className="text-xs text-amber-200">الرياض / دبي</span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              {[
                { time: '13:00', temp: '24°', icon: '☀️' },
                { time: '16:00', temp: '26°', icon: '🌤️' },
                { time: '19:00', temp: '21°', icon: '⛅' },
                { time: '22:00', temp: '18°', icon: '🌙' },
              ].map((item, i) => (
                <div key={i} className="bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800">
                  <span className="text-[10px] text-neutral-400">{item.time}</span>
                  <div className="text-lg my-0.5">{item.icon}</div>
                  <span className="font-bold text-neutral-200">{item.temp}</span>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="p-4 bg-neutral-900/60 rounded-2xl border border-neutral-800 text-center text-sm text-neutral-300">
            {isAr
              ? `عنصر التعقيد (${type}) مفعّل وجاهز لاستقبال البيانات اللحظية عبر Wearable Data Layer API.`
              : `Complication element (${type}) active and receiving live sensor telemetry.`}
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
      <div
        className="bg-neutral-900 border border-neutral-700/80 w-full max-w-md rounded-3xl p-5 shadow-2xl relative"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center justify-between mb-4 border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-sky-400" />
            <h3 className="font-bold text-base text-neutral-100">
              {isAr ? `تفاصيل التعقيد (${slot})` : `Complication Telemetry (${slot})`}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {renderContent()}

        <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
          <span className="font-mono text-[11px] text-neutral-500">
            WFF Component Slot: {slot?.toUpperCase()}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-full font-medium transition-colors"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
