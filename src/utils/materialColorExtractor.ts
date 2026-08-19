/**
 * Material You (Material 3) Dynamic Color Extraction Engine
 * Extracts dominant color seeds from any image/wallpaper and computes
 * cohesive, accessible Wear OS tonal palettes adhering to Material 3 Expressive guidelines.
 */

import { WatchColors } from '../types';

export interface ExtractedColor {
  hex: string;
  hsl: [number, number, number];
  rgb: [number, number, number];
  population: number;
}

export interface DynamicPaletteOption {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  colors: WatchColors;
  seedHex: string;
}

export interface PresetWallpaper {
  id: string;
  name: string;
  nameAr: string;
  category: string;
  url: string;
  thumbnail: string;
  previewSeed: string;
}

export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

export function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

export function hexToRgb(hex: string): [number, number, number] {
  const sanitized = hex.replace('#', '');
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

export async function extractDominantColorsFromImage(
  imageSource: string | HTMLImageElement,
  maxColors = 6
): Promise<ExtractedColor[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve([]);
          return;
        }

        const size = 100;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);

        const imageData = ctx.getImageData(0, 0, size, size).data;
        const colorBuckets = new Map<string, { r: number; g: number; b: number; count: number }>();

        const step = 4 * 2;
        for (let i = 0; i < imageData.length; i += step) {
          const r = imageData[i];
          const g = imageData[i + 1];
          const b = imageData[i + 2];
          const a = imageData[i + 3];

          if (a < 128) continue;
          const [h, s, l] = rgbToHsl(r, g, b);
          if (l < 5 || l > 95) continue;

          const bucketR = Math.round(r / 24) * 24;
          const bucketG = Math.round(g / 24) * 24;
          const bucketB = Math.round(b / 24) * 24;
          const key = `${bucketR},${bucketG},${bucketB}`;

          const existing = colorBuckets.get(key);
          if (existing) {
            existing.count++;
          } else {
            colorBuckets.set(key, { r: bucketR, g: bucketG, b: bucketB, count: 1 });
          }
        }

        const sorted = Array.from(colorBuckets.values())
          .map((item) => {
            const [h, s, l] = rgbToHsl(item.r, item.g, item.b);
            const chromaBonus = 1 + (s / 100) * 1.5;
            return {
              r: item.r,
              g: item.g,
              b: item.b,
              hsl: [h, s, l] as [number, number, number],
              hex: hslToHex(h, s, l),
              count: item.count,
              score: item.count * chromaBonus,
            };
          })
          .sort((a, b) => b.score - a.score);

        const uniqueColors: ExtractedColor[] = [];
        for (const item of sorted) {
          const isTooClose = uniqueColors.some((uc) => {
            const hueDiff = Math.abs(uc.hsl[0] - item.hsl[0]);
            const satDiff = Math.abs(uc.hsl[1] - item.hsl[1]);
            const lightDiff = Math.abs(uc.hsl[2] - item.hsl[2]);
            return (hueDiff < 25 || hueDiff > 335) && satDiff < 25 && lightDiff < 25;
          });

          if (!isTooClose) {
            uniqueColors.push({
              hex: item.hex,
              hsl: item.hsl,
              rgb: [item.r, item.g, item.b],
              population: item.count,
            });
          }

          if (uniqueColors.length >= maxColors) break;
        }

        resolve(uniqueColors);
      } catch (err) {
        console.error('Failed to extract colors from image canvas:', err);
        resolve([]);
      }
    };

    img.onerror = () => {
      resolve([]);
    };

    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else {
      img.src = imageSource.src;
    }
  });
}

export function generateMaterialYouPalettes(seedHex: string): DynamicPaletteOption[] {
  const [r, g, b] = hexToRgb(seedHex);
  const [h, s] = rgbToHsl(r, g, b);

  const tonalSpot: DynamicPaletteOption = {
    id: 'tonal-spot',
    name: 'Tonal Spot (Balanced)',
    nameAr: 'نغمي متوازن (Material Standard)',
    description: 'Crisp, harmonious Material 3 tones with optimal OLED contrast.',
    descriptionAr: 'تدرجات نغمية متناسقة ومريحة للعين مع تباين فائق لشاشات OLED.',
    seedHex,
    colors: {
      primary: hslToHex(h, Math.min(85, s + 10), 78),
      secondary: hslToHex((h + 15) % 360, Math.max(25, s - 25), 65),
      tertiary: hslToHex((h + 60) % 360, Math.min(75, s), 72),
      background: hslToHex(h, Math.min(15, s * 0.15), 6),
      dialBg: hslToHex(h, Math.min(20, s * 0.2), 11),
      hands: '#FFFFFF',
      accent: hslToHex((h + 180) % 360, Math.min(95, s + 20), 75),
      complicationGlow: hslToHex(h, s, 75) + '33',
    },
  };

  const vibrantExpressive: DynamicPaletteOption = {
    id: 'vibrant-expressive',
    name: 'Expressive Vibrant',
    nameAr: 'تعبيري حيوي (High Chroma)',
    description: 'High-energy, punchy Material You colors inspired by Pixel 8/9 active faces.',
    descriptionAr: 'ألوان مشبعة ومرحة مستوحاة من أحدث واجهات جوجل بكسل الرياضية.',
    seedHex,
    colors: {
      primary: hslToHex(h, 92, 74),
      secondary: hslToHex((h + 35) % 360, 80, 68),
      tertiary: hslToHex((h + 120) % 360, 85, 75),
      background: hslToHex(h, 25, 7),
      dialBg: hslToHex(h, 30, 13),
      hands: hslToHex((h + 10) % 360, 95, 92),
      accent: hslToHex((h + 200) % 360, 100, 72),
      complicationGlow: hslToHex(h, 90, 70) + '44',
    },
  };

  const pastelGlow: DynamicPaletteOption = {
    id: 'pastel-glow',
    name: 'Pastel Luminous',
    nameAr: 'باستيل ناعم (Soft Pastel)',
    description: 'Gentle pastel hues with soothing tone curve and high readability.',
    descriptionAr: 'تدرجات باستيلية هادئة ناعمة ذات مظهر عصري وأنيق.',
    seedHex,
    colors: {
      primary: hslToHex(h, 60, 82),
      secondary: hslToHex((h + 40) % 360, 45, 78),
      tertiary: hslToHex((h + 90) % 360, 50, 80),
      background: hslToHex(h, 12, 8),
      dialBg: hslToHex(h, 18, 14),
      hands: '#FAFAFA',
      accent: hslToHex((h + 150) % 360, 70, 80),
      complicationGlow: hslToHex(h, 50, 80) + '30',
    },
  };

  const midnightMinimal: DynamicPaletteOption = {
    id: 'midnight-minimal',
    name: 'Midnight Monochromatic',
    nameAr: 'منتصف الليل الأحادي (OLED Pure)',
    description: 'Pure black canvas with subtle tonal accents for maximum battery savings.',
    descriptionAr: 'خلفية سوداء نقية مع لمسات ملونة طفيفة لتوفير أقصى قدر من البطارية.',
    seedHex,
    colors: {
      primary: hslToHex(h, Math.min(60, s), 80),
      secondary: hslToHex(h, 20, 55),
      tertiary: hslToHex((h + 20) % 360, 30, 65),
      background: '#000000',
      dialBg: '#080808',
      hands: '#E6E6E6',
      accent: hslToHex(h, 85, 75),
      complicationGlow: hslToHex(h, 60, 70) + '22',
    },
  };

  return [tonalSpot, vibrantExpressive, pastelGlow, midnightMinimal];
}

export const CURATED_WALLPAPERS: PresetWallpaper[] = [
  {
    id: 'cosmic-nebula',
    name: 'Cosmic Nebula',
    nameAr: 'سديم كوني كوزموس',
    category: 'Astronomy',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=150&auto=format&fit=crop&q=70',
    previewSeed: '#9B51E0',
  },
  {
    id: 'desert-sunset',
    name: 'Desert Dunes Sunset',
    nameAr: 'غروب الصحراء والكثبان',
    category: 'Nature',
    url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=150&auto=format&fit=crop&q=70',
    previewSeed: '#FF8A65',
  },
  {
    id: 'emerald-forest',
    name: 'Emerald Pine Mist',
    nameAr: 'غابة الزمرد والضباب',
    category: 'Nature',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=150&auto=format&fit=crop&q=70',
    previewSeed: '#34A853',
  },
  {
    id: 'ocean-coral',
    name: 'Azure Ocean & Coral',
    nameAr: 'المحيط الأزرق والشعب',
    category: 'Ocean',
    url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=150&auto=format&fit=crop&q=70',
    previewSeed: '#00BCD4',
  },
  {
    id: 'material-geometry',
    name: 'Material Shapes 3D',
    nameAr: 'أشكال ماتيريال هندسية',
    category: 'Abstract',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=70',
    previewSeed: '#A8C7FA',
  },
  {
    id: 'cherry-blossom',
    name: 'Sakura Floral Glow',
    nameAr: 'أزهار الكرز والساكورا',
    category: 'Floral',
    url: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=600&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=150&auto=format&fit=crop&q=70',
    previewSeed: '#F48FB1',
  },
];
