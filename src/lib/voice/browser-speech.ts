/** Web Speech API constructors (Chrome / Edge; Safari partial). */

type RecognitionCtor = new () => SpeechRecognitionAlt;

export type SpeechRecognitionAlt = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((ev: SpeechRecognitionEventAlt) => void) | null;
  onerror: ((ev: SpeechRecognitionErrorAlt) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionEventAlt = {
  resultIndex: number;
  results: { length: number; [index: number]: { 0: { transcript: string } } };
};

type SpeechRecognitionErrorAlt = { error: string };

function getWin(): Window & {
  SpeechRecognition?: RecognitionCtor;
  webkitSpeechRecognition?: RecognitionCtor;
} {
  return window as Window & {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  const w = getWin();
  return Boolean(w.SpeechRecognition ?? w.webkitSpeechRecognition);
}

export function createSpeechRecognition(): SpeechRecognitionAlt | null {
  if (typeof window === "undefined") return null;
  const w = getWin();
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!Ctor) return null;
  return new Ctor();
}
