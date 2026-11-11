import { Component, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js");
  });
}
class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: string | null }
> {
  state = { error: null as string | null };

  static getDerivedStateFromError(error: Error) {
    return { error: error.stack || error.message };
  }

  render() {
    if (this.state.error) {
      return (
        <pre style={{ color: "red", padding: 20, whiteSpace: "pre-wrap" }}>
          SADRED ERROR:
          {"\n"}
          {this.state.error}
        </pre>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('SadRed: element with id="root" was not found.');
}

const root = createRoot(rootElement);

root.render(
  <div style={{ padding: 20, font: "20px Arial", color: "green" }}>
    SadRed wordt geladen...
  </div>
);

import("./App")
  .then(({ default: App }) => {
    root.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
  })
  .catch((error) => {
    root.render(
      <pre style={{ color: "red", padding: 20, whiteSpace: "pre-wrap" }}>
        SADRED LOAD ERROR:
        {"\n"}
        {String(error?.stack || error)}
      </pre>
    );
  });
