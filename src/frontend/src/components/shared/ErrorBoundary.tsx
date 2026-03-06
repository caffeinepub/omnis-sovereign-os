import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log error details for debugging
    console.error(
      "[Omnis] Unhandled error caught by ErrorBoundary:",
      error,
      info,
    );
  }

  handleReturn = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          data-ocid="error_boundary.panel"
          style={{
            minHeight: "100vh",
            backgroundColor: "#0a0e1a",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "monospace",
            padding: "2rem",
          }}
        >
          {/* OMNIS Wordmark */}
          <div style={{ marginBottom: "2rem", textAlign: "center" }}>
            <div
              style={{
                fontSize: "2.5rem",
                fontWeight: 700,
                letterSpacing: "0.3em",
                color: "#f59e0b",
                textTransform: "uppercase",
                lineHeight: 1,
              }}
            >
              OMNIS
            </div>
            <div
              style={{
                fontSize: "0.6rem",
                letterSpacing: "0.25em",
                color: "#475569",
                textTransform: "uppercase",
                marginTop: "0.25rem",
              }}
            >
              Sovereign OS
            </div>
          </div>

          {/* Error icon */}
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              border: "2px solid rgba(239, 68, 68, 0.4)",
              backgroundColor: "rgba(239, 68, 68, 0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1.5rem",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ef4444"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              role="img"
              aria-label="System error warning"
            >
              <title>System error warning</title>
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>

          {/* Error message */}
          <div
            style={{
              textAlign: "center",
              marginBottom: "2rem",
              maxWidth: "400px",
            }}
          >
            <p
              style={{
                fontSize: "0.7rem",
                letterSpacing: "0.2em",
                color: "#cbd5e1",
                textTransform: "uppercase",
                marginBottom: "0.5rem",
              }}
            >
              System Error
            </p>
            <p
              style={{
                fontSize: "0.65rem",
                color: "#64748b",
                letterSpacing: "0.05em",
                lineHeight: 1.6,
              }}
            >
              A system error occurred. Your session data is secure.
            </p>
          </div>

          {/* Divider */}
          <div
            style={{
              width: "120px",
              height: "1px",
              backgroundColor: "#1a2235",
              marginBottom: "2rem",
            }}
          />

          {/* Return button */}
          <button
            type="button"
            data-ocid="error_boundary.return_button"
            onClick={this.handleReturn}
            style={{
              backgroundColor: "#f59e0b",
              color: "#0a0e1a",
              border: "none",
              borderRadius: "4px",
              padding: "0.625rem 1.5rem",
              fontFamily: "monospace",
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = "#d97706";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = "#f59e0b";
            }}
          >
            Return to Hub
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
