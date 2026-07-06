import { useState, useEffect, useCallback, useRef } from 'react';

export type Msg = {
  id: string;
  text: string;
  role: 'user' | 'assistant';
  reasoning?: string;
  status?: string;
  isStreaming?: boolean;
};

export function useHermes() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [connected, setConnected] = useState(false); 
  const [listening, setListening] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const msgIdCounter = useRef(0);

  useEffect(() => {
    // Connect to Hermes Bridge (Stonic AI Architecture)
    const ws = new WebSocket('ws://localhost:18789');
    
    ws.onopen = () => {
      // Gateway protocol handshake
      ws.send(JSON.stringify({ type: 'req', id: 'init', method: 'connect', params: {} }));
    };

    ws.onmessage = (event) => {
      try {
        const frame = JSON.parse(event.data);
        
        if (frame.type === 'res' && frame.id === 'init' && frame.ok) {
          setConnected(true);
        } else if (frame.type === 'event' && frame.event === 'agent') {
          const { stream, data } = frame.payload;
          
          if (stream === 'assistant' && data.delta) {
            setMsgs(prev => {
              const last = prev[prev.length - 1];
              if (last && last.role === 'assistant' && last.isStreaming) {
                return [...prev.slice(0, -1), { ...last, text: last.text + data.delta }];
              } else {
                return [...prev, { id: Date.now().toString(), text: data.delta, role: 'assistant', isStreaming: true }];
              }
            });
          } else if (stream === 'lifecycle' && data.phase === 'end') {
            setMsgs(prev => {
              const last = prev[prev.length - 1];
              if (last && last.role === 'assistant' && last.isStreaming) {
                return [...prev.slice(0, -1), { ...last, isStreaming: false }];
              }
              return prev;
            });
          } else if (stream === 'reasoning') {
             // UI could handle reasoning bubbles here if needed
          }
        } else if (frame.type === 'event' && frame.event === 'chat') {
           const { state, message } = frame.payload;
           if (state === 'final') {
             setMsgs(prev => {
                const last = prev[prev.length - 1];
                if (last && last.role === 'assistant' && last.isStreaming) {
                  return [...prev.slice(0, -1), { ...last, isStreaming: false }];
                }
                // If we didn't get any deltas, inject the final message
                if (!last || last.role !== 'assistant') {
                  return [...prev, { id: Date.now().toString(), text: message.content[0].text, role: 'assistant', isStreaming: false }];
                }
                return prev;
             });
           }
        }
      } catch (err) {
        console.error('WebSocket parse error:', err);
      }
    };

    ws.onclose = () => {
      setConnected(false);
    };
    
    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, []);

  const send = useCallback(async (text: string) => {
    if (!text.trim()) return;
    
    // Finalize previous streams if any
    setMsgs(prev => {
      const last = prev[prev.length - 1];
      if (last && last.role === 'assistant' && last.isStreaming) {
        return [...prev.slice(0, -1), { ...last, isStreaming: false }];
      }
      return prev;
    });

    // Add user message to UI
    setMsgs(prev => [...prev, { id: Date.now().toString(), text: text.trim(), role: 'user' }]);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'req',
        id: `msg-${++msgIdCounter.current}`,
        method: 'chat.send',
        params: { 
          message: text.trim(),
          api_key: localStorage.getItem('digi_api_key') || '',
          provider: localStorage.getItem('digi_provider') || 'gemini',
          model: localStorage.getItem('digi_model') || 'gemini-2.0-flash'
        }
      }));
    } else {
      setTimeout(() => {
        setMsgs(prev => [...prev, { 
          id: Date.now().toString(), 
          text: "DIGI Backend is offline. Connecting...", 
          role: 'assistant',
          isStreaming: false
        }]);
      }, 500);
    }
  }, []);

  return { msgs, send, listening, connected };
}
