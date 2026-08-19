export type WatchType = 'analog' | 'digital' | 'hybrid';

export type WatchCategory =
  | 'material-you'
  | 'analog'
  | 'digital'
  | 'fitness'
  | 'artistic'
  | 'astronomy'
  | 'minimal'
  | 'retro';

export type ComplicationSlot = 'top' | 'bottom' | 'left' | 'right' | 'center';

export type ComplicationType =
  | 'battery'
  | 'heart_rate'
  | 'steps'
  | 'weather'
  | 'calendar'
  | 'uv'
  | 'sunset'
  | 'compass'
  | 'media'
  | 'world_clock'
  | 'none';

export type DialStyle =
  | 'ticks'
  | 'dots'
  | 'numerals'
  | 'minimal-quad'
  | 'concentric'
  | 'rings'
  | 'clean'
  | 'roman'
  | 'arabic-indic';

export type HandStyle = 'pill' | 'needle' | 'minimal-bar' | 'arrow' | 'wireframe' | 'chrono';

export type TypographyFont = 'google-sans' | 'product-sans' | 'serif' | 'mono' | 'pixel';

export interface WatchColors {
  primary: string;
  secondary: string;
  tertiary: string;
  background: string;
  dialBg: string;
  hands: string;
  accent: string;
  complicationGlow: string;
}

export interface DialConfig {
  style: DialStyle;
  ticksCount: 0 | 4 | 12 | 60;
  showHourMarks: boolean;
  showSubDial: boolean;
  hourMarkerFont: TypographyFont;
  dialRingOpacity: number;
}

export interface HandsConfig {
  style: HandStyle;
  showSeconds: boolean;
  sweepSeconds: boolean;
  tailStyle: 'circle' | 'line' | 'none';
  accentCapColor?: string;
}

export interface DigitalConfig {
  font: TypographyFont;
  format24h: boolean;
  showSeconds: boolean;
  layout: 'stacked' | 'horizontal' | 'large-dial' | 'compact';
  digitSpacing?: number;
}

export interface ComplicationConfig {
  slot: ComplicationSlot;
  type: ComplicationType;
}

export interface BackgroundConfig {
  type: 'solid' | 'radial-gradient' | 'linear-gradient' | 'mesh' | 'custom-image' | 'stars';
  gradientColors?: [string, string];
  customImageUrl?: string;
  imageDim?: number;
  patternOpacity?: number;
}

export interface WatchFace {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: WatchCategory;
  type: WatchType;
  colors: WatchColors;
  dial: DialConfig;
  hands: HandsConfig;
  digital: DigitalConfig;
  complications: ComplicationConfig[];
  background: BackgroundConfig;
  ambientDimLevel: number;
  batteryEfficiency: 'A+' | 'A' | 'B';
  rating: number;
  downloads: number;
  isCustom?: boolean;
  tags: string[];
}

export interface BiometricSensorData {
  heartRate: number; // 40 - 220 BPM
  steps: number; // 0 - 30,000 steps
  stepGoal: number; // default 10,000 steps
  calories: number; // kcal
  battery: number; // 0 - 100%
  uvIndex: number; // 0 - 12
  temperature: number; // °C
  isWorkoutActive?: boolean;
}

export type CaseColor = 'matte_black' | 'silver' | 'champagne_gold' | 'hazel';
export type BandType = 'active' | 'woven' | 'leather' | 'mesh';
export type WatchSize = '41mm' | '45mm';

export interface WatchHardware {
  caseColor: CaseColor;
  bandType: BandType;
  bandColor: string;
  size: WatchSize;
  displayMode: 'active' | 'aod';
}

export interface SyncLog {
  id: string;
  time: string;
  message: string;
  messageAr: string;
  type: 'info' | 'success' | 'data' | 'ble';
}

export interface WearableDeviceState {
  isConnected: boolean;
  isPairing: boolean;
  deviceName: string;
  batteryLevel: number;
  storageAvailableGb: number;
  bleLatencyMs: number;
  wifiStatus: 'connected' | 'idle' | 'disabled';
  wearOsVersion: string;
  activeWatchFaceId: string;
  syncProgress: number;
  isSyncing: boolean;
  syncStepMessage: string;
  logs: SyncLog[];
}

export type AppView = 'simulator' | 'store' | 'editor' | 'sync';
