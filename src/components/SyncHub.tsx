import React, { useState } from 'react';
import { WatchFace, WearableDeviceState } from '../types';
import {
  Wifi,
  Bluetooth,
  RefreshCw,
  Zap,
  Smartphone,
  HardDrive,
  Battery,
  Layers,
  Send,
  Radio,
  Terminal,
  Activity,
} from 'lucide-react';
import { playClickSound } from '../utils/audio';

interface SyncHubProps {
  deviceState: WearableDeviceState;
  watchFaces: WatchFace[];
  currentSelectedFace: WatchFace;
  onPushFace: (face: WatchFace) => void;
  onToggleConnection: () => void;
  lang: 'ar' | 'en';
}

export const SyncHub: React.FC<SyncHubProps> = ({
  deviceState,
  currentSelectedFace,
  onPushFace,
  onToggleConnection,
  lang,
}) => {
  const isAr = lang === 'ar';
  const [transportMode, setTransportMode] = useState<'auto' | 'ble' | 'wifi'>('auto');

  return (
    <div className="space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Device Connection Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${
                deviceState.isConnected
                  ? 'bg-sky-500/20 text-sky-400 border-sky-500/40 shadow-lg shadow-sky-500/20'
                  : 'bg-neutral-800 text-neutral-500 border-neutral-700'
              }`}
            >
              <Smartphone size={30} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-white">{deviceState.deviceName}</h3>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                    deviceState.isConnected
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      deviceState.isConnected ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'
                    }`}
                  />
                  {deviceState.isConnected
                    ? isAr
                      ? 'متصل عبر Wearable Data Layer'
                      : 'Connected (Wearable Data Layer)'
                    : isAr
                    ? 'غير متصل'
                    : 'Disconnected'}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                {deviceState.wearOsVersion} • Google Play Services for Wear OS (Target API 34/35)
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound();
              onToggleConnection();
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold border transition-all ${
              deviceState.isConnected
                ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
                : 'bg-sky-500 hover:bg-sky-400 text-white border-sky-400'
            }`}
          >
            {deviceState.isConnected
              ? isAr
                ? 'فصل الاتصال بالساعة'
                : 'Disconnect Device'
              : isAr
              ? 'إعادة الربط السريع (Nearby Devices)'
              : 'Fast Connect (Nearby)'}
          </button>
        </div>

        {/* Telemetry Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-5">
          <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800/90 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
              <Battery size={20} />
            </div>
            <div>
              <div className="text-xs text-neutral-400 font-medium">{isAr ? 'بطارية الساعة' : 'Watch Battery'}</div>
              <div className="text-base font-bold text-neutral-100">{deviceState.batteryLevel}%</div>
            </div>
          </div>

          <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800/90 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/15 text-sky-400">
              <Bluetooth size={20} />
            </div>
            <div>
              <div className="text-xs text-neutral-400 font-medium">{isAr ? 'استجابة BLE' : 'BLE Latency'}</div>
              <div className="text-base font-bold text-neutral-100">{deviceState.bleLatencyMs} ms</div>
            </div>
          </div>

          <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800/90 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400">
              <Wifi size={20} />
            </div>
            <div>
              <div className="text-xs text-neutral-400 font-medium">{isAr ? 'شبكة Wi-Fi' : 'Wi-Fi Direct'}</div>
              <div className="text-base font-bold text-neutral-100">
                {deviceState.wifiStatus === 'connected' ? (isAr ? 'نشط 5GHz' : '5GHz Direct') : isAr ? 'خامل' : 'Idle'}
              </div>
            </div>
          </div>

          <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800/90 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
              <HardDrive size={20} />
            </div>
            <div>
              <div className="text-xs text-neutral-400 font-medium">{isAr ? 'المساحة الحرة' : 'Free Storage'}</div>
              <div className="text-base font-bold text-neutral-100">
                {deviceState.storageAvailableGb} GB
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sync Control & Protocol Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <Send size={18} className="text-sky-400" />
              <h4 className="font-bold text-white text-base">
                {isAr ? 'دفع ومزامنة الواجهة المختارة' : 'Push Active Watch Face'}
              </h4>
            </div>

            <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs">
              {[
                { id: 'auto', label: isAr ? 'نقل ذكي' : 'Auto' },
                { id: 'ble', label: 'BLE 5.3' },
                { id: 'wifi', label: 'Wi-Fi' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    playClickSound();
                    setTransportMode(m.id as any);
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    transportMode === m.id
                      ? 'bg-neutral-800 text-sky-400 font-bold'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full border border-sky-500/40 shadow-inner flex items-center justify-center font-bold text-xs"
                style={{ backgroundColor: currentSelectedFace.colors.background, color: currentSelectedFace.colors.primary }}
              >
                PW
              </div>
              <div>
                <div className="text-sm font-bold text-white">
                  {isAr ? currentSelectedFace.nameAr : currentSelectedFace.name}
                </div>
                <div className="text-xs text-neutral-400">
                  {currentSelectedFace.category} • {currentSelectedFace.batteryEfficiency} Power Grade • {currentSelectedFace.type}
                </div>
              </div>
            </div>

            <button
              onClick={() => onPushFace(currentSelectedFace)}
              disabled={deviceState.isSyncing || !deviceState.isConnected}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-2xl shadow-lg shadow-sky-500/25 transition-all active:scale-95 cursor-pointer"
            >
              {deviceState.isSyncing ? (
                <RefreshCw size={15} className="animate-spin text-white" />
              ) : (
                <Smartphone size={15} />
              )}
              <span>
                {deviceState.isSyncing
                  ? isAr
                    ? 'جاري النقل...'
                    : 'Transmitting...'
                  : isAr
                  ? 'دفع للساعة الآن'
                  : 'Push to Pixel Watch'}
              </span>
            </button>
          </div>

          {deviceState.isSyncing && (
            <div className="space-y-2 bg-neutral-950 p-4 rounded-2xl border border-sky-900/50 animate-fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-sky-400 flex items-center gap-1.5">
                  <Radio size={14} className="animate-pulse text-sky-400" />
                  {deviceState.syncStepMessage}
                </span>
                <span className="font-mono font-bold text-white">
                  {deviceState.syncProgress}%
                </span>
              </div>
              <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 transition-all duration-300 rounded-full"
                  style={{ width: `${deviceState.syncProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
            <div className="bg-neutral-950/70 p-3 rounded-xl border border-neutral-800/80">
              <div className="font-bold text-sky-300 mb-1 flex items-center gap-1">
                <Layers size={13} /> DataClient (Asset)
              </div>
              <p className="text-neutral-400 text-[11px] leading-relaxed">
                {isAr
                  ? 'نقل ملفات XML والصور الكبيرة بتنسيق WFF المضغوط بكفاءة عالية.'
                  : 'Streams large binary assets and compiled WFF XML manifests.'}
              </p>
            </div>

            <div className="bg-neutral-950/70 p-3 rounded-xl border border-neutral-800/80">
              <div className="font-bold text-emerald-300 mb-1 flex items-center gap-1">
                <Zap size={13} /> MessageClient
              </div>
              <p className="text-neutral-400 text-[11px] leading-relaxed">
                {isAr
                  ? 'أوامر تحكم فورية منخفضة التأخير لتغيير الواجهة النشطة بدون انتظار.'
                  : 'Low-latency instantaneous control RPCs to trigger face switch.'}
              </p>
            </div>

            <div className="bg-neutral-950/70 p-3 rounded-xl border border-neutral-800/80">
              <div className="font-bold text-amber-300 mb-1 flex items-center gap-1">
                <Radio size={13} /> Watch Face Push API
              </div>
              <p className="text-neutral-400 text-[11px] leading-relaxed">
                {isAr
                  ? 'API جوجل الحديث لتعيين الخلفية فوراً على الساعة دون تدخل يدوي.'
                  : 'Wear OS standard API to set the pushed face active.'}
              </p>
            </div>
          </div>
        </div>

        {/* Live Logs */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-neutral-800 pb-3 mb-3">
              <Terminal size={16} className="text-emerald-400" />
              <h4 className="font-bold text-sm text-white">
                {isAr ? 'سجل أحداث Data Layer اللحظي' : 'Live Event Log'}
              </h4>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto font-mono text-[11px] scrollbar-thin">
              {deviceState.logs.map((log) => (
                <div
                  key={log.id}
                  className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800/70 flex items-start gap-2"
                >
                  <span className="text-[10px] text-neutral-500 whitespace-nowrap mt-0.5">
                    {log.time}
                  </span>
                  <span
                    className={`leading-tight ${
                      log.type === 'success'
                        ? 'text-emerald-400 font-semibold'
                        : log.type === 'ble'
                        ? 'text-sky-300'
                        : log.type === 'data'
                        ? 'text-amber-300'
                        : 'text-neutral-300'
                    }`}
                  >
                    {isAr ? log.messageAr : log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500">
            <span>Protocol: Google Wearable v2.1</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <Activity size={12} className="animate-pulse" /> Active Channel
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
