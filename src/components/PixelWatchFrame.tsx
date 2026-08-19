import React, { useState, useEffect, useRef } from 'react';
import { WatchFace, WatchHardware, ComplicationSlot, ComplicationType, BiometricSensorData } from '../types';
import { WatchFaceRenderer, DEFAULT_BIOMETRIC_DATA } from './WatchFaceRenderer';
import { playCrownTickSound, playClickSound, playAodToggleSound } from '../utils/audio';
import { Moon, Sun, RotateCw, Sparkles, Smartphone } from 'lucide-react';

interface PixelWatchFrameProps {
  watchFace: WatchFace;
  hardware: WatchHardware;
  onHardwareChange?: (hw: Partial<WatchHardware>) => void;
  onComplicationClick?: (slot: ComplicationSlot, type: ComplicationType) => void;
  currentTime?: Date;
  onQuickPush?: () => void;
  isSyncing?: boolean;
  sensorData?: BiometricSensorData;
  onSensorDataChange?: (data: Partial<BiometricSensorData>) => void;
  crownTarget?: 'steps' | 'heart_rate' | 'battery';
  onCrownTargetChange?: (target: 'steps' | 'heart_rate' | 'battery') => void;
}

export const PixelWatchFrame: React.FC<PixelWatchFrameProps> = ({
  watchFace,
  hardware,
  onHardwareChange,
  onComplicationClick,
  currentTime,
  onQuickPush,
  isSyncing = false,
  sensorData = DEFAULT_BIOMETRIC_DATA,
  onSensorDataChange,
  crownTarget = 'steps',
}) => {
  const [crownRotation, setCrownRotation] = useState(0);
  const [isCrownPressed, setIsCrownPressed] = useState(false);
  const [lastDeltaInfo, setLastDeltaInfo] = useState<string | null>(null);
  const deltaTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const [windowWidth, setWindowWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const caseColorClasses = {
    matte_black: 'from-neutral-800 via-neutral-900 to-black border-neutral-700 shadow-2xl',
    silver: 'from-slate-200 via-slate-300 to-slate-400 border-slate-200 shadow-2xl',
    champagne_gold: 'from-amber-100 via-amber-200 to-amber-300 border-amber-200 shadow-2xl',
    hazel: 'from-stone-600 via-stone-700 to-stone-800 border-stone-600 shadow-2xl',
  };

  const crownColors = {
    matte_black: 'bg-neutral-800 border-neutral-600',
    silver: 'bg-slate-300 border-slate-400',
    champagne_gold: 'bg-amber-200 border-amber-300',
    hazel: 'bg-stone-700 border-stone-500',
  };

  const bandStyles: Record<string, string> = {
    active: 'bg-gradient-to-b from-stone-800 via-stone-900 to-black shadow-lg',
    woven: 'bg-gradient-to-b from-teal-900 via-teal-950 to-stone-900 border-x border-teal-800/30',
    leather: 'bg-gradient-to-b from-amber-950 via-stone-900 to-amber-950 border-x border-amber-900/40',
    mesh: 'bg-gradient-to-b from-slate-400 via-slate-600 to-slate-700 shadow-xl',
  };

  const handleCrownRotate = (direction: 'up' | 'down') => {
    playCrownTickSound();
    setCrownRotation((prev) => prev + (direction === 'up' ? 24 : -24));

    if (onSensorDataChange) {
      if (crownTarget === 'steps') {
        const stepDelta = direction === 'up' ? 250 : -250;
        const newSteps = Math.min(25000, Math.max(0, sensorData.steps + stepDelta));
        onSensorDataChange({
          steps: newSteps,
          calories: Math.round(newSteps * 0.042 + (sensorData.heartRate > 90 ? (sensorData.heartRate - 90) * 2.5 : 0)),
        });
        setLastDeltaInfo(`${stepDelta > 0 ? '+' : ''}${stepDelta} خطوة`);
      } else if (crownTarget === 'heart_rate') {
        const hrDelta = direction === 'up' ? 3 : -3;
        const newHr = Math.min(200, Math.max(45, sensorData.heartRate + hrDelta));
        onSensorDataChange({
          heartRate: newHr,
          calories: Math.round(sensorData.steps * 0.042 + (newHr > 90 ? (newHr - 90) * 2.5 : 0)),
        });
        setLastDeltaInfo(`${hrDelta > 0 ? '+' : ''}${hrDelta} BPM`);
      } else if (crownTarget === 'battery') {
        const batDelta = direction === 'up' ? 5 : -5;
        const newBat = Math.min(100, Math.max(5, sensorData.battery + batDelta));
        onSensorDataChange({ battery: newBat });
        setLastDeltaInfo(`${batDelta > 0 ? '+' : ''}${batDelta}%`);
      }

      if (deltaTimeoutRef.current) clearTimeout(deltaTimeoutRef.current);
      deltaTimeoutRef.current = setTimeout(() => {
        setLastDeltaInfo(null);
      }, 1200);
    }
  };

  const toggleAod = () => {
    const nextMode = hardware.displayMode === 'aod' ? 'active' : 'aod';
    playAodToggleSound(nextMode === 'aod');
    onHardwareChange?.({ displayMode: nextMode });
  };

  const isAod = hardware.displayMode === 'aod';
  const isSmallScreen = windowWidth < 400;
  const isMediumScreen = windowWidth < 640;

  const watchDiameter = isSmallScreen
    ? hardware.size === '45mm'
      ? 265
      : 245
    : isMediumScreen
    ? hardware.size === '45mm'
      ? 290
      : 270
    : hardware.size === '45mm'
    ? 320
    : 290;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartYRef.current === null) return;
    const currentY = e.touches[0].clientY;
    const diff = touchStartYRef.current - currentY;
    if (Math.abs(diff) > 16) {
      handleCrownRotate(diff > 0 ? 'up' : 'down');
      touchStartYRef.current = currentY;
    }
  };

  const handleTouchEnd = () => {
    touchStartYRef.current = null;
    setIsCrownPressed(false);
  };

  return (
    <div className="flex flex-col items-center justify-center relative select-none py-2">
      {/* Quick Controls Bar above Watch */}
      <div className="flex items-center gap-2 mb-3 bg-neutral-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-neutral-800 shadow-md text-xs text-neutral-300">
        <button
          id="simulator-aod-toggle-btn"
          type="button"
          onClick={toggleAod}
          className={`flex items-center gap-2 px-3 py-1 rounded-full transition-all duration-200 cursor-pointer ${
            isAod
              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm shadow-amber-500/20 font-bold'
              : 'bg-neutral-800/80 hover:bg-neutral-700/80 text-neutral-300 hover:text-white border border-neutral-700/50'
          }`}
          title="معاينة وضع الإضاءة المحيطة الدائمة AOD / Always-on Display"
        >
          <div
            className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] transition-transform ${
              isAod ? 'bg-amber-400 text-neutral-950 rotate-0' : 'bg-neutral-700 text-amber-400 rotate-180'
            }`}
          >
            {isAod ? <Moon size={11} className="fill-current" /> : <Sun size={11} />}
          </div>
          <span>{isAod ? 'وضع الإضاءة المحيطة (AOD)' : 'وضع الشاشة النشط'}</span>
        </button>

        <span className="w-px h-3.5 bg-neutral-700" />

        <button
          onClick={() => {
            playClickSound();
            onHardwareChange?.({ size: hardware.size === '41mm' ? '45mm' : '41mm' });
          }}
          className="px-2.5 py-1 rounded-full hover:bg-neutral-800 font-mono text-[11px] text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
          title="Pixel Watch Size (41mm / 45mm)"
        >
          {hardware.size}
        </button>

        {onQuickPush && (
          <>
            <span className="w-px h-3.5 bg-neutral-700" />
            <button
              onClick={onQuickPush}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-medium rounded-full shadow-sm shadow-sky-500/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Smartphone size={13} />
              <span>{isSyncing ? 'جاري الدفع...' : 'دفع للساعة'}</span>
            </button>
          </>
        )}
      </div>

      {/* Main Watch Assembly */}
      <div className="relative flex flex-col items-center">
        {/* Top Watch Band Strap */}
        <div
          className={`w-32 h-16 rounded-t-xl overflow-hidden transition-all duration-300 ${
            bandStyles[hardware.bandType] || bandStyles.active
          }`}
          style={{
            backgroundColor: hardware.bandColor !== '#222' ? hardware.bandColor : undefined,
          }}
        >
          <div className="w-full h-full bg-black/20 flex items-center justify-center">
            <div className="w-16 h-1 bg-white/10 rounded-full" />
          </div>
        </div>

        {/* Case & Bezel Circle with Crown */}
        <div
          className="relative flex items-center justify-center"
          onWheel={(e) => {
            e.preventDefault();
            handleCrownRotate(e.deltaY > 0 ? 'down' : 'up');
          }}
        >
          {/* Side Secondary Button */}
          <button
            onClick={() => {
              playClickSound();
              toggleAod();
            }}
            className={`absolute -right-3 top-16 w-2.5 h-6 rounded-r-md border transition-transform active:scale-95 cursor-pointer ${
              crownColors[hardware.caseColor]
            }`}
            title="Pixel Watch Side Button"
          />

          {/* Rotating Crown */}
          <div className="absolute -right-5 top-1/2 -translate-y-1/2 flex flex-col items-center z-20">
            <button
              id="pixel-watch-crown-btn"
              onClick={() => handleCrownRotate('up')}
              onMouseDown={() => setIsCrownPressed(true)}
              onMouseUp={() => setIsCrownPressed(false)}
              onTouchStart={(e) => {
                setIsCrownPressed(true);
                handleTouchStart(e);
              }}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
              onWheel={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCrownRotate(e.deltaY > 0 ? 'down' : 'up');
              }}
              className={`w-5 sm:w-4.5 h-14 sm:h-13 rounded-r-lg border shadow-lg flex flex-col justify-around py-1 transition-all cursor-pointer select-none touch-none active:scale-95 ${
                crownColors[hardware.caseColor]
              } ${isCrownPressed ? 'translate-x-0.5' : ''}`}
              title="تاج Pixel Watch الدوار"
            >
              <div
                className="w-full h-full flex flex-col justify-between py-0.5 transition-transform"
                style={{ transform: `translateY(${crownRotation % 8}px)` }}
              >
                <div className="w-2.5 h-0.5 bg-black/40 rounded-full mx-auto" />
                <div className="w-2.5 h-0.5 bg-black/40 rounded-full mx-auto" />
                <div className="w-2.5 h-0.5 bg-black/40 rounded-full mx-auto" />
                <div className="w-2.5 h-0.5 bg-black/40 rounded-full mx-auto" />
              </div>
            </button>

            {lastDeltaInfo && (
              <div className="absolute -right-16 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-md bg-neutral-900 border border-sky-500/50 shadow-xl text-[10px] font-mono text-sky-300 font-bold whitespace-nowrap animate-fade-in pointer-events-none z-30">
                {lastDeltaInfo}
              </div>
            )}
          </div>

          {/* Outer Bezel */}
          <div
            className={`rounded-full p-2.5 bg-gradient-to-tr border transition-all duration-300 relative shadow-[0_20px_50px_rgba(0,0,0,0.8)] ${
              caseColorClasses[hardware.caseColor]
            }`}
            style={{
              width: `${watchDiameter + 36}px`,
              height: `${watchDiameter + 36}px`,
            }}
          >
            {/* Curved Glass Bezel */}
            <div className="w-full h-full rounded-full bg-black p-2 relative overflow-hidden shadow-inner flex items-center justify-center">
              <WatchFaceRenderer
                watchFace={watchFace}
                currentTime={currentTime}
                isAod={isAod}
                size={watchDiameter}
                onComplicationClick={onComplicationClick}
                sensorData={sensorData}
              />

              {isAod && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-20 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 border border-amber-400/30 backdrop-blur-xs text-[9px] font-mono text-amber-300 shadow-sm animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>AOD Low Power</span>
                </div>
              )}

              <div className="absolute inset-0 rounded-full pointer-events-none bg-gradient-to-tr from-white/10 via-transparent to-white/5 opacity-60 mix-blend-overlay" />
              <div className="absolute -top-10 -left-10 w-44 h-44 rounded-full bg-white/5 blur-xl pointer-events-none" />

              {isSyncing && (
                <div className="absolute inset-0 rounded-full bg-sky-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-white z-30 animate-fade-in">
                  <div className="relative mb-2">
                    <RotateCw className="animate-spin text-sky-400" size={32} />
                    <Sparkles
                      className="absolute -top-1 -right-1 text-amber-300 animate-bounce"
                      size={14}
                    />
                  </div>
                  <span className="text-xs font-medium text-sky-200">
                    جاري التحديث عبر DataClient...
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Watch Band Strap */}
        <div
          className={`w-32 h-20 rounded-b-xl overflow-hidden transition-all duration-300 ${
            bandStyles[hardware.bandType] || bandStyles.active
          }`}
          style={{
            backgroundColor: hardware.bandColor !== '#222' ? hardware.bandColor : undefined,
          }}
        >
          <div className="w-full h-full bg-black/20 flex flex-col items-center justify-center gap-2 pt-2">
            <div className="w-4 h-1.5 bg-black/50 rounded-full" />
            <div className="w-4 h-1.5 bg-black/50 rounded-full" />
            <div className="w-4 h-1.5 bg-black/50 rounded-full" />
          </div>
        </div>
      </div>

      {/* Hardware Customizer Quick Pills */}
      <div className="mt-3 flex items-center gap-3 text-xs text-neutral-400">
        <span className="text-[11px] text-neutral-500 font-medium">الهيكل:</span>
        <div className="flex items-center gap-1.5">
          {(['matte_black', 'silver', 'champagne_gold', 'hazel'] as const).map((c) => (
            <button
              key={c}
              onClick={() => {
                playClickSound();
                onHardwareChange?.({ caseColor: c });
              }}
              className={`w-5 h-5 rounded-full border transition-all cursor-pointer ${
                hardware.caseColor === c ? 'scale-110 ring-2 ring-sky-500' : 'opacity-70 hover:opacity-100'
              } ${
                c === 'matte_black'
                  ? 'bg-neutral-900 border-neutral-700'
                  : c === 'silver'
                  ? 'bg-slate-200 border-slate-400'
                  : c === 'champagne_gold'
                  ? 'bg-amber-200 border-amber-300'
                  : 'bg-stone-700 border-stone-600'
              }`}
              title={c}
            />
          ))}
        </div>

        <span className="w-px h-3 bg-neutral-800 mx-1" />

        <span className="text-[11px] text-neutral-500 font-medium">السوار:</span>
        <div className="flex items-center gap-1">
          {(['active', 'woven', 'leather', 'mesh'] as const).map((b) => (
            <button
              key={b}
              onClick={() => {
                playClickSound();
                onHardwareChange?.({ bandType: b });
              }}
              className={`px-2 py-0.5 rounded text-[10px] capitalize transition-all cursor-pointer ${
                hardware.bandType === b
                  ? 'bg-neutral-700 text-white font-medium'
                  : 'hover:bg-neutral-800 text-neutral-400'
              }`}
            >
              {b === 'active' ? 'رياضي' : b === 'woven' ? 'منسوج' : b === 'leather' ? 'جلد' : 'معدني'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
