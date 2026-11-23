"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Send, Volume2, VolumeX } from "lucide-react";

interface DialoguePair {
  question: string;
  answer: string;
}

interface ChatComponentProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  conversation: DialoguePair[]; // Context tracker to handle automated TTS reads
}

// 🚀 FIXED: Custom structural types to safely match native browser multi-layer sound speech results
interface SpeechRecognitionResultWrapper {
  [key: number]: {
    [key: number]: {
      transcript: string;
    };
  };
}

interface SpeechRecognitionEventWrapper {
  results: SpeechRecognitionResultWrapper;
}

// 🚀 FIXED: Standardized constructor type signature to wipe out all implicit or unsafe 'any' keyword assignments completely!
type SpeechRecognitionConstructor = new () => {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: (event: SpeechRecognitionEventWrapper) => void;
  onend: () => void;
  onerror: (err: unknown) => void;
  start: () => void;
};

export default function ChatComponent({
  onSendMessage,
  isLoading,
  conversation,
}: ChatComponentProps) {
  // 1. Centralized Interactive State Registries
  const [inputValue, setInputValue] = useState<string>("");
  const [isVoiceMode, setIsVoiceMode] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);

  // Anti-Duplicate Safe Guard: Prevents native browser speech engines from repeating audio frames under React 19 strict metrics
  const lastSpokenAnswerRef = useRef<string>("");

  // FIXED: The Functional State-Lock Ref! Captures the latest microphone pointer to completely resolve Temporal Dead Zone exceptions.
  const micActionRef = useRef<() => void>(() => {});

  // 🚀 2. THE NATIVE SPEECH CONTEXT HANDSHAKE: Automatic Text-to-Speech (TTS) readouts via browser engine
  useEffect(() => {
    if (
      !isVoiceMode ||
      isLoading ||
      typeof window === "undefined" ||
      conversation.length === 0
    )
      return;

    const latestChatPair = conversation[conversation.length - 1];
    const latestAnswer = latestChatPair.answer || "";

    // Trigger native synthesis ONLY when the server stream chunk settles completely
    if (
      latestAnswer &&
      latestAnswer !== lastSpokenAnswerRef.current &&
      !latestAnswer.startsWith("Communication Disrupted")
    ) {
      lastSpokenAnswerRef.current = latestAnswer;

      const synthesizer = window.speechSynthesis;
      if (synthesizer.speaking) synthesizer.cancel(); // Terminate lingering active sound bytes

      // Construct native speech matrix packet
      const utterance = new SpeechSynthesisUtterance(latestAnswer);
      utterance.lang = "en-US";
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // MULTI-ROUND VOICE LOOP LINK: Calls the Ref dynamic state lock safely without hoisting bugs!
      utterance.onend = () => {
        console.log("Native browser TTS playback complete.");
        setTimeout(() => {
          if (micActionRef.current) micActionRef.current();
        }, 100);
      };

      synthesizer.speak(utterance);
    }
  }, [isLoading, conversation, isVoiceMode]);

  // 🚀 3. NATIVE SPEECH RECOGNITION (STT): Core Functional Payload Core
  const handleMicrophoneAction = (): void => {
    if (typeof window === "undefined") return;

    // 🚀 FIXED: Decoupled and securely casted using standard browser abstraction contracts without triggering unsafe assignment lints
    const globalContext = window as unknown as Record<
      string,
      SpeechRecognitionConstructor
    >;
    const SpeechRecognition =
      globalContext.SpeechRecognition || globalContext.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Browser Warning: Web Speech API is missing or disabled on this machine profile.",
      );
      return;
    }

    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);

      if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();

      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      // Fully typesafe callback interceptor eliminating any implicit signatures
      recognition.onresult = (event: SpeechRecognitionEventWrapper) => {
        const voiceTranscript = event.results[0]?.[0]?.transcript || "";
        if (voiceTranscript.trim()) {
          onSendMessage(voiceTranscript.trim());
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onerror = (err: unknown) => {
        console.error("Vocal boundary capture exception:", err);
        setIsRecording(false);
      };

      recognition.start();
    }
  };

  // Continuously syncs the current action pointer into our secure top-level Ref lock boundary
  useEffect(() => {
    micActionRef.current = handleMicrophoneAction;
  }, [isRecording, onSendMessage]);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    onSendMessage(inputValue.trim());
    setInputValue("");
  };

  const handleVoiceToggleClick = (): void => {
    if (!isVoiceMode) {
      setIsVoiceMode(true);
      alert(
        "Vocal Interface Armed! Click the microphone to communicate with your AI Knowledge Agent hands-free. 🎙️",
      );
    } else {
      setIsVoiceMode(false);
      setIsRecording(false);
      lastSpokenAnswerRef.current = "";
      if (typeof window !== "undefined") window.speechSynthesis.cancel(); // Mute background audio
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 select-none">
      {/* 🚀 INTEGRATED CAPSULE CORE: Fluid capsule shape dock transforming smoothly based on user status */}
      <div
        className={`w-full rounded-full border p-2 transition-all duration-500 backdrop-blur-xl flex items-center gap-3 bg-[#18181b]/60 ${
          isRecording
            ? "border-purple-500/60 shadow-[0_0_25px_rgba(168,85,247,0.25)] ring-2 ring-purple-500/20"
            : "border-zinc-800/80 focus-within:border-zinc-700"
        }`}
      >
        {/* Mode Toggle Capsule Action Trigger Component */}
        <button
          type="button"
          onClick={handleVoiceToggleClick}
          className={`h-9 px-3.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer shrink-0 ${
            isVoiceMode
              ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
              : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
          }`}
        >
          {isVoiceMode ? "Voice Mode: On" : "Text Mode"}
        </button>

        {/* Dynamic Display Render Swapper Matrix */}
        {!isVoiceMode ? (
          /* A. STANDARD HIGH-END TEXT INPUT FORM PANEL */
          <form
            onSubmit={handleSubmit}
            className="flex-1 flex items-center gap-2 animate-in fade-in duration-300 min-w-0"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              placeholder="Ask anything about the armed knowledge documents..."
              className="flex-1 bg-transparent text-xs font-medium text-zinc-100 placeholder-zinc-500 focus:outline-none disabled:opacity-40 min-w-0"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center transition-all duration-150 active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        ) : (
          /* B. SIRI-STYLE PULSING VOCAL INTERACTION CONTROL CAPSULE BAR */
          <div className="flex-1 flex items-center justify-between animate-in fade-in zoom-in-95 duration-300 pr-2 min-w-0">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* 🚀 NEON WAVEFORM呼吸灯: Tailwind animate pulse rings simulate fluid waveforms */}
              <div className="relative flex items-center justify-center shrink-0">
                {isRecording && (
                  <>
                    <span className="absolute inline-flex h-6 w-6 rounded-full bg-purple-500/40 opacity-75 animate-ping" />
                    <span className="absolute inline-flex h-8 w-8 rounded-full bg-purple-500/20 opacity-50 animate-pulse" />
                  </>
                )}
                <button
                  type="button"
                  onClick={handleMicrophoneAction}
                  className={`h-8 w-8 rounded-full flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer shadow-md z-10 ${
                    isRecording
                      ? "bg-rose-500 text-white shadow-rose-500/20"
                      : "bg-purple-600 text-white shadow-purple-600/20 hover:bg-purple-500"
                  }`}
                >
                  {isRecording ? (
                    <MicOff className="h-3.5 w-3.5" />
                  ) : (
                    <Mic className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              <p
                className={`text-xs font-bold truncate ${isRecording ? "text-purple-400 animate-pulse" : "text-zinc-500"} min-w-0`}
              >
                {isRecording
                  ? "Listening closely... Speak your query clear."
                  : "Click microphone button to address AI agent."}
              </p>
            </div>

            {/* Passive TTS Status Indicator Badge Icon */}
            <div className="h-6 px-2 rounded-md bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-500 flex items-center gap-1 shrink-0">
              {isLoading ? (
                <>
                  <Volume2 className="h-3 w-3 text-purple-400 animate-bounce" />
                  <span className="text-purple-400 font-extrabold uppercase">
                    Streaming...
                  </span>
                </>
              ) : (
                <>
                  <VolumeX className="h-3 w-3" />
                  <span>IDLE</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
