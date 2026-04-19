import { Component } from "react"

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            background: "#05050a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "16px",
            padding: "24px",
          }}
        >
          <p style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "4rem", color: "#D4FF00" }}>
            SOMETHING BROKE
          </p>
          <p style={{ fontFamily: "JetBrains Mono, monospace", color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>
            {this.state.error?.message}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              border: "1px solid rgba(212,255,0,0.3)",
              color: "#D4FF00",
              background: "none",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "14px",
              borderRadius: "999px",
              padding: "10px 24px",
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
