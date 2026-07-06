// @ts-nocheck
import { useState, useEffect, useCallback, useRef } from 'react';

export type Msg = {
  id: string;
  text: string;
  role: 'user' | 'assistant';
  isStreaming?: boolean;
};

export function useElectronChat(aiActive: boolean = false) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const audioContext = useRef<AudioContext | null>(null);
  const nextStartTime = useRef<number>(0);
  const pendingAssistantText = useRef<string>('');
  const speechSpeakingRef = useRef(false);

  const speakAssistantText = useCallback((text: string) => {
    if (!text?.trim()) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.onstart = () => { speechSpeakingRef.current = true; };
    utterance.onend = () => { speechSpeakingRef.current = false; };
    utterance.onerror = () => { speechSpeakingRef.current = false; };
    window.speechSynthesis.speak(utterance);
  }, []);
  
  // Start listening to stream as soon as the hook mounts
  useEffect(() => {
    if ((window as any).electronAPI && (window as any).electronAPI.onChatStream) {
      (window as any).electronAPI.onChatStream((chunk: string) => {
        if (chunk === '[DONE]') {
          const finalText = pendingAssistantText.current.trim();
          pendingAssistantText.current = '';

          setMsgs(prev => {
            const last = prev[prev.length - 1];
            if (last && last.role === 'assistant' && last.isStreaming) {
              return [...prev.slice(0, -1), { ...last, isStreaming: false }];
            }
            return prev;
          });

          if (finalText && aiActive) {
            speakAssistantText(finalText);
          }
          return;
        }

        pendingAssistantText.current += chunk;
        setMsgs(prev => {
          const last = prev[prev.length - 1];
          if (last && last.role === 'assistant' && last.isStreaming) {
            return [...prev.slice(0, -1), { ...last, text: last.text + chunk }];
          } else {
            // New assistant response started
            return [...prev, { id: Date.now().toString(), text: chunk, role: 'assistant', isStreaming: true }];
          }
        });
      });
    }

    if ((window as any).electronAPI && (window as any).electronAPI.onChatAudioStream) {
      (window as any).electronAPI.onChatAudioStream(async (data: { audioBase64: string, mimeType: string }) => {
        if (!aiActive) return;
        
        if (!audioContext.current) {
          audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioContext.current.state === 'suspended') {
          audioContext.current.resume();
        }

        // Decode base64 to array buffer
        const binaryString = atob(data.audioBase64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        try {
          // Decode audio data
          const audioBuffer = await audioContext.current.decodeAudioData(bytes.buffer);
          
          // Play the audio buffer
          const source = audioContext.current.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioContext.current.destination);
          
          // Schedule playback
          const currentTime = audioContext.current.currentTime;
          if (nextStartTime.current < currentTime) {
            nextStartTime.current = currentTime;
          }
          
          source.start(nextStartTime.current);
          nextStartTime.current += audioBuffer.duration;
          
        } catch (err) {
          console.error("Failed to decode Gemini audio chunk:", err);
        }
      });
    }
  }, [aiActive]);

  const send = useCallback(async (text: string) => {
    if (!text.trim()) return;

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    pendingAssistantText.current = '';

    // First finalize any ongoing stream
    setMsgs(prev => {
      const last = prev[prev.length - 1];
      if (last && last.isStreaming) {
        return [...prev.slice(0, -1), { ...last, isStreaming: false }];
      }
      return prev;
    });

    // Add user message
    setMsgs(prev => [...prev, { id: Date.now().toString(), text, role: 'user' }]);

    // Invoke backend to start streaming
    if ((window as any).electronAPI && (window as any).electronAPI.chatSend) {
      await (window as any).electronAPI.chatSend(text);
    }
  }, []);

  // Monitor when the backend finishes a stream (to trigger TTS)
  // Actually, we need to mark isStreaming = false when the stream ends.
  // We can do this by having the backend send a special "[DONE]" token.
  return { msgs, send, connected: true, listening: false };
}
