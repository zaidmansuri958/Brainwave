/** Whisper ASR language (ISO 639-1). Empty = auto-detect from audio. */
export const TRANSCRIPTION_LANGS: { value: string; label: string }[] = [
  { value: "", label: "Auto-detect from audio" },
  { value: "en", label: "English (en)" },
  { value: "hi", label: "Hindi (hi)" },
  { value: "gu", label: "Gujarati (gu)" },
  { value: "ta", label: "Tamil (ta)" },
  { value: "te", label: "Telugu (te)" },
  { value: "mr", label: "Marathi (mr)" },
  { value: "bn", label: "Bengali (bn)" },
  { value: "kn", label: "Kannada (kn)" },
  { value: "ml", label: "Malayalam (ml)" },
  { value: "pa", label: "Punjabi (pa)" },
  { value: "or", label: "Odia (or)" },
  { value: "ur", label: "Urdu (ur)" },
];
