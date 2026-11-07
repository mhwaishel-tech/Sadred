import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: string | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error: error.message || String(error) };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("SadRed React error:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 20, fontFamily: "Arial", color: "#b00020", whiteSpace: "pre-wrap" }}>
          <h2>SadRed – er is een fout opgetreden</h2>
          <p>{this.state.error}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  document.body.innerHTML =
    "<h2 style='padding:20px;color:#b00020'>Fout: element #root ontbreekt in index.html</h2>";
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("Service worker:", error);
    });
  });
}
