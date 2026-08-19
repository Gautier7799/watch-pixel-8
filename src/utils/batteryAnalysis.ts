/**
 * Wear OS Watch Face Format (WFF) Battery & Power Consumption Analyzer
 * Calculates On-Pixel Ratio (OPR), OLED Power Draw, and Wear OS Compliance
 */

import { WatchFace } from '../types';

export interface WatchFacePowerMetrics {
  oprPercent: number;
  isWearOsCompliant: boolean;
  oprStatus: 'excellent' | 'good' | 'warning' | 'critical';
  powerDrawMw: number;
  powerSavingPercent: number;
  estimatedBatteryHours: number;
  activeOprPercent: number;
  activePowerDrawMw: number;
  burnInRisk: 'low' | 'moderate' | 'high';
  activePixelsEstimate: number;
  optimizations: {
    title: string;
    titleAr: string;
    description: string;
    descriptionAr: string;
    impact: 'high' | 'medium' | 'low';
    applied: boolean;
  }[];
}

export function analyzeWatchFacePower(
  watchFace: WatchFace,
  isAod: boolean,
  watchSize: '41mm' | '45mm' = '45mm'
): WatchFacePowerMetrics {
  const batteryCapMah = watchSize === '45mm' ? 420 : 306;

  let activeOpr = 8.0;

  if (watchFace.background.type === 'solid') {
    activeOpr += watchFace.colors.background === '#000000' ? 0 : 12;
  } else if (watchFace.background.type === 'radial-gradient' || watchFace.background.type === 'linear-gradient') {
    activeOpr += 18;
  } else if (watchFace.background.type === 'custom-image') {
    const dim = watchFace.background.imageDim ?? 0.4;
    activeOpr += 22 * (1 - dim * 0.5);
  } else if (watchFace.background.type === 'stars') {
    activeOpr += 6;
  }

  if (watchFace.dial.ticksCount > 0) {
    activeOpr += (watchFace.dial.ticksCount / 60) * 4.5;
  }
  if (watchFace.dial.showHourMarks) {
    activeOpr += 3.5;
  }

  const activeCompsCount = (watchFace.complications || []).filter(
    (c) => c && c.type !== 'none'
  ).length;
  activeOpr += activeCompsCount * 2.8;

  if (watchFace.type !== 'digital' && watchFace.hands.showSeconds) {
    activeOpr += 1.8;
  }

  let aodOpr = 2.2;

  if (watchFace.type === 'analog') {
    aodOpr += watchFace.hands.style === 'pill' ? 1.8 : 1.2;
    if (watchFace.dial.showHourMarks) {
      aodOpr += watchFace.dial.style === 'minimal-quad' ? 0.8 : 1.6;
    }
  } else if (watchFace.type === 'digital') {
    aodOpr += watchFace.digital.layout === 'stacked' ? 2.8 : 2.2;
  } else {
    aodOpr += 2.6;
  }

  aodOpr += activeCompsCount * 0.7;

  activeOpr = Math.min(65, Math.max(12, Number(activeOpr.toFixed(1))));
  aodOpr = Math.min(14.5, Math.max(2.8, Number(aodOpr.toFixed(1))));

  const currentOpr = isAod ? aodOpr : activeOpr;
  const isWearOsCompliant = isAod ? aodOpr <= 15.0 : true;

  let oprStatus: WatchFacePowerMetrics['oprStatus'] = 'excellent';
  if (isAod) {
    if (aodOpr <= 6.0) oprStatus = 'excellent';
    else if (aodOpr <= 10.0) oprStatus = 'good';
    else if (aodOpr <= 15.0) oprStatus = 'warning';
    else oprStatus = 'critical';
  } else {
    if (activeOpr <= 20.0) oprStatus = 'excellent';
    else if (activeOpr <= 35.0) oprStatus = 'good';
    else oprStatus = 'warning';
  }

  const activePowerDrawMw = Math.round(15 + activeOpr * 2.1 + (watchFace.hands.sweepSeconds ? 25 : 12));
  const aodPowerDrawMw = Math.round(6 + aodOpr * 1.6);
  const currentPowerDrawMw = isAod ? aodPowerDrawMw : activePowerDrawMw;

  const powerSavingPercent = Math.round(((activePowerDrawMw - aodPowerDrawMw) / activePowerDrawMw) * 100);
  const estimatedBatteryHours = Math.round((batteryCapMah * 3.85) / (currentPowerDrawMw + 10));

  const burnInRisk: WatchFacePowerMetrics['burnInRisk'] =
    isAod && aodOpr <= 8.0 ? 'low' : isAod ? 'moderate' : 'low';

  const totalScreenPixels = 450 * 450 * 0.785;
  const activePixelsEstimate = Math.round((totalScreenPixels * currentOpr) / 100);

  const optimizations = [
    {
      title: 'True OLED Black Canvas',
      titleAr: 'خلفية سوداء نقية (True OLED Black)',
      description: 'Pixels are completely powered off (#000000) for zero power emission.',
      descriptionAr: 'إطفاء بكسلات الشاشة تماماً (#000000) لصفر استهلاك طاقة في مساحة الخلفية.',
      impact: 'high' as const,
      applied: isAod,
    },
    {
      title: 'CPU Deep Sleep (No Seconds Sweep)',
      titleAr: 'سكون المعالج وتجميد عقرب الثواني',
      description: 'Halts 60Hz/1Hz wakeups, rendering once per minute to conserve processor power.',
      descriptionAr: 'إيقاف تحديث الثواني ليتم التحديث مرة واحدة في الدقيقة لنوم المعالج العميق.',
      impact: 'high' as const,
      applied: isAod,
    },
    {
      title: 'Ambient Complication Outline',
      titleAr: 'تبسيط وتخفيف التعقيدات (Ambient Glyphs)',
      description: 'Strips heavy filled gauges down to lightweight monochromatic glyphs.',
      descriptionAr: 'تجريد الرسوم البيانية الدائرية المعقدة إلى رموز أحادية خفيفة.',
      impact: 'medium' as const,
      applied: isAod,
    },
    {
      title: 'AMOLED Burn-In Pixel Shift Protection',
      titleAr: 'حماية الشاشة من التطبيع (Burn-In Shift)',
      description: 'Prevents static image retention by adhering to Wear OS low-bit ambient rules.',
      descriptionAr: 'حماية لوحة AMOLED من التطبيع وفق بروتوكولات Google Pixel Watch الرسمية.',
      impact: 'medium' as const,
      applied: true,
    },
  ];

  return {
    oprPercent: currentOpr,
    isWearOsCompliant,
    oprStatus,
    powerDrawMw: currentPowerDrawMw,
    powerSavingPercent,
    estimatedBatteryHours,
    activeOprPercent: activeOpr,
    activePowerDrawMw,
    burnInRisk,
    activePixelsEstimate,
    optimizations,
  };
}
