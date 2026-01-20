import { useEffect, useRef } from "react";

export function useSpeakQuestion(
  text: string,
  enabled: boolean = true,
) {
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  // Load voices safely
  useEffect(() => {
    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  useEffect(() => {
    if (!enabled || !text) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    const voices = voicesRef.current;

    // 🎯 HARD-CODED VOICE PRIORITY (Indian Accent)
    const selectedVoice =
      voices.find(
        (v) =>
          v.lang === "en-IN" &&
          /india|rishi|google/i.test(v.name),
      ) ||
      voices.find((v) => v.lang === "en-IN") ||
      voices.find((v) => v.lang === "en-US") ||
      voices.find((v) => v.lang.startsWith("en")) ||
      voices[0];

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = "en-US"; // 🔒 FORCE LANGUAGE
    }

    utterance.rate = 0.95;   // slightly slower = clearer
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);

    return () => window.speechSynthesis.cancel();
  }, [text, enabled]);
}
