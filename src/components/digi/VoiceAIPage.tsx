// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, PhoneOff, Phone, Volume2, Loader2, LogIn } from "lucide-react";

// ─── Orb Animation ─────────────────────────────────────────────────────────────
function LiveOrb({ state, aiSpeaking }: { state: "idle" | "connecting" | "connected" | "error"; aiSpeaking: boolean }) {
  const color =
    state === "connected"
      ? aiSpeaking
        ? "#A855F7"
        : "#2FE0C8"
      : state === "connecting"
      ? "#F59E0B"
      : state === "error"
      ? "#EF4444"
      : "#4A5066";

  const glow =
    state === "connected"
      ? aiSpeaking
        ? "rgba(168,85,247,0.6)"
        : "rgba(47,224,200,0.5)"
      : state === "connecting"
      ? "rgba(245,158,11,0.4)"
      : "rgba(0,0,0,0)";

  return (
    <div
      style={{
        width: 120,
        height: 120,
        borderRadius: "50%",
        background: `radial-gradient(circle at 38% 35%, ${color}33, ${color}11 60%, transparent 80%)`,
        border: `2px solid ${color}55`,
        boxShadow: `0 0 40px ${glow}, 0 0 80px ${glow}55, inset 0 0 30px ${color}11`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        animation:
          state === "connected"
            ? aiSpeaking
              ? "orbPulseAI 0.8s ease-in-out infinite alternate"
              : "orbBreathe 3s ease-in-out infinite"
            : state === "connecting"
            ? "orbSpin 2s linear infinite"
            : "none",
        transition: "box-shadow 0.4s ease, border-color 0.4s ease",
      }}
    >
      {state === "connecting" ? (
        <Loader2 size={32} style={{ color, animation: "spin 1.2s linear infinite" }} />
      ) : state === "connected" ? (
        <Volume2 size={32} style={{ color, opacity: aiSpeaking ? 1 : 0.6 }} />
      ) : state === "error" ? (
        <Volume2 size={32} style={{ color }} />
      ) : (
        <Mic size={32} style={{ color }} />
      )}

      {/* Outer ring */}
      {state === "connected" && (
        <div
          style={{
            position: "absolute",
            inset: -10,
            borderRadius: "50%",
            border: `1px solid ${color}33`,
            animation: "orbRingExpand 2s ease-out infinite",
          }}
        />
      )}

      <style>{`
        @keyframes orbBreathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes orbPulseAI {
          0% { transform: scale(1); }
          100% { transform: scale(1.12); }
        }
        @keyframes orbSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes orbRingExpand {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ─── Main VoiceAIPage Component ────────────────────────────────────────────────
export function VoiceAIPage() {
  const [callState, setCallState] = useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [statusText, setStatusText] = useState("Press Call to start talking with DIGI AI");
  const [callDuration, setCallDuration] = useState(0);

  const callStartRef = useRef<number>(0);
  const durationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Call duration timer
  useEffect(() => {
    if (callState === "connected") {
      callStartRef.current = Date.now();
      durationTimerRef.current = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - callStartRef.current) / 1000));
      }, 1000);
    } else {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
      setCallDuration(0);
    }
    return () => {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    };
  }, [callState]);

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const handleCallButton = async () => {
    const api = (window as any).electronAPI;
    if (!api) return;

    if (callState === "idle" || callState === "error") {
      setCallState("connecting");
      setStatusText("Connecting to Gemini Live Backend...");
      try {
        // Start hidden browser
        await api.startGeminiVoiceAssistant();
        
        // Trigger Live Call click
        const result = await api.triggerGeminiLiveCall(true);
        if (result?.success) {
          setCallState("connected");
          setStatusText("Connected — Start speaking!");
        } else {
          setCallState("error");
          setStatusText(result?.error || "Failed to start call. Ensure you are logged in.");
        }
      } catch (err: any) {
        setCallState("error");
        setStatusText(err.message || "Failed to start session.");
      }
    } else {
      // Stop call
      try {
        await api.triggerGeminiLiveCall(false); // click stop
        await api.stopGeminiVoiceAssistant();
      } catch (e) {}
      setCallState("idle");
      setStatusText("Press Call to start talking with DIGI AI");
    }
  };

  const toggleMute = async () => {
    setIsMuted(!isMuted);
    const api = (window as any).electronAPI;
    if (api?.toggleGeminiMic) {
      await api.toggleGeminiMic(!isMuted);
    }
  };

  const handleLogin = async () => {
    const api = (window as any).electronAPI;
    if (api?.openGeminiLoginWindow) {
      setStatusText("Opening login window...");
      await api.openGeminiLoginWindow();
      setStatusText("Login window closed. Try calling now.");
    }
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #08090C 0%, #0D0A14 50%, #08090C 100%)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            callState === "connected"
              ? `radial-gradient(ellipse at 50% 40%, rgba(168,85,247,0.08) 0%, transparent 60%)`
              : `radial-gradient(ellipse at 50% 40%, rgba(47,224,200,0.05) 0%, transparent 60%)`,
          transition: "background 1s ease",
        }}
      />

      {/* Header */}
      <div
        style={{
          height: 44,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          borderBottom: "1px solid #1A1D24",
          background: "rgba(10,12,18,0.6)",
          flexShrink: 0,
          zIndex: 1,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Volume2 size={14} style={{ color: "#A855F7" }} />
          <span
            style={{
              fontSize: 11.5,
              fontFamily: "'JetBrains Mono', monospace",
              color: "#9AA0AC",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Voice AI — Native Call
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {callState === "connected" && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: 20,
                padding: "3px 10px",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#EF4444",
                  boxShadow: "0 0 6px rgba(239,68,68,0.8)",
                  animation: "blink 1s ease-in-out infinite",
                }}
              />
              <span style={{ fontSize: 10, fontFamily: "monospace", color: "#EF4444" }}>
                LIVE • {formatDuration(callDuration)}
              </span>
            </div>
          )}
          
          {callState !== "connected" && (
            <button
              onClick={handleLogin}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid rgba(168,85,247,0.3)",
                background: "rgba(168,85,247,0.1)",
                color: "#A855F7",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              <LogIn size={12} />
              Login to Gemini First
            </button>
          )}
        </div>
      </div>

      {/* Main Call Interface */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          padding: "20px 24px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Orb */}
        <LiveOrb state={callState} aiSpeaking={aiSpeaking} />

        {/* Status Text */}
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <p
            style={{
              fontSize: 13,
              color:
                callState === "connected"
                  ? "#2FE0C8"
                  : callState === "connecting"
                  ? "#F59E0B"
                  : callState === "error"
                  ? "#EF4444"
                  : "#7A8090",
              fontFamily: "'Inter', sans-serif",
              letterSpacing: "0.03em",
              transition: "color 0.3s ease",
            }}
          >
            {statusText}
          </p>
        </div>

        {/* Call Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 20 }}>
          {/* Mute Button */}
          <button
            onClick={toggleMute}
            disabled={callState !== "connected"}
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: isMuted ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.05)",
              border: isMuted ? "1px solid rgba(239,68,68,0.4)" : "1px solid rgba(255,255,255,0.1)",
              cursor: callState === "connected" ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: callState !== "connected" ? 0.4 : 1,
              transition: "all 0.2s ease",
            }}
          >
            {isMuted ? (
              <MicOff size={18} style={{ color: "#EF4444" }} />
            ) : (
              <Mic size={18} style={{ color: "#9AA0AC" }} />
            )}
          </button>

          {/* Main Call Button */}
          <button
            onClick={handleCallButton}
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background:
                callState === "idle" || callState === "error"
                  ? "linear-gradient(135deg, #A855F7, #7C3AED)"
                  : "linear-gradient(135deg, #EF4444, #DC2626)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                callState === "idle" || callState === "error"
                  ? "0 0 30px rgba(168,85,247,0.5), 0 8px 24px rgba(168,85,247,0.3)"
                  : "0 0 30px rgba(239,68,68,0.5), 0 8px 24px rgba(239,68,68,0.3)",
              transform: "scale(1)",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            {callState === "connecting" ? (
              <Loader2 size={28} style={{ color: "#fff", animation: "spin 1.2s linear infinite" }} />
            ) : callState === "idle" || callState === "error" ? (
              <Phone size={28} style={{ color: "#fff" }} />
            ) : (
              <PhoneOff size={28} style={{ color: "#fff" }} />
            )}
          </button>

          {/* Spacer to keep alignment */}
          <div style={{ width: 48, height: 48 }} />
        </div>

        <p style={{ fontSize: 10.5, color: "#3A3F4D", fontFamily: "monospace", letterSpacing: "0.08em", marginTop: 20 }}>
          {callState === "idle"
            ? "CLICK CALL TO INITIATE LIVE CONNECTION"
            : callState === "connecting"
            ? "CONNECTING TO GEMINI..."
            : callState === "connected"
            ? "CONNECTED — AUDIO VIA SYSTEM SPEAKERS"
            : "SESSION ENDED"}
        </p>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
