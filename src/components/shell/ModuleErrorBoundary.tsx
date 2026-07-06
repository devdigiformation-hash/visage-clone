import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { reportLovableError } from "@/lib/lovable-error-reporting";

type Props = { children: ReactNode; label?: string };
type State = { error: Error | null };

/**
 * Module-scoped error boundary. Catches render errors inside one module
 * shell so a bug in /integrations doesn't blank out the sidebar or the
 * whole app. The root <ErrorComponent> still catches anything that escapes.
 */
export class ModuleErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    // eslint-disable-next-line no-console
    console.error(`[module:${this.props.label ?? "unknown"}]`, error);
    try {
      reportLovableError(error, {
        boundary: "module_error_boundary",
        module: this.props.label,
        componentStack: info.componentStack ?? undefined,
      });
    } catch {}
  }

  reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ flex: 1, overflow: "auto", padding: "40px 28px" }}>
        <div style={{
          maxWidth: 520, margin: "40px auto", padding: 24, borderRadius: 12,
          background: "rgba(244,63,94,0.06)", border: "1px solid rgba(244,63,94,0.35)",
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <AlertTriangle size={18} color="#F43F5E" />
            <div style={{ fontSize: 14, fontWeight: 600, color: "#F5F6F8" }}>
              {this.props.label ? `“${this.props.label}” failed to render` : "This module failed to render"}
            </div>
          </div>
          <div style={{ fontSize: 12, color: "#A0A6B2", marginBottom: 12, fontFamily: "'JetBrains Mono', monospace", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {this.state.error.message}
          </div>
          <div style={{ fontSize: 11.5, color: "#8A909C", marginBottom: 16 }}>
            The rest of the app is still working. You can try again, or navigate to another module from the sidebar.
          </div>
          <button
            onClick={this.reset}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px",
              background: "linear-gradient(180deg, rgba(47,224,200,0.18), rgba(47,224,200,0.08))",
              border: "1px solid rgba(47,224,200,0.45)", borderRadius: 8, color: "#2FE0C8",
              fontSize: 12, fontWeight: 500, cursor: "pointer",
            }}
          >
            <RefreshCw size={13} /> Try again
          </button>
        </div>
      </div>
    );
  }
}
