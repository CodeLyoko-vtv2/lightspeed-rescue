import { useCallback, useEffect, useRef } from "react";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";

export const EMERGENCY_KEYWORDS = [
  "c\u1ee9u",
  "gi\u00fap",
  "ch\u00e1y",
  "sos",
  "c\u1ee9u v\u1edbi",
];

const RESTART_DELAY_MS = 500;

type UseEmergencyWakeWordOptions = {
  enabled: boolean;
  onWakeWordDetected: (keyword: string, transcript: string) => void;
};

const normalizeSpeechText = (value: string) =>
  String(value || "")
    .toLocaleLowerCase("vi-VN")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const NORMALIZED_KEYWORDS = EMERGENCY_KEYWORDS.map((keyword) => ({
  keyword,
  normalized: normalizeSpeechText(keyword),
}));

const findEmergencyKeyword = (transcript: string) => {
  const normalized = normalizeSpeechText(transcript);
  if (!normalized) return null;

  return NORMALIZED_KEYWORDS.find(({ normalized: keyword }) =>
    normalized.includes(keyword),
  )?.keyword ?? null;
};

const stopSpeechSafely = () => {
  try {
    ExpoSpeechRecognitionModule.abort();
  } catch {
    // Ignore when recognizer is already stopped.
  }
};

export function useEmergencyWakeWord({
  enabled,
  onWakeWordDetected,
}: UseEmergencyWakeWordOptions) {
  const enabledRef = useRef(enabled);
  const onWakeWordDetectedRef = useRef(onWakeWordDetected);
  const isListeningRef = useRef(false);
  const isStartingRef = useRef(false);
  const hasTriggeredRef = useRef(false);
  const voiceUnavailableRef = useRef(false);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startListeningRef = useRef<() => void>(() => {});

  useEffect(() => {
    enabledRef.current = enabled;
    if (enabled) {
      hasTriggeredRef.current = false;
    }
  }, [enabled]);

  useEffect(() => {
    onWakeWordDetectedRef.current = onWakeWordDetected;
  }, [onWakeWordDetected]);

  const clearRestartTimer = useCallback(() => {
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
  }, []);

  const stopListening = useCallback(async () => {
    clearRestartTimer();
    isStartingRef.current = false;
    isListeningRef.current = false;
    stopSpeechSafely();
  }, [clearRestartTimer]);

  const scheduleRestart = useCallback(() => {
    if (
      !enabledRef.current ||
      hasTriggeredRef.current ||
      voiceUnavailableRef.current
    ) {
      return;
    }

    clearRestartTimer();
    restartTimerRef.current = setTimeout(() => {
      startListeningRef.current();
    }, RESTART_DELAY_MS);
  }, [clearRestartTimer]);

  const startListening = useCallback(async () => {
    if (
      !enabledRef.current ||
      hasTriggeredRef.current ||
      voiceUnavailableRef.current ||
      isListeningRef.current ||
      isStartingRef.current
    ) {
      return;
    }

    try {
      clearRestartTimer();
      isStartingRef.current = true;

      const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!permission.granted) {
        voiceUnavailableRef.current = true;
        isListeningRef.current = false;
        return;
      }

      if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
        voiceUnavailableRef.current = true;
        isListeningRef.current = false;
        return;
      }

      ExpoSpeechRecognitionModule.start({
        lang: "vi-VN",
        interimResults: true,
        continuous: false,
        contextualStrings: EMERGENCY_KEYWORDS,
      });

      isListeningRef.current = true;
    } catch (error) {
      console.warn("Khong the khoi dong nhan dien giong noi SOS:", error);
      isListeningRef.current = false;
      scheduleRestart();
    } finally {
      isStartingRef.current = false;
    }
  }, [clearRestartTimer, scheduleRestart]);

  useEffect(() => {
    startListeningRef.current = () => {
      void startListening();
    };
  }, [startListening]);

  const handleTranscript = useCallback(
    (transcript: string) => {
      const keyword = findEmergencyKeyword(transcript);
      if (!keyword || hasTriggeredRef.current || !enabledRef.current) return;

      hasTriggeredRef.current = true;
      enabledRef.current = false;
      clearRestartTimer();
      void stopListening();
      onWakeWordDetectedRef.current(keyword, transcript);
    },
    [clearRestartTimer, stopListening],
  );

  useSpeechRecognitionEvent("start", () => {
    isListeningRef.current = true;
  });

  useSpeechRecognitionEvent("end", () => {
    isListeningRef.current = false;
    isStartingRef.current = false;
    scheduleRestart();
  });

  useSpeechRecognitionEvent("error", (event) => {
    isListeningRef.current = false;
    isStartingRef.current = false;

    if (event?.error === "not-allowed" || event?.error === "service-not-allowed") {
      voiceUnavailableRef.current = true;
      return;
    }

    scheduleRestart();
  });

  useSpeechRecognitionEvent("result", (event) => {
    const transcript =
      event?.results?.map((result) => result?.transcript || "").join(" ") || "";
    handleTranscript(transcript);
  });

  const destroy = useCallback(async () => {
    await stopListening();
    hasTriggeredRef.current = false;
  }, [stopListening]);

  useEffect(() => {
    if (enabled) {
      void startListening();
      return;
    }

    void stopListening();
  }, [enabled, startListening, stopListening]);

  useEffect(
    () => () => {
      void destroy();
    },
    [destroy],
  );

  return {
    startListening,
    stopListening,
    destroy,
  };
}
