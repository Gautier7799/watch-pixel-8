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
        const colorBuckets: Record<string, { r: number; g: number; b: number; count: number }> = {};

        for (let i = 0; i < imageData.length; i += 16) {
          const r = imageData[i];
          const g = imageData[i + 1];
          const b = imageData[i + 2];
          const a = imageData[i + 3];

          if (a < 128) continue;

          const quantizedR = Math.round(r / 32) * 32;
          const quantizedG = Math.round(g / 32) * 32;
          const quantizedB = Math.round(b / 32) * 32;
          const key = `${quantizedR},${quantizedG},${quantizedB}`;

          if (!colorBuckets[key]) {
            colorBuckets[key] = { r, g, b, count: 0 };
          }
          colorBuckets[key].count++;
        }

        const sorted = Object.values(colorBuckets)
          .sort((a, b) => b.count - a.count)
          .slice(0, maxColors);

        const result: ExtractedColor[] = sorted.map((b) => {
          const hsl = rgbToHsl(b.r, b.g, b.b);
          return {
            hex: hslToHex(hsl[0], hsl[1], hsl[2]),
            hsl,
            rgb: [b.r, b.g, b.b],
            population: b.count,
          };
        });

        resolve(result);
      } catch {
        resolve([]);
      }
    };

    img.onerror = () => resolve([]);

    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else {
      img.src = imageSource.src;
    }
  });
}

export function generateMaterialYouPalettes(seedHex: string): DynamicPaletteOption[] {
  const rgb = hexToRgb(seedHex);
  const [h, s] = rgbToHsl(rgb[0], rgb[1], rgb[2]);

  const tonalTonal: DynamicPaletteOption = {
    id: 'tonal-spot',
    name: 'Tonal Spot',
    nameAr: 'التناغم النغمي',
    description: 'Calm, balanced Google Pixel default aesthetic with natural harmony',
    descriptionAr: 'المظهر الافتراضي لهواتف بكسل مع تباين متوازن وألوان هادئة',
    seedHex,
    colors: {
      primary: hslToHex(h, Math.min(s, 75), 65),
      secondary: hslToHex(h, Math.max(15, s - 30), 78),
      tertiary: hslToHex((h + 60) % 360, Math.min(65, s), 72),
      background: hslToHex(h, Math.max(8, s - 40), 6),
      dialBg: hslToHex(h, Math.max(10, s - 35), 11),
      hands: hslToHex(h, Math.min(s + 10, 85), 60),
      accent: hslToHex((h + 45) % 360, 85, 68),
      complicationGlow: hslToHex(h, 80, 55),
    },
  };

  const expressive: DynamicPaletteOption = {
    id: 'expressive',
    name: 'Expressive',
    nameAr: 'تعبيري حيوي',
    description: 'Vibrant tertiary complementary contrasts for energetic watch faces',
    descriptionAr: 'تباينات لونية غنية ومليئة بالحيوية للأنشطة والرياضة',
    seedHex,
    colors: {
      primary: hslToHex(h, 90, 62),
      secondary: hslToHex((h + 120) % 360, 80, 70),
      tertiary: hslToHex((h + 240) % 360, 85, 75),
      background: hslToHex(h, 20, 5),
      dialBg: hslToHex(h, 25, 9),
      hands: hslToHex((h + 120) % 360, 95, 65),
      accent: hslToHex(h, 95, 60),
      complicationGlow: hslToHex((h + 120) % 360, 90, 60),
    },
  };

  const neutral: DynamicPaletteOption = {
    id: 'neutral',
    name: 'Neutral Luxe',
    nameAr: 'محايد فاخر',
    description: 'Subtle desaturated tones ideal for high-contrast OLED battery saving',
    descriptionAr: 'نغمات محايدة فاخرة لتوفير طاقة شاشات OLED بأعلى درجات الوضوح',
    seedHex,
    colors: {
      primary: hslToHex(h, 22, 75),
      secondary: hslToHex(h, 12, 60),
      tertiary: hslToHex(h, 15, 85),
      background: '#080808',
      dialBg: '#121212',
      hands: '#E8EAED',
      accent: hslToHex(h, 45, 70),
      complicationGlow: '#9AA0A6',
    },
  };

  const rainbowVibrant: DynamicPaletteOption = {
    id: 'rainbow',
    name: 'Vibrant Pop',
    nameAr: 'ألوان ساطعة',
    description: 'High saturation hues that stand out in direct outdoor sunlight',
    descriptionAr: 'ألوان عالية التشبع تبرز بوضوح حتى تحت أشعة الشمس المباشرة',
    seedHex,
    colors: {
      primary: hslToHex(h, 95, 58),
      secondary: hslToHex((h + 180) % 360, 90, 65),
      tertiary: hslToHex((h + 90) % 360, 85, 68),
      background: '#040508',
      dialBg: '#0B0D13',
      hands: hslToHex(h, 100, 62),
      accent: hslToHex((h + 180) % 360, 95, 62),
      complicationGlow: hslToHex(h, 90, 60),
    },
  };

  return [tonalTonal, expressive, neutral, rainbowVibrant];
}

export const PRESET_WALLPAPERS: PresetWallpaper[] = [
  {
    id: 'feather-mint',
    name: 'Pixel Botanic Mint',
    nameAr: 'نعناع بكسل النباتي',
    category: 'Botanical',
    url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=150&auto=format&fit=crop&q=80',
    previewSeed: '#34D399',
  },
  {
    id: 'sunset-amber',
    name: 'Desert Horizon Amber',
    nameAr: 'أفق الصحراء العنبري',
    category: 'Landscape',
    url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=150&auto=format&fit=crop&q=80',
    previewSeed: '#F59E0B',
  },
  {
    id: 'deep-ocean',
    name: 'Pacific Cobalt Blue',
    nameAr: 'أزرق كوبالت المحيط',
    category: 'Minimal',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=150&auto=format&fit=crop&q=80',
    previewSeed: '#38BDF8',
  },
  {
    id: 'lavender-mist',
    name: 'Orchid Twilight',
    nameAr: 'غسق الأوركيد البنفسجي',
    category: 'Abstract',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150&auto=format&fit=crop&q=80',
    previewSeed: '#C084FC',
  },
];
