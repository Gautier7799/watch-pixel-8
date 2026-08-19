import React, { useState } from 'react';
import {
  WatchFace,
  ComplicationSlot,
  ComplicationType,
  DialStyle,
  HandStyle,
  TypographyFont,
} from '../types';
import { PRESET_COLOR_PALETTES } from '../data/watchfaces';
import { generateWffXml, downloadWffXmlFile } from '../utils/wffGenerator';
import { playClickSound } from '../utils/audio';
import { DynamicColorPaletteGenerator } from './DynamicColorPaletteGenerator';
import {
  Palette,
  Clock,
  LayoutGrid,
  Code2,
  Download,
  Smartphone,
  Copy,
  Check,
  Sparkles,
  Sliders,
  Type as TypeIcon,
} from 'lucide-react';

interface WffEditorProps {
  watchFace: WatchFace;
  onChange: (updatedFace: WatchFace) => void;
  onPushToWatch: (face: WatchFace) => void;
  onSaveAsCustom: (face: WatchFace) => void;
  lang: 'ar' | 'en';
}

export const WffEditor: React.FC<WffEditorProps> = ({
  watchFace,
  onChange,
  onPushToWatch,
  onSaveAsCustom,
  lang,
}) => {
  const isAr = lang === 'ar';

  const [activeTab, setActiveTab] = useState<'colors' | 'dial' | 'hands' | 'complications' | 'xml'>('colors');
  const [copiedXml, setCopiedXml] = useState(false);

  const updateColor = (key: keyof typeof watchFace.colors, value: string) => {
    onChange({
      ...watchFace,
      colors: {
        ...watchFace.colors,
        [key]: value,
      },
    });
  };

  const applyPalette = (palette: (typeof PRESET_COLOR_PALETTES)[0]) => {
    playClickSound();
    onChange({
      ...watchFace,
      colors: {
        ...watchFace.colors,
        primary: palette.primary,
        secondary: palette.secondary,
        tertiary: palette.tertiary,
        background: palette.background,
        dialBg: palette.dialBg,
        hands: palette.hands,
        accent: palette.accent,
        complicationGlow: palette.complicationGlow,
      },
    });
  };

  const handleCopyXml = () => {
    const xml = generateWffXml(watchFace);
    navigator.clipboard.writeText(xml);
    setCopiedXml(true);
    setTimeout(() => setCopiedXml(false), 2000);
  };

  const updateComplication = (slot: ComplicationSlot, type: ComplicationType) => {
    playClickSound();
    const nextComplications = watchFace.complications.map((c) =>
      c.slot === slot ? { ...c, type } : c
    );
    if (!nextComplications.some((c) => c.slot === slot)) {
      nextComplications.push({ slot, type });
    }
    onChange({
      ...watchFace,
      complications: nextComplications,
    });
  };

  const complicationList: { type: ComplicationType; label: string; labelAr: string; icon: string }[] = [
    { type: 'battery', label: 'Battery %', labelAr: 'نسبة البطارية', icon: '🔋' },
    { type: 'heart_rate', label: 'Heart Rate (BPM)', labelAr: 'نبض القلب', icon: '❤️' },
    { type: 'steps', label: 'Steps & Goal Arc', labelAr: 'الخطوات والهدف', icon: '👟' },
    { type: 'weather', label: 'Weather & Temp', labelAr: 'الطقس والحرارة', icon: '🌤️' },
    { type: 'calendar', label: 'Calendar / Next Event', labelAr: 'التقويم والموعد', icon: '📅' },
    { type: 'sunset', label: 'Sunset / Sunrise', labelAr: 'الغروب والشروق', icon: '🌇' },
    { type: 'uv', label: 'UV Index', labelAr: 'مؤشر الأشعة UV', icon: '☀️' },
    { type: 'compass', label: 'Compass Heading', labelAr: 'البوصلة والاتجاه', icon: '🧭' },
    { type: 'media', label: 'Media Player', labelAr: 'مشغل الموسيقى', icon: '🎵' },
    { type: 'none', label: 'Empty (None)', labelAr: 'فارغ (بدون)', icon: '🚫' },
  ];

  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 shadow-xl space-y-5" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Top Header & Mode Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders size={18} className="text-sky-400" />
            <h3 className="font-bold text-lg text-white">
              {isAr ? 'محرر Watch Face Format (WFF)' : 'Watch Face Format Studio'}
            </h3>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            {isAr
              ? 'تخصيص كامل للألوان المتوافقة مع Material 3 وعناصر الشاشة والتعقيدات'
              : 'Full Material 3 dynamic color tuning, dial geometry, and complication binding'}
          </p>
        </div>

        <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-2xl border border-neutral-800 text-xs overflow-x-auto max-w-full">
          {[
            { id: 'colors', label: isAr ? 'الألوان' : 'Colors', icon: <Palette size={13} /> },
            { id: 'dial', label: isAr ? 'المينا والأرقام' : 'Dial & Marks', icon: <Clock size={13} /> },
            { id: 'hands', label: isAr ? 'العقارب' : 'Hands & Time', icon: <TypeIcon size={13} /> },
            { id: 'complications', label: isAr ? 'التعقيدات' : 'Complications', icon: <LayoutGrid size={13} /> },
            { id: 'xml', label: isAr ? 'كود WFF XML' : 'WFF XML', icon: <Code2 size={13} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                playClickSound();
                setActiveTab(tab.id as any);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Colors */}
      {activeTab === 'colors' && (
        <div className="space-y-6 animate-fade-in">
          <DynamicColorPaletteGenerator
            watchFace={watchFace}
            onChange={onChange}
            lang={lang}
          />

          <div className="bg-neutral-950/70 p-4 rounded-2xl border border-neutral-800/80">
            <label className="text-xs font-semibold text-neutral-300 block mb-2.5">
              {isAr ? 'لوحات ألوان Material You الجاهزة:' : 'Material You Preset Palettes:'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {PRESET_COLOR_PALETTES.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => applyPalette(p)}
                  className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 text-left transition-all group cursor-pointer"
                >
                  <div className="flex -space-x-1.5">
                    <span
                      className="w-4 h-4 rounded-full border border-black/40 shadow-sm"
                      style={{ backgroundColor: p.primary }}
                    />
                    <span
                      className="w-4 h-4 rounded-full border border-black/40 shadow-sm"
                      style={{ backgroundColor: p.secondary }}
                    />
                    <span
                      className="w-4 h-4 rounded-full border border-black/40 shadow-sm"
                      style={{ backgroundColor: p.accent }}
                    />
                  </div>
                  <span className="text-xs font-medium text-neutral-200 group-hover:text-white truncate">
                    {isAr ? p.nameAr : p.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-neutral-950/70 p-4 rounded-2xl border border-neutral-800/80">
            <label className="text-xs font-semibold text-neutral-300 block mb-3">
              {isAr ? 'التعديل اليدوي الدقيق للألوان:' : 'Fine-Tuning Color Values:'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { key: 'primary', label: isAr ? 'اللون الأساسي' : 'Primary Theme', val: watchFace.colors.primary },
                { key: 'secondary', label: isAr ? 'اللون الثانوي' : 'Secondary Tone', val: watchFace.colors.secondary },
                { key: 'hands', label: isAr ? 'لون العقارب' : 'Hands Tone', val: watchFace.colors.hands },
                { key: 'accent', label: isAr ? 'لون التمييز والتاج' : 'Accent / Seconds', val: watchFace.colors.accent },
                { key: 'background', label: isAr ? 'خلفية الشاشة' : 'Background (OLED)', val: watchFace.colors.background },
                { key: 'dialBg', label: isAr ? 'سطح المينا الداخلي' : 'Dial Surface', val: watchFace.colors.dialBg },
                { key: 'tertiary', label: isAr ? 'اللون الثالث' : 'Tertiary Accent', val: watchFace.colors.tertiary },
                { key: 'complicationGlow', label: isAr ? 'توهج التعقيدات' : 'Complication Glow', val: watchFace.colors.complicationGlow },
              ].map((item) => (
                <div key={item.key} className="bg-neutral-900 p-2.5 rounded-2xl border border-neutral-800/80">
                  <label className="text-[11px] text-neutral-400 block mb-1.5 truncate">
                    {item.label}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={item.val?.startsWith('#') ? item.val.slice(0, 7) : '#A8C7FA'}
                      onChange={(e) => updateColor(item.key as any, e.target.value)}
                      className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={item.val || ''}
                      onChange={(e) => updateColor(item.key as any, e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700/80 rounded-lg px-2 py-1 text-xs font-mono text-neutral-100 uppercase"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Dial */}
      {activeTab === 'dial' && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800">
              <label className="text-xs font-semibold text-neutral-300 block mb-2">
                {isAr ? 'نمط القرص والمؤشرات:' : 'Dial Style & Geometry:'}
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(
                  [
                    { id: 'ticks', label: isAr ? 'علامات دقيقة' : 'Ticks' },
                    { id: 'dots', label: isAr ? 'نقاط دائرية' : 'Dots' },
                    { id: 'concentric', label: isAr ? 'حلقات متحدة' : 'Concentric' },
                    { id: 'minimal-quad', label: isAr ? 'أركان رباعية' : 'Minimal Quad' },
                    { id: 'arabic-indic', label: isAr ? 'أرقام مشرقية (١-١٢)' : 'Arabic-Indic' },
                    { id: 'clean', label: isAr ? 'نقي بدون علامات' : 'Clean Blank' },
                  ] as const
                ).map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      playClickSound();
                      onChange({
                        ...watchFace,
                        dial: { ...watchFace.dial, style: d.id },
                      });
                    }}
                    className={`py-2 px-2.5 rounded-xl text-xs font-medium transition-all ${
                      watchFace.dial.style === d.id
                        ? 'bg-sky-500 text-white font-bold'
                        : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800 space-y-3">
              <div>
                <label className="text-xs font-semibold text-neutral-300 flex justify-between mb-1">
                  <span>{isAr ? 'عدد علامات الدقائق:' : 'Ticks Count:'}</span>
                  <span className="font-mono text-sky-400">{watchFace.dial.ticksCount}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="12"
                  value={watchFace.dial.ticksCount}
                  onChange={(e) =>
                    onChange({
                      ...watchFace,
                      dial: { ...watchFace.dial, ticksCount: parseInt(e.target.value) },
                    })
                  }
                  className="w-full accent-sky-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={watchFace.dial.showHourMarks}
                    onChange={(e) =>
                      onChange({
                        ...watchFace,
                        dial: { ...watchFace.dial, showHourMarks: e.target.checked },
                      })
                    }
                    className="w-4 h-4 rounded text-sky-500 bg-neutral-900 border-neutral-700"
                  />
                  <span>{isAr ? 'إظهار أرقام الساعات' : 'Show Hour Numerals'}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Hands & Time */}
      {activeTab === 'hands' && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800">
              <label className="text-xs font-semibold text-neutral-300 block mb-2">
                {isAr ? 'تصميم العقارب (Pixel Style):' : 'Hands Aesthetic:'}
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(
                  [
                    { id: 'pill', label: isAr ? 'حبة كبسولة (Pill)' : 'Pixel Pill' },
                    { id: 'classic', label: isAr ? 'كلاسيكي مدبب' : 'Classic Tapered' },
                    { id: 'minimal-bar', label: isAr ? 'قضبان دقيقة' : 'Minimal Bar' },
                    { id: 'hollow', label: isAr ? 'مفرغ أنيق' : 'Hollow Skeleton' },
                  ] as const
                ).map((h) => (
                  <button
                    key={h.id}
                    onClick={() => {
                      playClickSound();
                      onChange({
                        ...watchFace,
                        hands: { ...watchFace.hands, style: h.id },
                      });
                    }}
                    className={`py-2 px-2.5 rounded-xl text-xs font-medium transition-all ${
                      watchFace.hands.style === h.id
                        ? 'bg-sky-500 text-white font-bold'
                        : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    {h.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800">
              <label className="text-xs font-semibold text-neutral-300 block mb-2">
                {isAr ? 'نوع الخط الزمني:' : 'Typography Face:'}
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(
                  [
                    { id: 'Google Sans Flex', label: 'Google Sans Flex' },
                    { id: 'Roboto Flex', label: 'Roboto Flex' },
                    { id: 'Material Symbols', label: 'Material Display' },
                    { id: 'Mono', label: 'Space Mono' },
                  ] as TypographyFont[]
                ).map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      playClickSound();
                      onChange({
                        ...watchFace,
                        digital: { ...watchFace.digital, font: f },
                      });
                    }}
                    className={`py-2 px-2.5 rounded-xl text-xs font-medium transition-all ${
                      watchFace.digital.font === f
                        ? 'bg-sky-500 text-white font-bold'
                        : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800 flex flex-wrap gap-4 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-neutral-300">
              <input
                type="checkbox"
                checked={watchFace.hands.showSeconds}
                onChange={(e) =>
                  onChange({
                    ...watchFace,
                    hands: { ...watchFace.hands, showSeconds: e.target.checked },
                  })
                }
                className="w-4 h-4 rounded text-sky-500 bg-neutral-900 border-neutral-700"
              />
              <span>{isAr ? 'إظهار عقرب الثواني' : 'Show Second Hand'}</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-neutral-300">
              <input
                type="checkbox"
                checked={watchFace.hands.sweepSeconds}
                onChange={(e) =>
                  onChange({
                    ...watchFace,
                    hands: { ...watchFace.hands, sweepSeconds: e.target.checked },
                  })
                }
                className="w-4 h-4 rounded text-sky-500 bg-neutral-900 border-neutral-700"
              />
              <span>{isAr ? 'حركة انسيابية متصلة (Smooth Sweep)' : 'Smooth Continuous Sweep'}</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-neutral-300">
              <input
                type="checkbox"
                checked={watchFace.digital.format24h}
                onChange={(e) =>
                  onChange({
                    ...watchFace,
                    digital: { ...watchFace.digital, format24h: e.target.checked },
                  })
                }
                className="w-4 h-4 rounded text-sky-500 bg-neutral-900 border-neutral-700"
              />
              <span>{isAr ? 'نظام 24 ساعة' : '24-Hour Military Format'}</span>
            </label>
          </div>
        </div>
      )}

      {/* Tab 4: Complications */}
      {activeTab === 'complications' && (
        <div className="space-y-4 animate-fade-in">
          <p className="text-xs text-neutral-400">
            {isAr
              ? 'اختر نوع البيانات لكل فتحة تعقيد (Complication Slot) متوافقة مع مزودات بيانات Wear OS:'
              : 'Bind data providers to watchface complication slots conforming to Wear OS 5 specs:'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(['top', 'bottom', 'left', 'right', 'center'] as ComplicationSlot[]).map((slot) => {
              const currentComp =
                watchFace.complications.find((c) => c.slot === slot)?.type || 'none';

              return (
                <div
                  key={slot}
                  className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800 flex items-center justify-between gap-2"
                >
                  <span className="text-xs font-semibold text-sky-300 uppercase">
                    {slot === 'top'
                      ? isAr
                        ? 'الخانة العلوية (Top)'
                        : 'Top Slot'
                      : slot === 'bottom'
                      ? isAr
                        ? 'الخانة السفلية (Bottom)'
                        : 'Bottom Slot'
                      : slot === 'left'
                      ? isAr
                        ? 'الخانة اليسرى (Left)'
                        : 'Left Slot'
                      : slot === 'right'
                      ? isAr
                        ? 'الخانة اليمنى (Right)'
                        : 'Right Slot'
                      : isAr
                      ? 'الخانة الوسطى (Center)'
                      : 'Center Sub-slot'}
                  </span>

                  <select
                    value={currentComp}
                    onChange={(e) => updateComplication(slot, e.target.value as ComplicationType)}
                    className="bg-neutral-900 border border-neutral-700 rounded-xl px-2.5 py-1.5 text-xs text-neutral-100 outline-none focus:border-sky-500"
                  >
                    {complicationList.map((c) => (
                      <option key={c.type} value={c.type}>
                        {c.icon} {isAr ? c.labelAr : c.label}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 5: XML Generator */}
      {activeTab === 'xml' && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                watchface.xml (WFF v1.0)
              </span>
              <span className="text-xs text-neutral-400">
                {isAr ? 'جاهز للاستيراد في Android Studio' : 'Ready for Android Studio Wear OS 5'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyXml}
                className="flex items-center gap-1 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded-xl transition-colors"
              >
                {copiedXml ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                <span>{copiedXml ? (isAr ? 'تم النسخ' : 'Copied') : isAr ? 'نسخ الكود' : 'Copy'}</span>
              </button>

              <button
                onClick={() => downloadWffXmlFile(watchFace)}
                className="flex items-center gap-1 px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white text-xs rounded-xl font-medium transition-colors"
              >
                <Download size={13} />
                <span>{isAr ? 'تنزيل XML' : 'Download'}</span>
              </button>
            </div>
          </div>

          <div className="relative rounded-2xl bg-neutral-950 border border-neutral-800 p-3.5 overflow-x-auto max-h-72 font-mono text-[11px] leading-relaxed text-sky-200/90 scrollbar-thin">
            <pre>{generateWffXml(watchFace)}</pre>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="pt-3 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => {
            playClickSound();
            onSaveAsCustom(watchFace);
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-2xl transition-colors"
        >
          <Sparkles size={14} className="text-amber-400" />
          <span>{isAr ? 'حفظ كتصميم مخصص في مكتبتي' : 'Save to My Custom Library'}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playClickSound();
              onPushToWatch(watchFace);
            }}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold rounded-2xl shadow-md shadow-sky-500/25 transition-all active:scale-95"
          >
            <Smartphone size={15} />
            <span>{isAr ? 'دفع ومزامنة مع ساعة Pixel Watch' : 'Push & Apply to Pixel Watch'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
