// Pixel Watch Web Audio Engine
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function beep(freq: number, duration: number, type: OscillatorType = 'sine', vol = 0.08) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // fallback
  }
}

export function playCrownTickSound() {
  beep(1200, 0.02, 'sine', 0.05);
}

export function playClickSound() {
  beep(650, 0.03, 'triangle', 0.06);
}

export function playSyncSuccessChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      setTimeout(() => beep(freq, 0.25, 'sine', 0.1), idx * 75);
    });
  } catch {
    // fallback
  }
}

export function playNotificationSound() {
  beep(880, 0.15, 'sine', 0.08);
}

export function playAodToggleSound(isAod: boolean) {
  beep(isAod ? 300 : 700, 0.06, 'sine', 0.05);
}

export function playHeartbeatSound() {
  beep(80, 0.06, 'sine', 0.12);
}

export function playSensorSlideSound() {
  beep(950, 0.02, 'sine', 0.03);
}
