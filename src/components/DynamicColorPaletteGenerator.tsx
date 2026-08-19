import React, { useState, useEffect, useRef } from 'react';
import { WatchFace, WatchColors } from '../types';
import {
  extractDominantColorsFromImage,
  generateMaterialYouPalettes,
  ExtractedColor,
  DynamicPaletteOption,
  CURATED_WALLPAPERS,
  PresetWallpaper,
} from '../utils/materialColorExtractor';
import { playClickSound, playNotificationSound } from '../utils/audio';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Upload,
  Image as ImageIcon,
  Check,
  RefreshCw,
  Palette,
  Zap,
  Info,
} from 'lucide-react';

interface DynamicColorPaletteGeneratorProps {
  watchFace: WatchFace;
  onChange: (updatedFace: WatchFace) => void;
  lang: 'ar' | 'en';
}

export const DynamicColorPaletteGenerator: React.FC<DynamicColorPaletteGeneratorProps> = ({
  watchFace,
  onChange,
  lang,
}) => {
  const isAr = lang === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedImage, setSelectedImage] = useState<string>(CURATED_WALLPAPERS[0].url);
  const [extractedColors, setExtractedColors] = useState<ExtractedColor[]>([]);
  const [activeSeedHex, setActiveSeedHex] = useState<string>(CURATED_WALLPAPERS[0].previewSeed);
  const [paletteOptions, setPaletteOptions] = useState<DynamicPaletteOption[]>([]);
  const [selectedPaletteId, setSelectedPaletteId] = useState<string>('tonal-spot');
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [applyAsBackground, setApplyAsBackground] = useState<boolean>(false);
  const [bgDimLevel, setBgDimLevel] = useState<number>(0.4);
  const [appliedNotification, setAppliedNotification] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const processImage = async () => {
      setIsExtracting(true);
      try {
        const colors = await extractDominantColorsFromImage(selectedImage, 6);
        if (isMounted) {
          if (colors.length > 0) {
            setExtractedColors(colors);
            const primarySeed = colors[0].hex;
            setActiveSeedHex(primarySeed);
            const palettes = generateMaterialYouPalettes(primarySeed);
            setPaletteOptions(palettes);
          } else {
            const fallbackSeed = '#A8C7FA';
            setActiveSeedHex(fallbackSeed);
            const palettes = generateMaterialYouPalettes(fallbackSeed);
            setPaletteOptions(palettes);
          }
        }
      } catch (err) {
        console.error('Extraction error:', err);
      } finally {
        if (isMounted) setIsExtracting(false);
      }
    };

    processImage();
    return () => {
      isMounted = false;
    };
  }, [selectedImage]);

  const handleSelectSeed = (hex: string) => {
    playClickSound();
    setActiveSeedHex(hex);
    const palettes = generateMaterialYouPalettes(hex);
    setPaletteOptions(palettes);
  };

  const handleSelectPreset = (preset: PresetWallpaper) => {
    playClickSound();
    setSelectedImage(preset.url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    playClickSound();
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setSelectedImage(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyPalette = (palette: DynamicPaletteOption) => {
    playNotificationSound();
    setSelectedPaletteId(palette.id);

    const updatedColors: WatchColors = {
      ...palette.colors,
    };

    let updatedBackground = { ...watchFace.background };
    if (applyAsBackground && selectedImage) {
      updatedBackground = {
        type: 'custom-image',
        customImageUrl: selectedImage,
        imageDim: bgDimLevel,
        patternOpacity: 0.1,
      };
    }

    onChange({
      ...watchFace,
      colors: updatedColors,
      background: updatedBackground,
    });

    setAppliedNotification(true);
    setTimeout(() => setAppliedNotification(false), 2400);
  };

  const activePalette = paletteOptions.find((p) => p.id === selectedPaletteId) || paletteOptions[0];

  return (
    <div
      id="dynamic-color-palette-generator"
      className="bg-slate-900/90 rounded-2xl border border-sky-500/20 p-5 backdrop-blur-md shadow-xl text-slate-100 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <span>{isAr ? 'مولّد ألوان Material You الديناميكي' : 'Material You Dynamic Palette'}</span>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-sky-500/20 text-sky-400 rounded-full border border-sky-500/30">
                Android 14/15
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'استخراج آلي للألوان الحيوية من صور الخلفيات وتوليد تدرجات Wear OS متناسقة.'
                : 'Extract dominant color seeds from wallpapers and generate Material 3 tonal palettes.'}
            </p>
          </div>
        </div>

        <AnimatePresence>
          {appliedNotification && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-medium"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isAr ? 'تم تطبيق لوحة الألوان بنجاح!' : 'Dynamic Palette Applied!'}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Step 1: Select Wallpaper */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
            <span>{isAr ? '١. اختر صورة الخلفية أو ارفع صورتك' : '1. Select or Upload Wallpaper'}</span>
          </label>

          <div className="flex items-center gap-2">
            <button
              id="upload-wallpaper-btn"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-sky-200 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-3 h-3" />
              <span>{isAr ? 'رفع صورة من الجهاز' : 'Upload Image'}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
          {CURATED_WALLPAPERS.map((wallpaper) => {
            const isSelected = selectedImage === wallpaper.url;
            return (
              <button
                key={wallpaper.id}
                type="button"
                onClick={() => handleSelectPreset(wallpaper)}
                className={`group relative rounded-xl overflow-hidden aspect-video border-2 transition-all p-0 cursor-pointer ${
                  isSelected
                    ? 'border-sky-400 ring-2 ring-sky-500/30 scale-[1.03] shadow-md shadow-sky-500/20'
                    : 'border-slate-800 hover:border-slate-600 opacity-75 hover:opacity-100'
                }`}
              >
                <img
                  src={wallpaper.thumbnail}
                  alt={wallpaper.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                  <span className="text-[10px] text-slate-200 font-medium truncate">
                    {isAr ? wallpaper.nameAr : wallpaper.name}
                  </span>
                </div>
                {isSelected && (
                  <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-sky-500 text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Extracted Seeds */}
      <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isAr ? '٢. الألوان المستخرجة من الصورة' : '2. Extracted Color Seeds'}</span>
          </label>
          {isExtracting && (
            <span className="text-xs text-sky-400 flex items-center gap-1 animate-pulse">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>{isAr ? 'جاري التحليل...' : 'Extracting Seeds...'}</span>
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {extractedColors.map((col, idx) => {
            const isSeedActive = activeSeedHex.toLowerCase() === col.hex.toLowerCase();
            return (
              <button
                key={`${col.hex}-${idx}`}
                type="button"
                onClick={() => handleSelectSeed(col.hex)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                  isSeedActive
                    ? 'bg-slate-800 border-sky-400 ring-2 ring-sky-500/30'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80'
                }`}
              >
                <div
                  className="w-5 h-5 rounded-full border border-white/20 shadow-inner flex items-center justify-center shrink-0"
                  style={{ backgroundColor: col.hex }}
                >
                  {isSeedActive && <Check className="w-3 h-3 text-white drop-shadow" />}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-mono font-bold text-slate-200 leading-none">
                    {col.hex}
                  </span>
                  <span className="text-[9px] text-slate-400">
                    H:{col.hsl[0]}° S:{col.hsl[1]}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 3: Material 3 Tonal Palettes */}
      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>{isAr ? '٣. حدد نمط تناسق Material 3' : '3. Choose Material 3 Harmony Style'}</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {paletteOptions.map((option) => {
            const isSelected = selectedPaletteId === option.id;
            return (
              <div
                key={option.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'bg-slate-800/90 border-sky-400/80 ring-1 ring-sky-400/50 shadow-lg shadow-sky-500/10'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                      <span>{isAr ? option.nameAr : option.name}</span>
                    </h4>
                    {isSelected && (
                      <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-bold border border-sky-500/30">
                        {isAr ? 'محدد' : 'Active'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {isAr ? option.descriptionAr : option.description}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="grid grid-cols-6 h-6 rounded-lg overflow-hidden border border-slate-700/60 shadow-inner">
                    <div className="h-full" style={{ backgroundColor: option.colors.primary }} />
                    <div className="h-full" style={{ backgroundColor: option.colors.secondary }} />
                    <div className="h-full" style={{ backgroundColor: option.colors.tertiary }} />
                    <div className="h-full" style={{ backgroundColor: option.colors.accent }} />
                    <div className="h-full" style={{ backgroundColor: option.colors.dialBg }} />
                    <div className="h-full" style={{ backgroundColor: option.colors.hands }} />
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-400 px-0.5 font-mono">
                    <span>Primary</span>
                    <span>Secondary</span>
                    <span>Tertiary</span>
                    <span>Accent</span>
                    <span>Surface</span>
                    <span>Hands</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleApplyPalette(option)}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold shadow-md shadow-sky-500/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>
                    {isAr ? `تطبيق نمط (${option.nameAr})` : `Apply (${option.name})`}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 4: Background Integration Option */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              id="set-as-watch-bg-checkbox"
              type="checkbox"
              checked={applyAsBackground}
              onChange={(e) => setApplyAsBackground(e.target.checked)}
              className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-slate-700 focus:ring-sky-500 cursor-pointer"
            />
            <label
              htmlFor="set-as-watch-bg-checkbox"
              className="text-xs font-medium text-slate-200 cursor-pointer select-none"
            >
              {isAr
                ? 'تعيين صورة الخلفية كخلفية مباشرة لوجه الساعة'
                : 'Also set selected wallpaper as watch face background overlay'}
            </label>
          </div>
          <span className="text-[10px] text-amber-400 flex items-center gap-1">
            <Info className="w-3 h-3" />
            <span>{isAr ? 'OLED Friendly' : 'OLED Dimmed'}</span>
          </span>
        </div>

        {applyAsBackground && (
          <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-400">
              <span>{isAr ? 'مستوى التعتيم لحماية البطارية:' : 'Image Dim Level:'}</span>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-48">
              <span className="text-[10px] text-slate-500">20%</span>
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                value={bgDimLevel}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setBgDimLevel(val);
                  if (watchFace.background.type === 'custom-image') {
                    onChange({
                      ...watchFace,
                      background: {
                        ...watchFace.background,
                        imageDim: val,
                      },
                    });
                  }
                }}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
              <span className="text-[10px] font-mono text-sky-400">
                {Math.round(bgDimLevel * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Global CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: activeSeedHex }}
          />
          <span>
            {isAr
              ? `اللون المحوري النشط: ${activeSeedHex}`
              : `Active Seed Tone: ${activeSeedHex}`}
          </span>
        </div>

        <button
          id="apply-all-dynamic-colors-btn"
          type="button"
          onClick={() => {
            if (activePalette) {
              handleApplyPalette(activePalette);
            }
          }}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isAr ? 'تطبيق لوحة Material You الآن' : 'Apply Material You Palette Now'}</span>
        </button>
      </div>
    </div>
  );
};
