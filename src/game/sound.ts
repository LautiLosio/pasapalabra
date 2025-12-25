export const playSound = (type: 'correct' | 'incorrect' | 'pasapalabra' | 'win'): void => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'correct') {
      // Sonido "Ding" (Onda sinusoidal aguda)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(1000, now + 0.1);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === 'incorrect') {
      // Sonido "Error" (Onda de sierra grave)
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.3);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'pasapalabra') {
      // Sonido "Whoosh" (Transición rápida)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.linearRampToValueAtTime(500, now + 0.15);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'win') {
      // Pequeña fanfarria simple
      const playNote = (freq: number, time: number, duration: number) => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq, time);
        gain2.gain.setValueAtTime(0.2, time);
        gain2.gain.exponentialRampToValueAtTime(0.001, time + duration);
        osc2.start(time);
        osc2.stop(time + duration);
      };
      playNote(523.25, now, 0.4); // Do
      playNote(659.25, now + 0.2, 0.4); // Mi
      playNote(783.99, now + 0.4, 0.8); // Sol
    }
  } catch (e) {
    console.error("Error al reproducir sonido", e);
  }
};

