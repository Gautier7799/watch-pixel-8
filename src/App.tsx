/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  WatchFace,
  WatchHardware,
  WearableDeviceState,
  ComplicationSlot,
  ComplicationType,
  BiometricSensorData,
  AppView,
} from './types';
import { INITIAL_WATCHFACES } from './data/watchfaces';
import { HeaderNavbar } from './components/HeaderNavbar';
import { PixelWatchFrame } from './components/PixelWatchFrame';
import { BiometricSensorsPanel } from './components/BiometricSensorsPanel';
import { AodBatteryDiagnostics } from './components/AodBatteryDiagnostics';
import { StoreGallery } from './components/StoreGallery';
import { WffEditor } from './components/WffEditor';
import { SyncHub } from './components/SyncHub';
import { ComplicationDetailModal } from './components/ComplicationDetailModal';
import { AiGeneratorModal } from './components/AiGeneratorModal';
import { MobileBottomNavBar } from './components/MobileBottomNavBar';
import { downloadWffXmlFile } from './utils/wffGenerator';
import { playSyncSuccessChime, playClickSound } from './utils/audio';
import { Watch, Eye } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [activeView, setActiveView] = useState<AppView>('store');

  const [sensorData, setSensorData] = useState<BiometricSensorData>({
    heartRate: 76,
    steps: 8420,
    stepGoal: 10000,
    calories: 480,
    battery: 84,
    uvIndex: 4,
    temperature: 24,
    isWorkoutActive: false,
  });

  const [crownTarget, setCrownTarget] = useState<'steps' | 'heart_rate' | 'battery'>('steps');
  const [isLiveSimulating, setIsLiveSimulating] = useState(false);

  const [watchFaces, setWatchFaces] = useState<WatchFace[]>(() => {
    const saved = localStorage.getItem('pixel_watchfaces_lib');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_WATCHFACES;
      }
    }
    return INITIAL_WATCHFACES;
  });

  const [selectedFace, setSelectedFace] = useState<WatchFace>(watchFaces[0]);

  const [hardware, setHardware] = useState<WatchHardware>({
    caseColor: 'matte_black',
    bandType: 'active',
    bandColor: '#222',
    size: '45mm',
    displayMode: 'active',
  });

  const [deviceState, setDeviceState] = useState<WearableDeviceState>({
    isConnected: true,
    isPairing: false,
    deviceName: 'Google Pixel Watch 3 (45mm)',
    batteryLevel: 84,
    storageAvailableGb: 28.4,
    bleLatencyMs: 14,
    wifiStatus: 'connected',
    wearOsVersion: 'Wear OS 5.0 (Android 15)',
    activeWatchFaceId: 'concentric-classic',
    syncProgress: 0,
    isSyncing: false,
    syncStepMessage: '',
    logs: [
      {
        id: '1',
        time: '12:20:04',
        message: 'CapabilityClient registered capability: "pixel_watchface_receiver"',
        messageAr: 'تم تسجيل إمكانية استقبال وجوه الساعة عبر CapabilityClient بنجاح',
        type: 'info',
      },
      {
        id: '2',
        time: '12:20:05',
        message: 'BLE 5.3 Connection established with Pixel Watch 3 (RSSI: -58 dBm)',
        messageAr: 'تم إقران البلوتوث BLE 5.3 مع Pixel Watch 3 (قوة الإشارة: -58 dBm)',
        type: 'ble',
      },
      {
        id: '3',
        time: '12:21:10',
        message: 'Watch Face Push API handshake ready for instant deployment',
        messageAr: 'قناة الدفع المباشر Watch Face Push API جاهزة للتطبيق الفوري',
        type: 'success',
      },
    ],
  });

  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  const [inspectingComp, setInspectingComp] = useState<{
    slot: ComplicationSlot | null;
    type: ComplicationType | null;
  }>({ slot: null, type: null });

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 100);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isLiveSimulating) return;
    const interval = setInterval(() => {
      setSensorData((prev) => {
        const hrDrift = Math.round((Math.random() - 0.48) * 2);
        const newHr = Math.min(195, Math.max(50, prev.heartRate + hrDrift));
        const stepInc = Math.floor(Math.random() * 3) + 2;
        const newSteps = prev.steps + stepInc;
        const newCalories = Math.round(
          newSteps * 0.042 + (newHr > 90 ? (newHr - 90) * 2.5 : 0)
        );
        return {
          ...prev,
          heartRate: newHr,
          steps: newSteps,
          calories: newCalories,
        };
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [isLiveSimulating]);

  useEffect(() => {
    localStorage.setItem('pixel_watchfaces_lib', JSON.stringify(watchFaces));
  }, [watchFaces]);

  const handlePushToWatch = (face: WatchFace) => {
    if (deviceState.isSyncing) return;

    setDeviceState((prev) => ({
      ...prev,
      isSyncing: true,
      syncProgress: 10,
      syncStepMessage:
        lang === 'ar'
          ? 'التحقق من إمكانية الجهاز عبر CapabilityClient...'
          : 'Verifying device readiness via CapabilityClient...',
      logs: [
        {
          id: String(Date.now()),
          time: new Date().toLocaleTimeString(),
          message: `Initiating push for watch face: "${face.name}" (${face.type})`,
          messageAr: `بدء عملية دفع وتثبيت وجه الساعة: "${face.nameAr}"`,
          type: 'info',
        },
        ...prev.logs,
      ],
    }));

    setTimeout(() => {
      setDeviceState((prev) => ({
        ...prev,
        syncProgress: 45,
        syncStepMessage:
          lang === 'ar'
            ? 'نقل ملفات WFF XML والأصول عبر DataClient...'
            : 'Transferring WFF XML asset stream via DataClient...',
        logs: [
          {
            id: String(Date.now()),
            time: new Date().toLocaleTimeString(),
            message: `DataClient payload: PutDataRequest created (Size: 42.8 KB)`,
            messageAr: `تم إنشاء كائن البيانات DataClient بحجم 42.8 كيلوبايت`,
            type: 'data',
          },
          ...prev.logs,
        ],
      }));
    }, 600);

    setTimeout(() => {
      setDeviceState((prev) => ({
        ...prev,
        syncProgress: 80,
        syncStepMessage:
          lang === 'ar'
            ? 'إرسال أمر التبديل عبر MessageClient وتطبيق Watch Face Push API...'
            : 'Sending activation RPC via MessageClient & Watch Face Push API...',
        logs: [
          {
            id: String(Date.now()),
            time: new Date().toLocaleTimeString(),
            message: `MessageClient: Dispatched /watchface/switch_active to WearableService`,
            messageAr: `تم إرسال أمر التبديل المباشر إلى خدمة WearableListenerService على الساعة`,
            type: 'ble',
          },
          ...prev.logs,
        ],
      }));
    }, 1300);

    setTimeout(() => {
      setDeviceState((prev) => ({
        ...prev,
        isSyncing: false,
        syncProgress: 100,
        syncStepMessage:
          lang === 'ar' ? 'تم تعيين الواجهة بنجاح على الساعة!' : 'Watch Face Active on Pixel Watch!',
        activeWatchFaceId: face.id,
        logs: [
          {
            id: String(Date.now()),
            time: new Date().toLocaleTimeString(),
            message: `Watch Face Push API: "${face.name}" is now the active face.`,
            messageAr: `تم تفعيل وجه الساعة "${face.nameAr}" بنجاح كواجهة نشطة فورية.`,
            type: 'success',
          },
          ...prev.logs,
        ],
      }));

      playSyncSuccessChime();
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.5 },
      });
    }, 2000);
  };

  const handleToggleConnection = () => {
    setDeviceState((prev) => {
      const nextConnected = !prev.isConnected;
      return {
        ...prev,
        isConnected: nextConnected,
        logs: [
          {
            id: String(Date.now()),
            time: new Date().toLocaleTimeString(),
            message: nextConnected
              ? 'Nearby Devices: Pixel Watch 3 re-connected'
              : 'Connection closed by user',
            messageAr: nextConnected
              ? 'تمت إعادة الاتصال بساعة Pixel Watch 3 بنجاح'
              : 'تم إيقاف اتصال الساعة',
            type: nextConnected ? 'success' : 'info',
          },
          ...prev.logs,
        ],
      };
    });
  };

  const handleSaveCustom = (customFace: WatchFace) => {
    const newFace: WatchFace = {
      ...customFace,
      id: customFace.isCustom ? customFace.id : `custom-${Date.now()}`,
      name: `${customFace.name} (Custom)`,
      nameAr: `${customFace.nameAr} (مخصص)`,
      isCustom: true,
    };

    setWatchFaces((prev) => {
      const existingIdx = prev.findIndex((f) => f.id === newFace.id);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = newFace;
        return copy;
      }
      return [newFace, ...prev];
    });

    setSelectedFace(newFace);
    playSyncSuccessChime();
  };

  return (
    <div
      className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <HeaderNavbar
        activeView={activeView}
        onViewChange={setActiveView}
        deviceState={deviceState}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        lang={lang}
        onToggleLang={() => setLang((prev) => (prev === 'ar' ? 'en' : 'ar'))}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 pb-28 lg:pb-8">
        <div className="lg:hidden mb-4 bg-neutral-900/90 border border-neutral-800 rounded-2xl p-2.5 flex items-center justify-between gap-2 shadow-lg">
          <div
            className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
            onClick={() => {
              playClickSound();
              setActiveView('simulator');
            }}
          >
            <div className="w-9 h-9 rounded-full bg-neutral-950 border border-neutral-700 flex items-center justify-center p-1 shrink-0">
              <Watch size={18} className="text-sky-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-white truncate">
                  {lang === 'ar' ? selectedFace.nameAr : selectedFace.name}
                </span>
                <span className="text-[9px] bg-sky-500/20 text-sky-300 px-1.5 py-0.2 rounded font-mono">
                  {hardware.displayMode === 'aod' ? 'AOD' : 'Active'}
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 truncate">
                {lang === 'ar' ? 'انقر لفتح المحاكي والمستشعرات' : 'Tap to open live watch & sensors'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playClickSound();
              setActiveView('simulator');
            }}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-[11px] font-bold shadow-md shadow-sky-500/20 cursor-pointer"
          >
            <Eye size={12} />
            <span>{lang === 'ar' ? 'المحاكي' : 'Watch'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div
            className={`space-y-4 ${
              activeView === 'simulator'
                ? 'block lg:col-span-4 xl:col-span-4 lg:sticky lg:top-24'
                : 'hidden lg:block lg:col-span-4 xl:col-span-4 lg:sticky lg:top-24'
            }`}
          >
            <div className="bg-neutral-900/80 backdrop-blur-md border border-neutral-800 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col items-center">
              <div className="w-full flex items-center justify-between border-b border-neutral-800 pb-3 mb-2">
                <div className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                  <Watch size={14} className="text-sky-400" />
                  <span>{lang === 'ar' ? 'محاكي Pixel Watch 3' : 'Live Pixel Watch 3'}</span>
                </div>
                <span className="text-[11px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                  {hardware.size} • 450x450 WFF
                </span>
              </div>

              <PixelWatchFrame
                watchFace={selectedFace}
                hardware={hardware}
                onHardwareChange={(hw) => setHardware((prev) => ({ ...prev, ...hw }))}
                currentTime={currentTime}
                onComplicationClick={(slot, type) =>
                  setInspectingComp({ slot, type })
                }
                onQuickPush={() => handlePushToWatch(selectedFace)}
                isSyncing={deviceState.isSyncing}
                sensorData={sensorData}
                onSensorDataChange={(update) =>
                  setSensorData((prev) => ({ ...prev, ...update }))
                }
                crownTarget={crownTarget}
                onCrownTargetChange={setCrownTarget}
              />

              <div className="w-full mt-2 pt-3 border-t border-neutral-800/80 text-center">
                <h4 className="font-bold text-sm text-white">
                  {lang === 'ar' ? selectedFace.nameAr : selectedFace.name}
                </h4>
                <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">
                  {lang === 'ar' ? selectedFace.descriptionAr : selectedFace.description}
                </p>

                <div className="flex items-center justify-center gap-2 mt-3">
                  <button
                    onClick={() => {
                      playClickSound();
                      setActiveView('editor');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeView === 'editor'
                        ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                        : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                    }`}
                  >
                    {lang === 'ar' ? 'تعديل بالمحرر' : 'Open in Editor'}
                  </button>

                  <button
                    onClick={() => downloadWffXmlFile(selectedFace)}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {lang === 'ar' ? 'تنزيل XML' : 'Export XML'}
                  </button>
                </div>
              </div>
            </div>

            <BiometricSensorsPanel
              sensorData={sensorData}
              onSensorDataChange={(update) =>
                setSensorData((prev) => ({ ...prev, ...update }))
              }
              crownTarget={crownTarget}
              onCrownTargetChange={setCrownTarget}
              lang={lang}
              isLiveSimulating={isLiveSimulating}
              onToggleLiveSimulation={() => setIsLiveSimulating((prev) => !prev)}
            />

            <AodBatteryDiagnostics
              watchFace={selectedFace}
              hardware={hardware}
              onToggleAod={() => {
                const nextMode = hardware.displayMode === 'aod' ? 'active' : 'aod';
                setHardware((prev) => ({ ...prev, displayMode: nextMode }));
              }}
              lang={lang}
            />

            <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-4 text-xs text-neutral-400 space-y-1.5">
              <div className="font-bold text-neutral-300 flex items-center gap-1.5">
                <span>💡</span>
                <span>{lang === 'ar' ? 'نصيحة تفاعلية للهواتف واللمس:' : 'Interactive Mobile Tip:'}</span>
              </div>
              <p className="leading-relaxed text-[11px]">
                {lang === 'ar'
                  ? 'اسحب بإصبعك لأعلى وأسفل على تاج الساعة الدوار لضبط الخطوات والنبض فورياً، أو انقر على أي تعقيد في الشاشة لمعاينة الرسوم البيانية.'
                  : 'Swipe up and down on the watch crown with touch or mouse scroll to dial biometric values, or tap complications on the dial.'}
              </p>
            </div>
          </div>

          <div
            className={`space-y-6 ${
              activeView === 'simulator' ? 'hidden lg:block lg:col-span-8 xl:col-span-8' : 'lg:col-span-8 xl:col-span-8'
            }`}
          >
            {(activeView === 'store' || activeView === 'simulator') && (
              <StoreGallery
                watchFaces={watchFaces}
                activeWatchFaceId={deviceState.activeWatchFaceId}
                onSelectWatchFace={(face) => {
                  setSelectedFace(face);
                }}
                onEditWatchFace={(face) => {
                  setSelectedFace(face);
                  setActiveView('editor');
                }}
                onPushWatchFace={(face) => {
                  setSelectedFace(face);
                  handlePushToWatch(face);
                }}
                onExportWff={(face) => downloadWffXmlFile(face)}
                onOpenAiGenerator={() => setIsAiModalOpen(true)}
                lang={lang}
              />
            )}

            {activeView === 'editor' && (
              <WffEditor
                watchFace={selectedFace}
                onChange={(updated) => setSelectedFace(updated)}
                onPushToWatch={(face) => handlePushToWatch(face)}
                onSaveAsCustom={handleSaveCustom}
                lang={lang}
              />
            )}

            {activeView === 'sync' && (
              <SyncHub
                deviceState={deviceState}
                watchFaces={watchFaces}
                currentSelectedFace={selectedFace}
                onPushFace={handlePushToWatch}
                onToggleConnection={handleToggleConnection}
                lang={lang}
              />
            )}
          </div>
        </div>
      </main>

      <ComplicationDetailModal
        slot={inspectingComp.slot}
        type={inspectingComp.type}
        onClose={() => setInspectingComp({ slot: null, type: null })}
        lang={lang}
      />

      <AiGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onApplyGeneratedFace={(face) => {
          setWatchFaces((prev) => [face, ...prev]);
          setSelectedFace(face);
          setActiveView('editor');
        }}
        lang={lang}
      />

      <MobileBottomNavBar
        activeView={activeView}
        onViewChange={(view) => setActiveView(view)}
        watchFace={selectedFace}
        lang={lang}
      />

      <footer className="hidden lg:block mt-12 border-t border-neutral-800/80 py-6 px-4 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Pixel Watch Face Studio & Wearable Data Layer • Material 3 Expressive Design
          </span>
          <span className="font-mono text-[11px]">
            Watch Face Format (WFF v1.0) • Wear OS 4/5
          </span>
        </div>
      </footer>
    </div>
  );
}
