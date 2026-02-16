// // import { useEffect, useRef } from "react";
// // import { useEffect, useRef } from "react";
// import { useCallback, useRef } from "react";

// const API_BASE = import.meta.env.VITE_API_BASE_URL;

// export function useSpeakQuestion(text: string, enabled = true) {
//   const audioRef = useRef<HTMLAudioElement | null>(null);

//   const speak = useCallback(async () => {
//     if (!enabled || !text) return;

//     try {
//       // Stop previous audio if any
//       if (audioRef.current) {
//         audioRef.current.pause();
//         audioRef.current.currentTime = 0;
//       }

//       const formData = new FormData();
//       formData.append("text", text);

//       const res = await fetch(
//         `${API_BASE}/questions/tts/speak`,
//         {
//           method: "POST",
//           body: formData,
//         }
//       );

//       if (!res.ok) {
//         throw new Error("TTS request failed");
//       }

//       const data = await res.json();

//       const audio = new Audio(`${API_BASE}${data.audio_url}`);
//       audioRef.current = audio;

//       audio.play();
//     } catch (err) {
//       console.error("❌ TTS play failed:", err);
//     }
//   }, [text, enabled]);

//   return speak;
// }

// // export function useSpeakQuestion(text: string, enabled = true) {
// //   const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

// //   useEffect(() => {
// //     const loadVoices = () => {
// //       voicesRef.current = window.speechSynthesis.getVoices();
// //     };

// //     loadVoices();
// //     window.speechSynthesis.onvoiceschanged = loadVoices;
// //   }, []);

// //   const speak = () => {
// //     if (!enabled || !text) return;

// //     window.speechSynthesis.cancel();

// //     const utterance = new SpeechSynthesisUtterance(text);
// //     const voices = voicesRef.current;

// //     // 🇮🇳 STRICT Indian voice priority
// //     const indianVoice =
// //       voices.find(v => v.lang === "en-IN") ||
// //       voices.find(v => /india|hindi/i.test(v.name)) ||
// //       voices.find(v => v.lang === "hi-IN") ||
// //       voices.find(v => v.lang.startsWith("en"));

// //     if (indianVoice) {
// //       utterance.voice = indianVoice;
// //       utterance.lang = indianVoice.lang;
// //     }

// //     // Indian accent tuning
// //     utterance.rate = 0.9;   // slower = Indian clarity
// //     utterance.pitch = 0.95;
// //     utterance.volume = 1;

// //     window.speechSynthesis.speak(utterance);
// //   };

// //   useEffect(() => {
// //     speak();
// //     return () => window.speechSynthesis.cancel();
// //   }, [text, enabled]);
// //   speechSynthesis.getVoices().forEach(v => {
// //     console.log(v.name, v.lang);
// //   });
  
// //   return speak;
// // }


// // export function useSpeakQuestion(
// //   text: string,
// //   enabled: boolean = true,
// // ) {
// //   const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

// //   // 🔊 Load voices safely
// //   useEffect(() => {
// //     const loadVoices = () => {
// //       voicesRef.current = window.speechSynthesis.getVoices();
// //     };

// //     loadVoices();
// //     window.speechSynthesis.onvoiceschanged = loadVoices;
// //   }, []);

// //   const speak = () => {
// //     if (!enabled || !text) return;

// //     window.speechSynthesis.cancel();

// //     const utterance = new SpeechSynthesisUtterance(text);
// //     const voices = voicesRef.current;

// //     // 🇮🇳 Indian accent priority
// //     const selectedVoice =
// //       voices.find(
// //         (v) =>
// //           v.lang === "en-IN" &&
// //           /india|rishi|google/i.test(v.name),
// //       ) ||
// //       voices.find((v) => v.lang === "en-IN") ||
// //       voices.find((v) => v.lang === "en-US") ||
// //       voices.find((v) => v.lang.startsWith("en")) ||
// //       voices[0];

// //     if (selectedVoice) {
// //       utterance.voice = selectedVoice;
// //       utterance.lang = selectedVoice.lang;
// //     }

// //     utterance.rate = 0.95;
// //     utterance.pitch = 1;
// //     utterance.volume = 1;

// //     window.speechSynthesis.speak(utterance);
// //   };

// //   // 🔁 Auto play when question changes
// //   useEffect(() => {
// //     speak();
// //     return () => window.speechSynthesis.cancel();
// //   }, [text, enabled]);

// //   // ✅ IMPORTANT
// //   return speak;
// // }

// // // export function useSpeakQuestion(
// // //   text: string,
// // //   enabled: boolean = true,
// // // ) {
// // //   const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

// // //   // Load voices safely
// // //   useEffect(() => {
// // //     const loadVoices = () => {
// // //       voicesRef.current = window.speechSynthesis.getVoices();
// // //     };

// // //     loadVoices();
// // //     window.speechSynthesis.onvoiceschanged = loadVoices;
// // //   }, []);

// // //   useEffect(() => {
// // //     if (!enabled || !text) return;

// // //     window.speechSynthesis.cancel();

// // //     const utterance = new SpeechSynthesisUtterance(text);

// // //     const voices = voicesRef.current;

// // //     // 🎯 HARD-CODED VOICE PRIORITY (Indian Accent)
// // //     const selectedVoice =
// // //       voices.find(
// // //         (v) =>
// // //           v.lang === "en-IN" &&
// // //           /india|rishi|google/i.test(v.name),
// // //       ) ||
// // //       voices.find((v) => v.lang === "en-IN") ||
// // //       voices.find((v) => v.lang === "en-US") ||
// // //       voices.find((v) => v.lang.startsWith("en")) ||
// // //       voices[0];

// // //     if (selectedVoice) {
// // //       utterance.voice = selectedVoice;
// // //       utterance.lang = "en-US"; // 🔒 FORCE LANGUAGE
// // //     }

// // //     utterance.rate = 0.95;   // slightly slower = clearer
// // //     utterance.pitch = 1;
// // //     utterance.volume = 1;

// // //     window.speechSynthesis.speak(utterance);

// // //     return () => window.speechSynthesis.cancel();
// // //   }, [text, enabled]);
// // // }
import { useCallback, useRef } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export function useSpeakQuestion(text: string, enabled = true) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback(async () => {
    if (!enabled || !text) return;

    try {
      // Stop previous audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      const formData = new FormData();
      formData.append("text", text);

      const res = await fetch(
        `${API_BASE}/questions/tts/speak`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        throw new Error("TTS request failed");
      }

      const data = await res.json();

      // 🔥 IMPORTANT FIX
      const audio = new Audio(data.audio_url);

      audioRef.current = audio;
      await audio.play();
    } catch (err) {
      console.error("❌ TTS play failed:", err);
    }
  }, [text, enabled]);

  return speak;
}
