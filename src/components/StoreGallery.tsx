import React, { useState, useMemo } from 'react';
import { WatchFace } from '../types';
import { WatchFaceRenderer } from './WatchFaceRenderer';
import {
  Search,
  Sparkles,
  Star,
  Edit3,
  Smartphone,
  Check,
  Code2,
} from 'lucide-react';
import { playClickSound } from '../utils/audio';

interface StoreGalleryProps {
  watchFaces: WatchFace[];
  activeWatchFaceId: string;
  onSelectWatchFace: (face: WatchFace) => void;
  onEditWatchFace: (face: WatchFace) => void;
  onPushWatchFace: (face: WatchFace) => void;
  onExportWff: (face: WatchFace) => void;
  onOpenAiGenerator: () => void;
  lang: 'ar' | 'en';
}

export const StoreGallery: React.FC<StoreGalleryProps> = ({
  watchFaces,
  activeWatchFaceId,
  onSelectWatchFace,
  onEditWatchFace,
  onPushWatchFace,
  onExportWff,
  onOpenAiGenerator,
  lang,
}) => {
  const isAr = lang === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['concentric-classic']));

  const categories: { id: string; name: string; nameAr: string }[] = [
    { id: 'all', name: 'All Faces', nameAr: 'الكل' },
    { id: 'material-you', name: 'Material You', nameAr: 'ماتيريال يو' },
    { id: 'fitness', name: 'Active & Fitness', nameAr: 'رياضية وصحية' },
    { id: 'analog', name: 'Analog Classic', nameAr: 'كلاسيكية عقارب' },
    { id: 'digital', name: 'Digital Modern', nameAr: 'رقمية حديثة' },
    { id: 'astronomy', name: 'Space & Orbit', nameAr: 'فضاء وفلك' },
    { id: 'artistic', name: 'Art & Dynamic', nameAr: 'فنية وتفاعلية' },
    { id: 'minimal', name: 'Minimal Zen', nameAr: 'بسيطة وموفرة' },
  ];

  const filteredFaces = useMemo(() => {
    return watchFaces.filter((face) => {
      if (selectedCategory !== 'all' && face.category !== selectedCategory) return false;
      if (selectedType !== 'all' && face.type !== selectedType) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = face.name.toLowerCase().includes(query);
        const matchNameAr = face.nameAr.toLowerCase().includes(query);
        const matchDesc = face.description.toLowerCase().includes(query);
        const matchDescAr = face.descriptionAr.toLowerCase().includes(query);
        const matchTags = face.tags.some((t) => t.toLowerCase().includes(query));
        if (!matchName && !matchNameAr && !matchDesc && !matchDescAr && !matchTags) return false;
      }

      return true;
    });
  }, [watchFaces, selectedCategory, selectedType, searchQuery]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Featured Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-950 via-indigo-950 to-neutral-900 border border-sky-800/40 p-6 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold mb-2 border border-sky-500/30">
              <Sparkles size={13} className="text-amber-300" />
              <span>{isAr ? 'متوافق مع Watch Face Format و Wear OS 5' : 'Wear OS 5 & WFF Compatible'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isAr ? 'متجر خلفيات وتصاميم Pixel Watch' : 'Pixel Watch Face Gallery'}
            </h2>
            <p className="text-sm text-neutral-300 mt-1 leading-relaxed">
              {isAr
                ? 'استكشف تشكيلة وجوه الساعة المصممة بلغة Material You وتنسيق WFF عالي الكفاءة، مع دعم التخصيص والدفع الفوري للساعة.'
                : 'Browse curated Material You watchfaces engineered with XML Watch Face Format for peak efficiency and instant Wearable sync.'}
            </p>
          </div>

          <button
            onClick={() => {
              playClickSound();
              onOpenAiGenerator();
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-rose-400 to-sky-400 text-neutral-950 font-bold shadow-lg hover:shadow-amber-400/20 hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap text-sm cursor-pointer"
          >
            <Sparkles size={16} />
            <span>{isAr ? 'توليد بالذكاء الاصطناعي (Gemini)' : 'Generate with AI (Gemini)'}</span>
          </button>
        </div>

        <div className="absolute -right-20 -top-20 w-64 h-64 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className={`absolute top-1/2 -translate-y-1/2 text-neutral-400 ${
              isAr ? 'right-3.5' : 'left-3.5'
            }`}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isAr
                ? 'ابحث بالاسم، الأسلوب، أو الكلمات المفتاحية...'
                : 'Search by title, style, or tags...'
            }
            className={`w-full bg-neutral-900/90 border border-neutral-800 focus:border-sky-500 rounded-2xl py-2.5 text-sm text-neutral-100 placeholder-neutral-500 outline-none transition-all ${
              isAr ? 'pr-10 pl-4' : 'pl-10 pr-4'
            }`}
          />
        </div>

        <div className="flex items-center gap-1 bg-neutral-900/90 p-1 rounded-2xl border border-neutral-800 self-start sm:self-auto text-xs">
          {[
            { id: 'all', label: isAr ? 'الكل' : 'All' },
            { id: 'analog', label: isAr ? 'عقارب' : 'Analog' },
            { id: 'digital', label: isAr ? 'رقمي' : 'Digital' },
            { id: 'hybrid', label: isAr ? 'هجين' : 'Hybrid' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                playClickSound();
                setSelectedType(item.id);
              }}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                selectedType === item.id
                  ? 'bg-neutral-800 text-sky-400 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              playClickSound();
              setSelectedCategory(cat.id);
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedCategory === cat.id
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                : 'bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 border border-neutral-800/80'
            }`}
          >
            <span>{isAr ? cat.nameAr : cat.name}</span>
          </button>
        ))}
      </div>

      {/* Watch Faces Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredFaces.map((face) => {
          const isActive = face.id === activeWatchFaceId;
          const isFav = favorites.has(face.id);

          return (
            <div
              key={face.id}
              onClick={() => {
                playClickSound();
                onSelectWatchFace(face);
              }}
              className={`group relative flex flex-col justify-between bg-neutral-900/70 hover:bg-neutral-900 border rounded-3xl p-4 transition-all duration-300 cursor-pointer shadow-md hover:shadow-xl hover:-translate-y-1 ${
                isActive
                  ? 'border-sky-500 ring-2 ring-sky-500/30'
                  : 'border-neutral-800/80 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    face.batteryEfficiency === 'A+'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {face.batteryEfficiency} {isAr ? 'كفاءة' : 'Power'}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => toggleFavorite(face.id, e)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                      isFav ? 'text-amber-400 bg-amber-400/10' : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                    title={isAr ? 'إضافة للمفضلة' : 'Add to Favorites'}
                  >
                    <Star size={14} className={isFav ? 'fill-amber-400' : ''} />
                  </button>

                  {isActive && (
                    <span className="flex items-center gap-1 text-[10px] bg-sky-500/20 text-sky-400 font-bold px-2 py-0.5 rounded-full border border-sky-500/30">
                      <Check size={11} /> {isAr ? 'النشط' : 'Active'}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-center py-3">
                <div className="relative p-2 rounded-full bg-neutral-950/80 border border-neutral-800 shadow-inner group-hover:scale-105 transition-transform duration-300">
                  <WatchFaceRenderer
                    watchFace={face}
                    size={160}
                    interactive={false}
                  />
                </div>
              </div>

              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-neutral-100 truncate">
                    {isAr ? face.nameAr : face.name}
                  </h4>
                  <div className="flex items-center gap-1 text-xs text-amber-400 font-semibold">
                    <Star size={12} className="fill-amber-400" />
                    <span>{face.rating}</span>
                  </div>
                </div>

                <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                  {isAr ? face.descriptionAr : face.description}
                </p>

                <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
                  <span>
                    {face.complications.filter((c) => c.type !== 'none').length}{' '}
                    {isAr ? 'تعقيدات WFF' : 'Complications'}
                  </span>
                  <span>{(face.downloads / 1000).toFixed(1)}k {isAr ? 'تنزيل' : 'uses'}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playClickSound();
                    onEditWatchFace(face);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-semibold transition-colors"
                  title={isAr ? 'تخصيص في المحرر' : 'Customize in Editor'}
                >
                  <Edit3 size={13} />
                  <span>{isAr ? 'تخصيص' : 'Customize'}</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playClickSound();
                    onPushWatchFace(face);
                  }}
                  className="flex items-center justify-center gap-1 py-1.5 px-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-sky-600/20"
                  title={isAr ? 'دفع ومزامنة مع الساعة' : 'Push to Pixel Watch'}
                >
                  <Smartphone size={13} />
                  <span>{isAr ? 'دفع' : 'Push'}</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playClickSound();
                    onExportWff(face);
                  }}
                  className="p-1.5 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white rounded-xl transition-colors"
                  title={isAr ? 'تصدير كود Watch Face Format XML' : 'Export WFF XML'}
                >
                  <Code2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredFaces.length === 0 && (
        <div className="text-center py-16 bg-neutral-900/40 rounded-3xl border border-neutral-800">
          <p className="text-neutral-400 text-sm">
            {isAr ? 'لم يتم العثور على نتائج مطابقة.' : 'No watch faces found matching criteria.'}
          </p>
        </div>
      )}
    </div>
  );
};
