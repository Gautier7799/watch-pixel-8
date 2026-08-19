import React, { useMemo } from 'react';
import { WatchFace, ComplicationSlot, ComplicationType, BiometricSensorData } from '../types';
import {
  Battery,
  Flame,
  Footprints,
  Heart,
  CloudSun,
  Calendar,
  Sun,
  Compass,
  Music,
  Globe,
} from 'lucide-react';

export const DEFAULT_BIOMETRIC_DATA: BiometricSensorData = {
  heartRate: 76,
  steps: 8420,
  stepGoal: 10000,
  calories: 480,
  battery: 84,
  uvIndex: 4,
  temperature: 24,
  isWorkoutActive: false,
};

interface WatchFaceRendererProps {
  watchFace: WatchFace;
  currentTime?: Date;
  isAod?: boolean;
  size?: number;
  onComplicationClick?: (slot: ComplicationSlot, type: ComplicationType) => void;
  interactive?: boolean;
  sensorData?: BiometricSensorData;
}

export const WatchFaceRenderer: React.FC<WatchFaceRendererProps> = ({
  watchFace,
  currentTime = new Date(),
  isAod = false,
  size = 300,
  onComplicationClick,
  interactive = true,
  sensorData = DEFAULT_BIOMETRIC_DATA,
}) => {
  const currentSensors = { ...DEFAULT_BIOMETRIC_DATA, ...sensorData };
  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const seconds = currentTime.getSeconds();
  const milliseconds = currentTime.getMilliseconds();

  const secondAngle = watchFace.hands.sweepSeconds
    ? (seconds + milliseconds / 1000) * 6
    : seconds * 6;
  const minuteAngle = minutes * 6 + seconds * 0.1;
  const hourAngle = (hours % 12) * 30 + minutes * 0.5;

  const radius = size / 2;
  const center = radius;

  const formattedHours = watchFace.digital.format24h
    ? String(hours).padStart(2, '0')
    : String(hours % 12 || 12);
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');

  const bgStyle = useMemo(() => {
    if (isAod) {
      return { backgroundColor: '#000000' };
    }
    const bg = watchFace.background;
    if (bg.type === 'radial-gradient' && bg.gradientColors) {
      return {
        background: `radial-gradient(circle at center, ${bg.gradientColors[0]} 0%, ${bg.gradientColors[1]} 100%)`,
      };
    }
    if (bg.type === 'linear-gradient' && bg.gradientColors) {
      return {
        background: `linear-gradient(180deg, ${bg.gradientColors[0]} 0%, ${bg.gradientColors[1]} 100%)`,
      };
    }
    if (bg.type === 'custom-image' && bg.customImageUrl) {
      const dim = bg.imageDim !== undefined ? bg.imageDim : 0.4;
      return {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, ${dim}), rgba(0, 0, 0, ${dim})), url(${bg.customImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: watchFace.colors.background || '#0B0E14',
      };
    }
    if (bg.type === 'stars') {
      return {
        backgroundColor: '#03040B',
        backgroundImage: `radial-gradient(1px 1px at 25px 35px, #fff, rgba(0,0,0,0)), radial-gradient(1px 1px at 80px 120px, #fff, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 150px 70px, #A8C7FA, rgba(0,0,0,0)), radial-gradient(1px 1px at 220px 200px, #fff, rgba(0,0,0,0)), radial-gradient(2px 2px at 90px 220px, #F48FB1, rgba(0,0,0,0))`,
      };
    }
    return { backgroundColor: watchFace.colors.dialBg || watchFace.colors.background };
  }, [watchFace, isAod]);

  const activePrimary = isAod ? '#FFFFFF' : watchFace.colors.primary;
  const activeSecondary = isAod ? '#888888' : watchFace.colors.secondary;
  const activeHands = isAod ? '#E0E0E0' : watchFace.colors.hands;
  const activeAccent = isAod ? '#FFFFFF' : watchFace.colors.accent;

  const arabicIndicNumerals = ['١٢', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '١٠', '١١'];
  const standardNumerals = ['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
  const romanNumerals = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];

  const renderDialMarks = () => {
    const marks = [];
    const count = watchFace.dial.ticksCount;

    if (count > 0 && !isAod) {
      for (let i = 0; i < count; i++) {
        const angle = (i * 360) / count;
        const isMajor = i % (count === 60 ? 5 : 1) === 0;
        const tickLength = isMajor ? radius * 0.08 : radius * 0.04;
        const tickWidth = isMajor ? 2.5 : 1;
        const tickRadius = radius - radius * 0.06;

        const rad = ((angle - 90) * Math.PI) / 180;
        const x1 = center + tickRadius * Math.cos(rad);
        const y1 = center + tickRadius * Math.sin(rad);
        const x2 = center + (tickRadius - tickLength) * Math.cos(rad);
        const y2 = center + (tickRadius - tickLength) * Math.sin(rad);

        marks.push(
          <line
            key={`tick-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={isMajor ? activePrimary : activeSecondary}
            strokeWidth={tickWidth}
            strokeLinecap="round"
            opacity={isMajor ? 0.9 : 0.4}
          />
        );
      }
    }

    if (watchFace.dial.showHourMarks) {
      for (let i = 0; i < 12; i++) {
        if (watchFace.dial.style === 'minimal-quad' && i % 3 !== 0) continue;

        const angle = i * 30;
        const rad = ((angle - 90) * Math.PI) / 180;
        const numRadius = radius - radius * 0.22;
        const nx = center + numRadius * Math.cos(rad);
        const ny = center + numRadius * Math.sin(rad);

        let numText = standardNumerals[i];
        if (watchFace.dial.style === 'arabic-indic') numText = arabicIndicNumerals[i];
        if (watchFace.dial.style === 'roman') numText = romanNumerals[i];

        marks.push(
          <text
            key={`num-${i}`}
            x={nx}
            y={ny + (size > 200 ? 5 : 3)}
            textAnchor="middle"
            fill={activePrimary}
            fontSize={size * (watchFace.dial.style === 'roman' ? 0.065 : 0.075)}
            fontWeight={i % 3 === 0 ? '700' : '500'}
            fontFamily={
              watchFace.dial.hourMarkerFont === 'mono'
                ? 'monospace'
                : watchFace.dial.hourMarkerFont === 'serif'
                ? 'Georgia, serif'
                : 'system-ui, sans-serif'
            }
            opacity={isAod ? 0.85 : 0.95}
          >
            {numText}
          </text>
        );
      }
    }

    if (watchFace.dial.style === 'concentric' && !isAod) {
      marks.push(
        <circle
          key="conc-1"
          cx={center}
          cy={center}
          r={radius * 0.78}
          fill="none"
          stroke={activeSecondary}
          strokeWidth="1"
          strokeDasharray="4 4"
          opacity="0.5"
        />,
        <circle
          key="conc-2"
          cx={center}
          cy={center}
          r={radius * 0.52}
          fill="none"
          stroke={activePrimary}
          strokeWidth="1.5"
          opacity="0.3"
        />
      );
    }

    return marks;
  };

  const renderComplicationSlot = (slot: ComplicationSlot) => {
    const complication = watchFace.complications.find((c) => c.slot === slot);
    if (!complication || complication.type === 'none') return null;

    let slotX = center;
    let slotY = center;
    const offset = radius * 0.55;

    if (slot === 'top') slotY = center - offset;
    if (slot === 'bottom') slotY = center + offset;
    if (slot === 'left') slotX = center - offset;
    if (slot === 'right') slotX = center + offset;
    if (slot === 'center') slotY = center + radius * 0.18;

    const iconSize = Math.max(12, size * 0.045);

    const getComplicationContent = () => {
      switch (complication.type) {
        case 'battery': {
          const bat = Math.min(100, Math.max(0, currentSensors.battery));
          const color = bat <= 20 ? '#EF4444' : bat <= 45 ? '#F59E0B' : '#10B981';
          return {
            icon: (
              <Battery
                size={iconSize}
                className={bat <= 20 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}
                style={{ color }}
              />
            ),
            label: `${Math.round(bat)}%`,
            progress: bat / 100,
            color,
          };
        }
        case 'heart_rate': {
          const hr = currentSensors.heartRate;
          const hrProgress = Math.min(1, Math.max(0.15, (hr - 40) / 160));
          const color =
            hr >= 165
              ? '#EF4444'
              : hr >= 135
              ? '#F97316'
              : hr >= 95
              ? '#EC4899'
              : hr >= 60
              ? '#F43F5E'
              : '#38BDF8';
          const pulsePeriod = Math.max(0.35, 60 / hr);
          return {
            icon: (
              <Heart
                size={iconSize}
                className="fill-current"
                style={{
                  color,
                  animation: `pulse ${pulsePeriod}s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
                }}
              />
            ),
            label: `${hr}`,
            progress: hrProgress,
            color,
          };
        }
        case 'steps': {
          const st = currentSensors.steps;
          const goal = currentSensors.stepGoal || 10000;
          const stProgress = Math.min(1, st / goal);
          const isGoalReached = st >= goal;
          const color = isGoalReached ? '#10B981' : '#38BDF8';
          const label =
            st >= 10000
              ? `${(st / 1000).toFixed(1)}k`
              : st >= 1000
              ? `${(st / 1000).toFixed(1)}k`
              : `${st}`;
          return {
            icon: (
              <Footprints
                size={iconSize}
                className={isGoalReached ? 'text-emerald-400' : 'text-sky-400'}
                style={{ color }}
              />
            ),
            label,
            progress: stProgress,
            color,
          };
        }
        case 'weather': {
          const temp = currentSensors.temperature;
          const tempProgress = Math.min(1, Math.max(0.1, (temp + 10) / 55));
          return {
            icon: <CloudSun size={iconSize} className="text-amber-400" />,
            label: `${temp}°`,
            progress: tempProgress,
            color: '#FBBC05',
          };
        }
        case 'calendar':
          return {
            icon: <Calendar size={iconSize} className="text-indigo-400" />,
            label: '14 آب',
            progress: 1,
            color: '#A8C7FA',
          };
        case 'uv': {
          const uv = currentSensors.uvIndex;
          const uvColor =
            uv >= 8 ? '#A855F7' : uv >= 6 ? '#EA580C' : uv >= 3 ? '#EAB308' : '#22C55E';
          return {
            icon: <Sun size={iconSize} style={{ color: uvColor }} />,
            label: `UV ${uv}`,
            progress: Math.min(1, uv / 11),
            color: uvColor,
          };
        }
        case 'sunset':
          return {
            icon: <Sun size={iconSize} className="text-orange-400" />,
            label: '19:42',
            progress: 0.75,
            color: '#FF7043',
          };
        case 'compass':
          return {
            icon: <Compass size={iconSize} className="text-teal-400" />,
            label: 'NW 315°',
            progress: 0.85,
            color: '#80CBC4',
          };
        case 'media':
          return {
            icon: <Music size={iconSize} className="text-violet-400" />,
            label: 'Pixel Sound',
            progress: 0.5,
            color: '#D0BCFF',
          };
        default:
          return {
            icon: <Globe size={iconSize} />,
            label: 'GMT',
            progress: 0.5,
            color: activePrimary,
          };
      }
    };

    const compData = getComplicationContent();

    return (
      <g
        key={`comp-${slot}`}
        transform={`translate(${slotX}, ${slotY})`}
        className={interactive ? 'cursor-pointer group' : ''}
        onClick={(e) => {
          if (interactive && onComplicationClick) {
            e.stopPropagation();
            onComplicationClick(slot, complication.type);
          }
        }}
      >
        {!isAod && (
          <circle
            r={size * 0.09}
            fill="#000000"
            fillOpacity="0.45"
            stroke={watchFace.colors.primary}
            strokeOpacity="0.2"
            strokeWidth="1"
            className="transition-all duration-200 group-hover:stroke-opacity-80 group-hover:fill-opacity-70"
          />
        )}

        {!isAod && compData.progress && (
          <circle
            r={size * 0.088}
            fill="none"
            stroke={compData.color}
            strokeWidth="1.8"
            strokeDasharray={`${2 * Math.PI * size * 0.088 * compData.progress} ${
              2 * Math.PI * size * 0.088
            }`}
            strokeLinecap="round"
            transform="rotate(-90)"
            opacity="0.8"
          />
        )}

        <foreignObject
          x={-size * 0.09}
          y={-size * 0.09}
          width={size * 0.18}
          height={size * 0.18}
        >
          <div className="w-full h-full flex flex-col items-center justify-center text-[10px] leading-tight select-none">
            <div className="scale-90">{compData.icon}</div>
            <span
              className="font-medium tracking-tight mt-0.5 truncate max-w-[90%] text-center text-slate-100"
              style={{ fontSize: `${Math.max(8, size * 0.032)}px` }}
            >
              {compData.label}
            </span>
          </div>
        </foreignObject>
      </g>
    );
  };

  const renderHands = () => {
    if (watchFace.type === 'digital') return null;

    const handStyle = watchFace.hands.style;
    const hourHandLength = radius * 0.52;
    const minuteHandLength = radius * 0.78;
    const secondHandLength = radius * 0.85;

    return (
      <g>
        {/* Hour Hand */}
        <g transform={`rotate(${hourAngle}, ${center}, ${center})`}>
          {handStyle === 'pill' ? (
            <rect
              x={center - size * 0.016}
              y={center - hourHandLength}
              width={size * 0.032}
              height={hourHandLength}
              rx={size * 0.016}
              fill={activeHands}
              filter={!isAod ? 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))' : undefined}
            />
          ) : handStyle === 'arrow' ? (
            <path
              d={`M ${center - size * 0.014} ${center} 
                 L ${center - size * 0.014} ${center - hourHandLength * 0.7} 
                 L ${center - size * 0.024} ${center - hourHandLength * 0.7} 
                 L ${center} ${center - hourHandLength} 
                 L ${center + size * 0.024} ${center - hourHandLength * 0.7} 
                 L ${center + size * 0.014} ${center - hourHandLength * 0.7} 
                 L ${center + size * 0.014} ${center} Z`}
              fill={activeHands}
            />
          ) : (
            <line
              x1={center}
              y1={center}
              x2={center}
              y2={center - hourHandLength}
              stroke={activeHands}
              strokeWidth={size * 0.026}
              strokeLinecap="round"
            />
          )}
        </g>

        {/* Minute Hand */}
        <g transform={`rotate(${minuteAngle}, ${center}, ${center})`}>
          {handStyle === 'pill' ? (
            <rect
              x={center - size * 0.012}
              y={center - minuteHandLength}
              width={size * 0.024}
              height={minuteHandLength}
              rx={size * 0.012}
              fill={activePrimary}
              filter={!isAod ? 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))' : undefined}
            />
          ) : handStyle === 'arrow' ? (
            <path
              d={`M ${center - size * 0.01} ${center} 
                 L ${center - size * 0.01} ${center - minuteHandLength * 0.75} 
                 L ${center - size * 0.02} ${center - minuteHandLength * 0.75} 
                 L ${center} ${center - minuteHandLength} 
                 L ${center + size * 0.02} ${center - minuteHandLength * 0.75} 
                 L ${center + size * 0.01} ${center - minuteHandLength * 0.75} 
                 L ${center + size * 0.01} ${center} Z`}
              fill={activePrimary}
            />
          ) : (
            <line
              x1={center}
              y1={center}
              x2={center}
              y2={center - minuteHandLength}
              stroke={activePrimary}
              strokeWidth={size * 0.018}
              strokeLinecap="round"
            />
          )}
        </g>

        {/* Second Hand */}
        {!isAod && watchFace.hands.showSeconds && (
          <g transform={`rotate(${secondAngle}, ${center}, ${center})`}>
            <line
              x1={center}
              y1={center + radius * 0.18}
              x2={center}
              y2={center - secondHandLength}
              stroke={activeAccent}
              strokeWidth={size * 0.007}
              strokeLinecap="round"
            />
            {watchFace.hands.tailStyle === 'circle' && (
              <circle
                cx={center}
                cy={center + radius * 0.12}
                r={size * 0.015}
                fill={activeAccent}
              />
            )}
          </g>
        )}

        {/* Center Pivot Cap */}
        <circle
          cx={center}
          cy={center}
          r={size * 0.02}
          fill={activeAccent}
          stroke={activeHands}
          strokeWidth="1.5"
        />
      </g>
    );
  };

  const renderDigitalDisplay = () => {
    if (watchFace.type === 'analog') return null;

    const layout = watchFace.digital.layout;
    const isStacked = layout === 'stacked';

    const fontStyleClass =
      watchFace.digital.font === 'mono'
        ? 'font-mono'
        : watchFace.digital.font === 'serif'
        ? 'font-serif'
        : 'font-sans';

    return (
      <foreignObject
        x={0}
        y={isStacked ? center - radius * 0.58 : center - radius * 0.3}
        width={size}
        height={isStacked ? radius * 1.16 : radius * 0.6}
        className="pointer-events-none"
      >
        <div
          className={`w-full h-full flex flex-col items-center justify-center select-none ${fontStyleClass}`}
        >
          {isStacked ? (
            <div className="flex flex-col items-center justify-center leading-[0.88] tracking-tighter">
              <span
                className="font-bold drop-shadow-md"
                style={{
                  fontSize: `${size * 0.23}px`,
                  color: activePrimary,
                }}
              >
                {formattedHours}
              </span>
              <span
                className="font-bold drop-shadow-md"
                style={{
                  fontSize: `${size * 0.23}px`,
                  color: activeSecondary,
                }}
              >
                {formattedMinutes}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1 leading-none">
              <span
                className="font-extrabold tracking-tight"
                style={{
                  fontSize: `${size * 0.19}px`,
                  color: activePrimary,
                }}
              >
                {formattedHours}:{formattedMinutes}
              </span>
              {!isAod && watchFace.digital.showSeconds && (
                <span
                  className="font-medium opacity-80"
                  style={{
                    fontSize: `${size * 0.075}px`,
                    color: activeAccent,
                  }}
                >
                  {formattedSeconds}
                </span>
              )}
            </div>
          )}
        </div>
      </foreignObject>
    );
  };

  return (
    <div
      className="relative rounded-full overflow-hidden shadow-inner select-none transition-colors duration-300"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        ...bgStyle,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-full block"
      >
        {!isAod && (
          <circle
            cx={center}
            cy={center}
            r={radius - 4}
            fill="none"
            stroke={watchFace.colors.primary}
            strokeWidth="1"
            opacity="0.15"
          />
        )}

        {renderDialMarks()}
        {renderComplicationSlot('top')}
        {renderComplicationSlot('bottom')}
        {renderComplicationSlot('left')}
        {renderComplicationSlot('right')}
        {renderComplicationSlot('center')}
        {renderDigitalDisplay()}
        {renderHands()}
      </svg>
    </div>
  );
};
