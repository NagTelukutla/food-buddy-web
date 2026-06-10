import { useEffect, useRef } from 'react';

export default function useDriverVoiceNavigation(navigationState, enabled = false) {
  const lastSpokenRef = useRef('');
  const speakingRef = useRef(false);

  useEffect(() => {
    if (!enabled || !navigationState?.voiceText) return undefined;
    if (typeof window === 'undefined' || !window.speechSynthesis) return undefined;
    if (navigationState.voiceKey === lastSpokenRef.current) return undefined;
    if (speakingRef.current) return undefined;

    const utterance = new SpeechSynthesisUtterance(navigationState.voiceText);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    speakingRef.current = true;
    utterance.onend = () => {
      speakingRef.current = false;
    };
    utterance.onerror = () => {
      speakingRef.current = false;
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    lastSpokenRef.current = navigationState.voiceKey;

    return () => {
      window.speechSynthesis.cancel();
      speakingRef.current = false;
    };
  }, [enabled, navigationState?.voiceKey, navigationState?.voiceText]);

  useEffect(() => {
    if (enabled) return undefined;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    lastSpokenRef.current = '';
    return undefined;
  }, [enabled]);
}
