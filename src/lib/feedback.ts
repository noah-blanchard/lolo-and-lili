/**
 * Tiny sound + haptic feedback for pet interactions. All calls are safe no-ops
 * when unavailable (SSR, missing audio files, no Vibration API, or muted).
 * Audio needs a prior user gesture to play — which pet taps always are.
 * Mute is per-session (module-level) to stay SSR/hydration-safe.
 */
const audioCache: Record<string, HTMLAudioElement> = {};
let muted = false;

export function isMuted(): boolean {
  return muted;
}

export function setMuted(next: boolean): void {
  muted = next;
}

export function playSound(name: string): void {
  if (typeof window === "undefined" || muted) return;
  try {
    let audio = audioCache[name];
    if (!audio) {
      audio = new Audio(`/sounds/${name}.mp3`);
      audio.volume = 0.5;
      audioCache[name] = audio;
    }
    audio.currentTime = 0;
    void audio.play().catch(() => {});
  } catch {
    // ignore — asset missing or autoplay blocked
  }
}

export function vibrate(pattern: number | number[]): void {
  if (typeof navigator === "undefined" || muted) return;
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // ignore — unsupported
  }
}
