import React, { useState } from 'react';
import { WatchFace } from '../types';
import { WatchFaceRenderer } from './WatchFaceRenderer';
import {
  Sparkles,
  X,
  RefreshCw,
  Check,
} from 'lucide-react';
import { playClickSound, playSyncSuccessChime } from '../utils/audio';
import confetti from 'canvas-confetti';

interface AiGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyGeneratedFace: (face: WatchFace) => void;
  lang: 'ar' | 'en';
}

export const AiGeneratorModal: React.FC<AiGeneratorModalProps> = ({
  isOpen,
  onClose,
  onApplyGeneratedFace,
  lang,
}) => {
  if (!isOpen) return null;

  const isAr = lang === 'ar';
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('material-you');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFace, setGeneratedFace] = useState<WatchFace | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const promptPresets = [
    {
      label: isAr ? 'سديم كوني نيون' : 'Neon Cosmic Nebula',
      prompt: isAr
        ? 'خلفية فضائية بسديم بنفسجي متدرج ونجوم متألقة مع مؤشرات دائرية نيونية'
        : 'Deep purple nebula starlight watch face with glowing cyan orbital complications',
    },
    {
      label: isAr ? 'ألوان ماتيريال 3 مرحة' : 'Material 3 Playful Lime',
      prompt: isAr
        ? 'تصميم رقمي عريض بألوان الليمون الأخضر والوردي الفاتح مع أرقام Google Sans ضخمة'
        : 'Playful lime and pastel pink oversized digital numbers in Google Sans Flex',
    },
    {
      label: isAr ? 'كرونوغراف عربي ذهبي' : 'Royal Arabic Indic Gold',
      prompt: isAr
        ? 'ساعة تناظرية فاخرة بأرقام مشرقية مذهبة وميناء داكن زمردي مع تعقيدات شروق وغروب'
        : 'Emerald green luxury dial with golden Arabic-Indic numerals and solar complications',
    },
    {
      label: isAr ? 'ماراثون فيتبت الصحي' : 'Fitbit Marathon Pro',
      prompt: isAr
        ? 'لوحة تحكم رياضية سريعة بتباين فائق لحلقات الخطوات ونبضات القلب والسعرات'
        : 'High-contrast fitness HUD with active step arcs, live heart rate pulse, and calories',
    },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    playClickSound();
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/gemini/generate-watchface', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          style: selectedStyle,
          language: lang,
        }),
      });

      const data = await res.json();
      if (data.success && data.watchFace) {
        const wf = data.watchFace;
        const completeFace: WatchFace = {
          id: wf.id || `ai-${Date.now()}`,
          name: wf.name || (isAr ? 'تصميم ذكاء اصطناعي' : 'AI Generated Face'),
          nameAr: wf.name || 'تصميم ذكاء اصطناعي',
          description: wf.description || 'Generated via Gemini AI',
          descriptionAr: wf.description || 'تم إنشاؤه عبر ذكاء اصطناعي متطور',
          category: wf.category || 'material-you',
          type: wf.type || 'hybrid',
          colors: {
            primary: wf.colors?.primary || '#A8C7FA',
            secondary: wf.colors?.secondary || '#7C9CBF',
            tertiary: wf.colors?.tertiary || '#D3E3FD',
            background: wf.colors?.background || '#0B0E14',
            dialBg: wf.colors?.dialBg || '#121824',
            hands: wf.colors?.hands || '#FFFFFF',
            accent: wf.colors?.accent || '#FFB4AB',
            complicationGlow: wf.colors?.complicationGlow || '#A8C7FA33',
          },
          dial: {
            style: wf.dial?.style || 'concentric',
            ticksCount: wf.dial?.ticksCount ?? 12,
            showHourMarks: wf.dial?.showHourMarks ?? true,
            showSubDial: wf.dial?.showSubDial ?? true,
            hourMarkerFont: wf.dial?.hourMarkerFont || 'google-sans',
            dialRingOpacity: 0.8,
          },
          hands: {
            style: wf.hands?.style || 'pill',
            showSeconds: wf.hands?.showSeconds ?? true,
            sweepSeconds: wf.hands?.sweepSeconds ?? true,
            tailStyle: wf.hands?.tailStyle || 'circle',
            accentCapColor: wf.colors?.accent || '#FFB4AB',
          },
          digital: {
            font: wf.digital?.font || 'google-sans',
            format24h: wf.digital?.format24h ?? true,
            showSeconds: wf.digital?.showSeconds ?? false,
            layout: wf.digital?.layout || 'stacked',
          },
          complications: wf.complications || [
            { slot: 'top', type: 'battery' },
            { slot: 'bottom', type: 'steps' },
            { slot: 'left', type: 'heart_rate' },
            { slot: 'right', type: 'weather' },
          ],
          background: {
            type: 'radial-gradient',
            gradientColors: [wf.colors?.dialBg || '#121824', wf.colors?.background || '#0B0E14'],
          },
          ambientDimLevel: wf.ambientDimLevel || 0.3,
          batteryEfficiency: 'A+',
          rating: 5.0,
          downloads: 1,
          isCustom: true,
          tags: ['AI Generated', 'Gemini', 'Material You'],
        };

        setGeneratedFace(completeFace);
        playSyncSuccessChime();
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } else {
        setErrorMsg(isAr ? 'تعذر توليد التصميم، يرجى المحاولة ثانية.' : 'Failed to generate design.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Generation error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (!generatedFace) return;
    playClickSound();
    onApplyGeneratedFace(generatedFace);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
      <div
        className="bg-neutral-900 border border-neutral-700/80 w-full max-w-2xl rounded-3xl p-6 shadow-2xl relative overflow-hidden"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-amber-500/10 via-rose-500/10 to-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-rose-400 text-neutral-950 flex items-center justify-center shadow-md">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">
                {isAr ? 'مولّد خلفيات Pixel بالذكاء الاصطناعي' : 'Gemini AI Watch Face Architect'}
              </h3>
              <p className="text-xs text-neutral-400">
                {isAr ? 'صمم وجه ساعة مخصص بالكامل في ثوانٍ عبر نماذج Gemini' : 'Generate custom Material 3 WFF watch faces with Gemini'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                {isAr ? 'اكتب وصفاً لوجه الساعة المطلوب:' : 'Describe your ideal watch face:'}
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  isAr
                    ? 'مثال: خلفية فلكية بألوان كوزموس بنفسجية متدرجة، مع أرقام واضحة وعقارب بيضاوية بيضاء ومؤشرات بطارية وخطوات...'
                    : 'e.g., Cyberpunk tachymeter with neon cyan dials, high contrast OLED dark canvas, and Fitbit activity rings...'
                }
                rows={3}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-sky-500 rounded-2xl p-3 text-xs text-neutral-100 placeholder-neutral-500 outline-none transition-all resize-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-neutral-400 block mb-1.5">
                {isAr ? 'أفكار مقترحة سريعة:' : 'Quick Creative Starters:'}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {promptPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      playClickSound();
                      setPrompt(preset.prompt);
                    }}
                    className="px-2.5 py-1 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-[11px] rounded-xl text-neutral-300 transition-all text-left truncate max-w-full"
                  >
                    ✨ {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                {isAr ? 'النمط والتصنيف الأساسي:' : 'Design Archetype:'}
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'material-you', label: isAr ? 'ماتيريال يو' : 'Material You' },
                  { id: 'fitness', label: isAr ? 'رياضي صحي' : 'Active Health' },
                  { id: 'minimal', label: isAr ? 'بسيط نقي' : 'Minimalist' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStyle(s.id)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-medium transition-all ${
                      selectedStyle === s.id
                        ? 'bg-sky-500 text-white font-bold'
                        : 'bg-neutral-950 text-neutral-400 hover:bg-neutral-800'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-400 via-rose-400 to-sky-400 hover:opacity-95 text-neutral-950 font-bold rounded-2xl text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>{isAr ? 'جاري التصميم والتوليد عبر Gemini...' : 'Designing with Gemini...'}</span>
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  <span>{isAr ? 'توليد وجه الساعة الآن' : 'Generate Watch Face Now'}</span>
                </>
              )}
            </button>

            {errorMsg && (
              <div className="p-2.5 bg-rose-950/50 border border-rose-800/60 rounded-xl text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}
          </div>

          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 flex flex-col items-center justify-between text-center min-h-[280px]">
            {generatedFace ? (
              <div className="w-full flex flex-col items-center space-y-3 animate-fade-in">
                <div className="p-2 rounded-full bg-neutral-900 border border-neutral-800 shadow-inner">
                  <WatchFaceRenderer watchFace={generatedFace} size={150} interactive={false} />
                </div>

                <div>
                  <h4 className="font-bold text-sm text-white">
                    {isAr ? generatedFace.nameAr : generatedFace.name}
                  </h4>
                  <p className="text-xs text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                    {isAr ? generatedFace.descriptionAr : generatedFace.description}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap justify-center text-[10px]">
                  <span className="px-2 py-0.5 bg-sky-500/20 text-sky-300 rounded-full font-medium">
                    {generatedFace.type.toUpperCase()}
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full font-medium">
                    {generatedFace.batteryEfficiency} EFFICIENCY
                  </span>
                </div>

                <button
                  onClick={handleApply}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs transition-all shadow-md"
                >
                  <Check size={14} />
                  <span>{isAr ? 'اعتماد ونقل للمحرر والمحاكي' : 'Apply to Studio & Watch'}</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-neutral-500 space-y-2 py-10">
                <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-600">
                  <Sparkles size={24} />
                </div>
                <p className="text-xs max-w-[200px] leading-relaxed">
                  {isAr
                    ? 'اكتب وصفك واضغط توليد لمشاهدة المعاينة الحية فوراً.'
                    : 'Describe your concept and hit generate to preview live.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
